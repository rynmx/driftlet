import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  checkDatabaseHealth,
  getQueryMetrics,
  getPerformanceSummary,
  resetQueryMetrics,
  flushMetricsToDatabase,
  getQueryMetricsFromDatabase,
} from "@/lib/db";

// GET database statistics and performance metrics
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const [health, summary, memoryMetrics, dbMetrics] = await Promise.all([
      checkDatabaseHealth(),
      getPerformanceSummary(),
      getQueryMetrics(),
      getQueryMetricsFromDatabase(),
    ]);

    return NextResponse.json({
      health,
      performance: summary,
      queryMetrics: {
        memory: memoryMetrics.slice(0, 10), // Top 10 in-memory metrics
        database: dbMetrics.slice(0, 20), // Top 20 database metrics
        combined: [...memoryMetrics, ...dbMetrics]
          .sort((a, b) => b.totalTime - a.totalTime)
          .slice(0, 20), // Top 20 combined
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to fetch database stats:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}

// POST to reset query metrics
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { action } = await req.json();

    if (action === "reset-metrics") {
      resetQueryMetrics();
      return NextResponse.json({
        success: true,
        message: "In-memory query metrics reset successfully",
      });
    }

    if (action === "flush-metrics") {
      await flushMetricsToDatabase();
      return NextResponse.json({
        success: true,
        message: "Metrics flushed to database successfully",
      });
    }

    return NextResponse.json(
      { error: "invalid action. Use 'reset-metrics' or 'flush-metrics'" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Failed to process database stats action:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}
