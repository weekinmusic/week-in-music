// app/api/login/route.js
import { NextResponse } from "next/server";
import crypto from "node:crypto";

export const runtime = "nodejs";

const norm = (s) => (s ?? "").trim(); // remove stray spaces/newlines

function safeEqual(a, b) {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  if (A.length !== B.length) return false;
  return crypto.timingSafeEqual(A, B);
}

export async function POST(req) {
  const { user = "", pass = "" } = await req.json();

  const USER = norm(process.env.BASIC_AUTH_USER);
  const PASS = norm(process.env.BASIC_AUTH_PASS);

  if (!USER || !PASS) {
    return new Response("Server missing BASIC_AUTH_USER or BASIC_AUTH_PASS", { status: 500 });
  }

  const ok = safeEqual(norm(user), USER) && safeEqual(norm(pass), PASS);
  if (!ok) {
    // Deliberately generic error to avoid leaking which field failed
    return new Response("Invalid credentials", { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("session-token", "valid", {
    httpOnly: true,
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}
