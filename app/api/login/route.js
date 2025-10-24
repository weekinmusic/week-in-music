import { NextResponse } from "next/server";

export async function POST(req) {
  const { user, pass } = await req.json();

  const USER = process.env.BASIC_AUTH_USER;
  const PASS = process.env.BASIC_AUTH_PASS;

  console.log("🧩 Checking credentials:", user, pass, USER, PASS ? "[PASS PRESENT]" : "[NO PASS]");

  if (user === USER && pass === PASS) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("session-token", "valid", {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return res;
  }

  return new Response("Invalid credentials", { status: 401 });
}
