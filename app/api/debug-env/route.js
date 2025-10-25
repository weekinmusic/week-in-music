export const runtime = "nodejs"; // ensure Node runtime

export async function GET() {
  const u = process.env.BASIC_AUTH_USER;
  const p = process.env.BASIC_AUTH_PASS;
  const info = {
    hasUser: Boolean(u),
    hasPass: Boolean(p),
    userLength: u ? u.trim().length : 0,
    passLength: p ? p.trim().length : 0,
    // Which deployment are we on?
    vercelEnv: process.env.VERCEL_ENV || "unknown", // development | preview | production
  };
  return new Response(JSON.stringify(info, null, 2), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
