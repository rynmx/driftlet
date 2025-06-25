import { NextResponse } from "next/server";
import { initializeDatabase, seedDatabase } from "@/lib/setup";

export async function POST() {
  try {
    console.log("starting database setup from API...");
    await initializeDatabase();
    await seedDatabase();
    console.log("database setup from API complete.");
    return NextResponse.json({ message: "Setup complete" });
  } catch (error) {
    console.error("error setting up database from API:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
