import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

// Handles GET requests to /api/week
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "week.json");
    const fileContents = fs.readFileSync(filePath, "utf8");
    const jsonData = JSON.parse(fileContents);
    return NextResponse.json(jsonData);
  } catch (error) {
    console.error("Error reading week.json:", error);
    return NextResponse.json(
      { error: "Failed to read week.json file." },
      { status: 500 }
    );
  }
}

// Handles POST requests to update week.json (optional — used by admin)
export async function POST(req) {
  try {
    const body = await req.json();
    const filePath = path.join(process.cwd(), "data", "week.json");

    fs.writeFileSync(filePath, JSON.stringify(body, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error writing week.json:", error);
    return NextResponse.json(
      { error: "Failed to write week.json file." },
      { status: 500 }
    );
  }
}
