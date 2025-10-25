import { NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_FILE_PATH = process.env.GITHUB_FILE_PATH || "data/week.json";

export async function GET(req) {
  // For “Test GitHub Connection”
  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return NextResponse.json({ error: "Missing GitHub env vars" }, { status: 500 });
  }

  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`,
    {
      headers: { Authorization: `token ${GITHUB_TOKEN}` },
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
  if (!GITHUB_TOKEN || !GITHUB_REPO)
    return NextResponse.json({ error: "Missing GitHub env vars" }, { status: 500 });

  const body = await req.json();
  const content = Buffer.from(JSON.stringify(body.data, null, 2)).toString("base64");

  // Get current file SHA so GitHub lets us update it
  const get = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`,
    { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
  );
  const meta = await get.json();

  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
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
