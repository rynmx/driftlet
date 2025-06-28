"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  FiRefreshCw,
  FiTrash2,
  FiDatabase,
  FiActivity,
  FiUsers,
} from "react-icons/fi";

interface SlowQuery {
  query: string;
  time: number;
  timestamp: string;
}

interface DbStats {
  health: {
    healthy: boolean;
    latency?: number;
    error?: string;
    poolStats: {
      totalCount: number;
      idleCount: number;
      waitingCount: number;
      maxConnections: number;
      minConnections: number;
    };
  };
  performance: {
    totalQueries: number;
    totalTime: number;
    avgQueryTime: number;
    slowQueries: number;
    slowQueryPercentage: number;
    uniqueQueries: number;
    slowestQuery: SlowQuery | null;
  };
  queryMetrics: {
    memory: Array<{
      name: string;
      count: number;
      totalTime: number;
      avgTime: number;
      maxTime: number;
      minTime: number;
      slowQueries: number;
    }>;
    database: Array<{
      name: string;
      count: number;
      totalTime: number;
      avgTime: number;
      maxTime: number;
      minTime: number;
      slowQueries: number;
    }>;
    combined: Array<{
      name: string;
      count: number;
      totalTime: number;
      avgTime: number;
      maxTime: number;
      minTime: number;
      slowQueries: number;
    }>;
  };
  timestamp: string;
}

export default function DatabaseStatsPage() {
  const router = useRouter();
  const { status } = useSession();
  const [stats, setStats] = useState<DbStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "combined" | "memory" | "database"
  >("combined");

  // Move all hooks before any conditional logic
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/db-stats");
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const resetMetrics = async () => {
    try {
      const response = await fetch("/api/admin/db-stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset-metrics" }),
      });
      if (!response.ok) {
        throw new Error("Failed to reset metrics");
      }
      await fetchStats(); // Refresh stats
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  // Handle conditional rendering after all hooks
  if (status === "loading") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <p>loading...</p>
      </main>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (loading && !stats) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <p>loading database statistics...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center p-8 sm:p-24">
        <div className="w-full max-w-2xl">
          <div className="border border-red-500 bg-red-50 dark:bg-red-900/20 p-4 mb-4">
            <p className="text-red-700 dark:text-red-300 text-sm">
              error: {error}
            </p>
          </div>
          <button
            onClick={fetchStats}
            className="p-2 font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-80 transition-opacity"
          >
            retry
          </button>
        </div>
      </main>
    );
  }

  if (!stats) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <p>no data available</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <h1 className="text-2xl font-bold text-center sm:text-left text-black dark:text-white">
            database statistics
          </h1>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={fetchStats}
              className="p-2 font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-80 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={loading}
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
              {loading ? "refreshing..." : "refresh"}
            </button>
            <button
              onClick={resetMetrics}
              className="p-2 font-bold border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <FiTrash2 />
              reset metrics
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Health Status */}
          <fieldset className="border border-black dark:border-gray-700 p-4">
            <legend className="text-lg font-semibold px-2 text-black dark:text-white flex items-center gap-2">
              <FiActivity />
              database health
            </legend>
            <div
              className={`text-lg font-bold mb-2 ${stats.health.healthy ? "text-green-600" : "text-red-600"}`}
            >
              {stats.health.healthy ? "healthy" : "unhealthy"}
            </div>
            {stats.health.latency && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                latency: {stats.health.latency}ms
              </p>
            )}
            {stats.health.error && (
              <p className="text-sm text-red-600 dark:text-red-400">
                error: {stats.health.error}
              </p>
            )}
          </fieldset>

          {/* Connection Pool */}
          <fieldset className="border border-black dark:border-gray-700 p-4">
            <legend className="text-lg font-semibold px-2 text-black dark:text-white flex items-center gap-2">
              <FiUsers />
              pool
            </legend>
            <div className="space-y-1 text-sm text-black dark:text-white">
              <div>active: {stats.health.poolStats.totalCount}</div>
              <div>idle: {stats.health.poolStats.idleCount}</div>
              <div>waiting: {stats.health.poolStats.waitingCount}</div>
              <div>max: {stats.health.poolStats.maxConnections}</div>
            </div>
          </fieldset>

          {/* Performance Summary */}
          <fieldset className="border border-black dark:border-gray-700 p-4 sm:col-span-2 lg:col-span-1">
            <legend className="text-lg font-semibold px-2 text-black dark:text-white flex items-center gap-2">
              <FiDatabase />
              summary
            </legend>
            <div className="space-y-1 text-sm text-black dark:text-white">
              <div>total queries: {stats.performance.totalQueries}</div>
              <div>avg time: {stats.performance.avgQueryTime}ms</div>
              <div>
                slow queries: {stats.performance.slowQueries} (
                {stats.performance.slowQueryPercentage}%)
              </div>
              <div>unique queries: {stats.performance.uniqueQueries}</div>
            </div>
          </fieldset>
        </div>

        {/* Query Metrics Table */}
        <fieldset className="border border-black dark:border-gray-700 p-4">
          <legend className="text-lg font-semibold px-2 text-black dark:text-white">
            query performance metrics
          </legend>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setActiveTab("combined")}
                className={`px-3 py-1 text-sm border transition-colors ${
                  activeTab === "combined"
                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                    : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-black dark:hover:border-white"
                }`}
              >
                combined
              </button>
              <button
                onClick={() => setActiveTab("memory")}
                className={`px-3 py-1 text-sm border transition-colors ${
                  activeTab === "memory"
                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                    : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-black dark:hover:border-white"
                }`}
              >
                memory ({stats.queryMetrics.memory.length})
              </button>
              <button
                onClick={() => setActiveTab("database")}
                className={`px-3 py-1 text-sm border transition-colors ${
                  activeTab === "database"
                    ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                    : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-black dark:hover:border-white"
                }`}
              >
                database ({stats.queryMetrics.database.length})
              </button>
            </div>
          </div>
          {/* Mobile-first responsive layout */}
          <div className="space-y-3 sm:space-y-0">
            {/* Mobile card layout */}
            <div className="block sm:hidden space-y-3">
              {stats.queryMetrics[activeTab].map((metric) => (
                <div
                  key={metric.name}
                  className="border border-gray-300 dark:border-gray-600 p-3"
                >
                  <div className="font-medium text-black dark:text-white mb-2 text-sm">
                    {metric.name}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        count:
                      </span>{" "}
                      <span className="text-black dark:text-white">
                        {metric.count}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        avg:
                      </span>{" "}
                      <span className="text-black dark:text-white">
                        {metric.avgTime}ms
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        total:
                      </span>{" "}
                      <span className="text-black dark:text-white">
                        {metric.totalTime}ms
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        max:
                      </span>{" "}
                      <span className="text-black dark:text-white">
                        {metric.maxTime}ms
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        slow queries:
                      </span>{" "}
                      <span
                        className={
                          metric.slowQueries > 0
                            ? "text-red-600 dark:text-red-400 font-medium"
                            : "text-black dark:text-white"
                        }
                      >
                        {metric.slowQueries}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table layout */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-black dark:border-gray-700">
                    <th className="px-2 py-2 text-left text-xs font-medium text-black dark:text-white uppercase tracking-wider">
                      query name
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-black dark:text-white uppercase tracking-wider">
                      count
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-black dark:text-white uppercase tracking-wider">
                      total time (ms)
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-black dark:text-white uppercase tracking-wider">
                      avg time (ms)
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-black dark:text-white uppercase tracking-wider">
                      max time (ms)
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-black dark:text-white uppercase tracking-wider">
                      slow queries
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.queryMetrics[activeTab].map((metric, index) => (
                    <tr
                      key={metric.name}
                      className={
                        index % 2 === 0 ? "" : "bg-gray-50 dark:bg-gray-800"
                      }
                    >
                      <td className="px-2 py-2 text-sm font-medium text-black dark:text-white">
                        {metric.name}
                      </td>
                      <td className="px-2 py-2 text-sm text-gray-600 dark:text-gray-400">
                        {metric.count}
                      </td>
                      <td className="px-2 py-2 text-sm text-gray-600 dark:text-gray-400">
                        {metric.totalTime}
                      </td>
                      <td className="px-2 py-2 text-sm text-gray-600 dark:text-gray-400">
                        {metric.avgTime}
                      </td>
                      <td className="px-2 py-2 text-sm text-gray-600 dark:text-gray-400">
                        {metric.maxTime}
                      </td>
                      <td className="px-2 py-2 text-sm text-gray-600 dark:text-gray-400">
                        <span
                          className={
                            metric.slowQueries > 0
                              ? "text-red-600 dark:text-red-400 font-medium"
                              : ""
                          }
                        >
                          {metric.slowQueries}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </fieldset>

        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
          last updated: {new Date(stats.timestamp).toLocaleString()}
        </div>
      </div>
    </main>
  );
}
