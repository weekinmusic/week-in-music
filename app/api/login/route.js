import { NextResponse } from "next/server";

export async function POST(req) {
  const { user, pass } = await req.json();
  const USER = process.env.BASIC_AUTH_USER;
  const PASS = process.env.BASIC_AUTH_PASS;

  if (user === USER && pass === PASS) {
    const res = NextResponse.json({ ok: true });
    // Create cookie for 7 days
    res.cookies.set("session-token", "valid", {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } else {
    return new Response("Unauthorized", { status: 401 });
  }
}
