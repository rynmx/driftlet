import { Pool, PoolConfig, PoolClient } from "pg";
import { initializeDatabase } from "./setup";

// Performance monitoring types
interface QueryMetrics {
  name: string;
  count: number;
  totalTime: number;
  avgTime: number;
  maxTime: number;
  minTime: number;
  slowQueries: number; // queries > 1000ms
}

interface QueryMetricsHistory {
  query_name: string;
  count: number;
  total_time: number;
  avg_time: number;
  max_time: number;
  min_time: number;
  slow_queries: number;
  flush_timestamp: string;
}

// Global performance tracking
const queryMetrics = new Map<string, Omit<QueryMetrics, "avgTime">>();
const SLOW_QUERY_THRESHOLD = parseInt(
  process.env.SLOW_QUERY_THRESHOLD_MS || "1000",
  10,
);

// Auto-initialization state and configuration
let isInitializing = false;
const AUTO_INITIALIZE_ENABLED = process.env.DB_AUTO_INITIALIZE !== "false"; // Enabled by default, can be explicitly disabled

/**
 * Check if an error is a PostgreSQL schema-related error (missing table or column).
 * @param error - The error to check
 * @returns true if the error indicates a missing table or column
 */
function isSchemaError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error.code === "42P01" || error.code === "42703")
  );
}

/**
 * Check if auto-initialization should be attempted.
 * @returns true if auto-initialization is enabled and not already in progress
 */
function shouldAutoInitialize(): boolean {
  return AUTO_INITIALIZE_ENABLED && !isInitializing;
}
const METRICS_FLUSH_INTERVAL = parseInt(
  process.env.METRICS_FLUSH_INTERVAL_MS || "300000",
  10,
); // 5 minutes default

// Flush timer
let flushTimer: NodeJS.Timeout | null = null;

// Type definition for the global variable to avoid TypeScript errors.
declare const global: typeof globalThis & {
  dbPool: Pool;
};

let pool: Pool;

// Centralized configuration for the database pool.
const config: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.POSTGRES_SSL_ENABLED === "true"
      ? { rejectUnauthorized: false } // Required for platforms like Railway
      : undefined,
  max: parseInt(process.env.DB_POOL_MAX_CONNECTIONS || "20", 10),
  min: parseInt(process.env.DB_POOL_MIN_CONNECTIONS || "2", 10),
  connectionTimeoutMillis: parseInt(
    process.env.DB_CONNECTION_TIMEOUT_MS || "5000",
    10,
  ),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || "30000", 10),
  query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT_MS || "30000", 10),
  statement_timeout: parseInt(
    process.env.DB_STATEMENT_TIMEOUT_MS || "60000",
    10,
  ),
  allowExitOnIdle: true,
};

if (process.env.NODE_ENV === "production") {
  // In production, create a new pool.
  pool = new Pool(config);
} else {
  // In development, use a global variable to preserve the pool across hot reloads.
  if (!global.dbPool) {
    global.dbPool = new Pool(config);
  }
  pool = global.dbPool;
}

export const db = pool;

// Initialize metrics auto-flush in production
if (process.env.NODE_ENV === "production") {
  // Start auto-flush after a short delay to ensure database is ready
  setTimeout(() => {
    startMetricsAutoFlush();
  }, 10000); // 10 second delay
}

/**
 * Track query performance metrics
 */
function trackQueryPerformance(queryName: string, duration: number) {
  if (!queryName) return;

  const existing = queryMetrics.get(queryName);
  if (existing) {
    existing.count++;
    existing.totalTime += duration;
    existing.maxTime = Math.max(existing.maxTime, duration);
    existing.minTime = Math.min(existing.minTime, duration);
    if (duration > SLOW_QUERY_THRESHOLD) {
      existing.slowQueries++;
    }
  } else {
    queryMetrics.set(queryName, {
      name: queryName,
      count: 1,
      totalTime: duration,
      maxTime: duration,
      minTime: duration,
      slowQueries: duration > SLOW_QUERY_THRESHOLD ? 1 : 0,
    });
  }
}

/**
 * Utility function to handle database connections with automatic cleanup and schema auto-initialization.
 * This reduces code duplication and ensures connections are always properly released.
 * Automatically initializes the database schema if missing tables or columns are detected.
 *
 * @param operation - A function that receives a database client and returns a Promise
 * @param queryName - Optional name for performance monitoring
 * @returns Promise that resolves to the result of the operation
 */
export async function withDbConnection<T>(
  operation: (client: PoolClient) => Promise<T>,
  queryName?: string,
): Promise<T> {
  const startTime = Date.now();
  const client = await db.connect();

  try {
    const result = await operation(client);

    // Track performance metrics
    const duration = Date.now() - startTime;
    if (queryName) {
      trackQueryPerformance(queryName, duration);
    }

    // Log slow queries
    if (duration > SLOW_QUERY_THRESHOLD) {
      console.warn(
        `Slow query detected: ${queryName || "unnamed"} took ${duration}ms`,
      );
    }

    return result;
  } catch (error) {
    // Check if this is a schema-related error and auto-initialization is enabled
    if (isSchemaError(error) && shouldAutoInitialize()) {
      const errorCode = (error as { code: string }).code;
      console.log(
        `Schema error detected (${errorCode}), attempting auto-initialization...`,
      );

      try {
        isInitializing = true;
        await initializeDatabase();
        console.log(
          "Database auto-initialization completed, retrying operation...",
        );

        // Retry the operation once after initialization
        const retryResult = await operation(client);

        // Track performance metrics for the retry
        const duration = Date.now() - startTime;
        if (queryName) {
          trackQueryPerformance(queryName, duration);
        }

        return retryResult;
      } catch (initError) {
        console.error("Database auto-initialization failed:", initError);
        throw error; // Throw the original error, not the init error
      } finally {
        isInitializing = false;
      }
    }

    // Re-throw the original error for non-schema errors or if auto-init is disabled
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Utility function for database transactions with automatic rollback on errors.
 * Handles BEGIN/COMMIT/ROLLBACK automatically and ensures proper cleanup.
 *
 * @param operations - A function that receives a database client and performs transactional operations
 * @param transactionName - Optional name for performance monitoring
 * @returns Promise that resolves to the result of the operations
 */
export async function withDbTransaction<T>(
  operations: (client: PoolClient) => Promise<T>,
  transactionName?: string,
): Promise<T> {
  return withDbConnection(async (client) => {
    try {
      await client.query("BEGIN");
      const result = await operations(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      if (transactionName) {
        console.error(`Transaction failed: ${transactionName}`, error);
      }
      throw error;
    }
  }, transactionName);
}

/**
 * Get current connection pool statistics for monitoring.
 * Useful for debugging connection issues and monitoring pool health.
 *
 * @returns Object containing pool statistics
 */
export function getPoolStats() {
  return {
    totalCount: db.totalCount,
    idleCount: db.idleCount,
    waitingCount: db.waitingCount,
    maxConnections: parseInt(process.env.DB_POOL_MAX_CONNECTIONS || "20", 10),
    minConnections: parseInt(process.env.DB_POOL_MIN_CONNECTIONS || "2", 10),
    connectionTimeoutMs: parseInt(
      process.env.DB_CONNECTION_TIMEOUT_MS || "5000",
      10,
    ),
    idleTimeoutMs: parseInt(process.env.DB_IDLE_TIMEOUT_MS || "30000", 10),
  };
}

/**
 * Check database connection health.
 * Performs a simple query to verify the database is accessible.
 *
 * @returns Promise that resolves to health status
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latency?: number;
  error?: string;
  poolStats: ReturnType<typeof getPoolStats>;
}> {
  const startTime = Date.now();
  const poolStats = getPoolStats();

  try {
    await withDbConnection(async (client) => {
      await client.query("SELECT 1");
    }, "health-check");

    return {
      healthy: true,
      latency: Date.now() - startTime,
      poolStats,
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : "Unknown error",
      poolStats,
    };
  }
}

/**
 * Get query performance metrics for monitoring and optimization.
 *
 * @returns Array of query metrics with calculated averages
 */
export function getQueryMetrics(): QueryMetrics[] {
  return Array.from(queryMetrics.values())
    .map((metric) => ({
      ...metric,
      avgTime:
        metric.count > 0 ? Math.round(metric.totalTime / metric.count) : 0,
    }))
    .sort((a, b) => b.totalTime - a.totalTime); // Sort by total time descending
}

/**
 * Reset query performance metrics.
 * Useful for clearing metrics after analysis or at regular intervals.
 */
export function resetQueryMetrics(): void {
  queryMetrics.clear();
}

/**
 * Flush current in-memory metrics to database.
 * This saves current metrics to both current and historical tables.
 */
export async function flushMetricsToDatabase(): Promise<void> {
  if (queryMetrics.size === 0) {
    return; // Nothing to flush
  }

  const metricsToFlush = Array.from(queryMetrics.values()).map((metric) => ({
    ...metric,
    avgTime: metric.count > 0 ? Math.round(metric.totalTime / metric.count) : 0,
  }));

  await withDbTransaction(async (client) => {
    const flushTimestamp = new Date();

    // Insert into history table for long-term storage
    for (const metric of metricsToFlush) {
      await client.query(
        `
        INSERT INTO query_metrics_history
        (query_name, count, total_time, avg_time, max_time, min_time, slow_queries, flush_timestamp)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
        [
          metric.name,
          metric.count,
          metric.totalTime,
          metric.avgTime,
          metric.maxTime,
          metric.minTime,
          metric.slowQueries,
          flushTimestamp,
        ],
      );
    }

    // Update or insert into current metrics table (for latest aggregated data)
    for (const metric of metricsToFlush) {
      await client.query(
        `
        INSERT INTO query_metrics
        (query_name, count, total_time, max_time, min_time, slow_queries, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (query_name) DO UPDATE SET
          count = query_metrics.count + EXCLUDED.count,
          total_time = query_metrics.total_time + EXCLUDED.total_time,
          max_time = GREATEST(query_metrics.max_time, EXCLUDED.max_time),
          min_time = LEAST(query_metrics.min_time, EXCLUDED.min_time),
          slow_queries = query_metrics.slow_queries + EXCLUDED.slow_queries,
          updated_at = NOW()
      `,
        [
          metric.name,
          metric.count,
          metric.totalTime,
          metric.maxTime,
          metric.minTime,
          metric.slowQueries,
        ],
      );
    }
  }, "flushMetricsToDatabase");

  // Clear in-memory metrics after successful flush
  queryMetrics.clear();
  console.log(`Flushed ${metricsToFlush.length} query metrics to database`);
}

/**
 * Start automatic periodic flushing of metrics to database.
 * This should be called when the application starts.
 */
export function startMetricsAutoFlush(): void {
  if (flushTimer) {
    return; // Already started
  }

  flushTimer = setInterval(async () => {
    try {
      await flushMetricsToDatabase();
    } catch (error) {
      console.error("Failed to auto-flush metrics to database:", error);
    }
  }, METRICS_FLUSH_INTERVAL);

  console.log(
    `Started automatic metrics flushing every ${METRICS_FLUSH_INTERVAL / 1000} seconds`,
  );
}

/**
 * Stop automatic periodic flushing of metrics.
 * This should be called when the application shuts down.
 */
export function stopMetricsAutoFlush(): void {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
    console.log("Stopped automatic metrics flushing");
  }
}

/**
 * Get query metrics from database (aggregated current data).
 * This combines in-memory metrics with persisted database metrics.
 */
export async function getQueryMetricsFromDatabase(): Promise<QueryMetrics[]> {
  return withDbConnection(async (client) => {
    const result = await client.query(`
      SELECT
        query_name as name,
        count,
        total_time as "totalTime",
        CASE WHEN count > 0 THEN ROUND(total_time::float / count) ELSE 0 END as "avgTime",
        max_time as "maxTime",
        min_time as "minTime",
        slow_queries as "slowQueries"
      FROM query_metrics
      ORDER BY total_time DESC
    `);
    return result.rows;
  }, "getQueryMetricsFromDatabase");
}

/**
 * Get historical query metrics for analysis.
 * Useful for tracking performance trends over time.
 */
export async function getQueryMetricsHistory(
  queryName?: string,
  hoursBack: number = 24,
): Promise<QueryMetricsHistory[]> {
  return withDbConnection(async (client) => {
    let query = `
      SELECT
        query_name,
        count,
        total_time,
        avg_time,
        max_time,
        min_time,
        slow_queries,
        flush_timestamp
      FROM query_metrics_history
      WHERE flush_timestamp > NOW() - INTERVAL '${hoursBack} hours'
    `;

    const params: string[] = [];
    if (queryName) {
      query += ` AND query_name = $1`;
      params.push(queryName);
    }

    query += ` ORDER BY flush_timestamp DESC`;

    const result = await client.query(query, params);
    return result.rows;
  }, "getQueryMetricsHistory");
}

/**
 * Get performance summary with key insights.
 * Combines in-memory and database metrics for complete picture.
 *
 * @returns Performance summary object
 */
export async function getPerformanceSummary() {
  const [memoryMetrics, dbMetrics] = await Promise.all([
    Promise.resolve(getQueryMetrics()),
    getQueryMetricsFromDatabase().catch(() => []), // Fallback to empty array if DB unavailable
  ]);

  // Combine memory and database metrics
  const allMetrics = [...memoryMetrics];

  // Add database metrics that aren't already in memory
  for (const dbMetric of dbMetrics) {
    const existingIndex = allMetrics.findIndex((m) => m.name === dbMetric.name);
    if (existingIndex >= 0) {
      // Combine with existing memory metric
      const existing = allMetrics[existingIndex];
      allMetrics[existingIndex] = {
        name: existing.name,
        count: existing.count + dbMetric.count,
        totalTime: existing.totalTime + dbMetric.totalTime,
        avgTime: Math.round(
          (existing.totalTime + dbMetric.totalTime) /
            (existing.count + dbMetric.count),
        ),
        maxTime: Math.max(existing.maxTime, dbMetric.maxTime),
        minTime: Math.min(existing.minTime, dbMetric.minTime),
        slowQueries: existing.slowQueries + dbMetric.slowQueries,
      };
    } else {
      // Add database metric
      allMetrics.push(dbMetric);
    }
  }

  // Sort by total time descending
  allMetrics.sort((a, b) => b.totalTime - a.totalTime);

  const totalQueries = allMetrics.reduce((sum, m) => sum + m.count, 0);
  const totalTime = allMetrics.reduce((sum, m) => sum + m.totalTime, 0);
  const slowQueries = allMetrics.reduce((sum, m) => sum + m.slowQueries, 0);

  return {
    totalQueries,
    totalTime,
    avgQueryTime: totalQueries > 0 ? Math.round(totalTime / totalQueries) : 0,
    slowQueries,
    slowQueryPercentage:
      totalQueries > 0 ? Math.round((slowQueries / totalQueries) * 100) : 0,
    uniqueQueries: allMetrics.length,
    slowestQuery: allMetrics.length > 0 ? allMetrics[0] : null,
    poolStats: getPoolStats(),
    inMemoryMetrics: memoryMetrics.length,
    databaseMetrics: dbMetrics.length,
  };
}
