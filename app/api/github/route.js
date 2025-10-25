import { NextResponse } from "next/server";

const GH_TOKEN = process.env.GH_TOKEN;
const GH_REPO = process.env.GH_REPO;
const GH_FILE_PATH = process.env.GH_FILE_PATH || "data/week.json";

// --- Diagnostic check ---
if (!GH_TOKEN || !GH_REPO || !GH_FILE_PATH) {
  console.error("❌ Missing GitHub environment variables:", {
    GH_TOKEN: !!GH_TOKEN,
    GH_REPO: GH_REPO,
    GH_FILE_PATH: GH_FILE_PATH,
  });
  return NextResponse.json(
    { error: "Missing one or more GH_* environment variables" },
    { status: 500 }
  );
}

export async function GET(req) {
  // For “Test GitHub Connection”
  if (!GH_TOKEN || !GH_REPO) {
    return NextResponse.json({ error: "Missing GitHub env vars" }, { status: 500 });
  }

  const res = await fetch(
    `https://api.github.com/repos/${GH_REPO}/contents/${GH_FILE_PATH}`,
    {
      headers: { Authorization: `token ${GH_TOKEN}` },
    }
  );

  if (!res.ok) {
    const msg = await res.text();
    return NextResponse.json({ error: msg }, { status: res.status });
  }

  const json = await res.json();
  return NextResponse.json({ ok: true, file: json.name });
}

export async function POST(req) {
  if (!GH_TOKEN || !GH_REPO)
    return NextResponse.json({ error: "Missing GitHub env vars" }, { status: 500 });

  const body = await req.json();
  const content = Buffer.from(JSON.stringify(body.data, null, 2)).toString("base64");

  // Get current file SHA so GitHub lets us update it
  const get = await fetch(
    `https://api.github.com/repos/${GH_REPO}/contents/${GH_FILE_PATH}`,
    { headers: { Authorization: `token ${GH_TOKEN}` } }
  );
  const meta = await get.json();

  const res = await fetch(
    `https://api.github.com/repos/${GH_REPO}/contents/${GH_FILE_PATH}`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${GH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Update week.json from admin",
        content,
        sha: meta.sha,
      }),
    }
  );

  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
