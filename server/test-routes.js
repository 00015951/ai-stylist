/**
 * Simple route tests - run with: node test-routes.js
 * Requires server running on http://localhost:3001
 */
const BASE = "http://localhost:4444";

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    return true;
  } catch (err) {
    console.error(`❌ ${name}:`, err.message);
    return false;
  }
}

async function run() {
  console.log("Testing backend routes...\n");

  await test("GET /health", async () => {
    const r = await fetch(`${BASE}/health`);
    const data = await r.json();
    if (!r.ok || !data.ok) throw new Error(JSON.stringify(data));
  });

  await test("GET /api/styles", async () => {
    const r = await fetch(`${BASE}/api/styles`);
    const data = await r.json();
    if (!r.ok || !data.styles?.length) throw new Error(JSON.stringify(data));
  });

  await test("GET /api/weather?city=Tashkent", async () => {
    const r = await fetch(`${BASE}/api/weather?city=Tashkent`);
    const data = await r.json();
    if (!r.ok) throw new Error(JSON.stringify(data));
  });

  await test("POST /api/auth/telegram (invalid initData)", async () => {
    const r = await fetch(`${BASE}/api/auth/telegram`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: "invalid" }),
    });
    if (r.status !== 401) throw new Error(`Expected 401, got ${r.status}`);
  });

  await test("POST /api/generate-style (no auth)", async () => {
    const r = await fetch(`${BASE}/api/generate-style`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ occasion: "date night" }),
    });
    if (r.status !== 401) throw new Error(`Expected 401, got ${r.status}`);
  });

  await test("GET /api/user/profile (no auth)", async () => {
    const r = await fetch(`${BASE}/api/user/profile`);
    if (r.status !== 401) throw new Error(`Expected 401, got ${r.status}`);
  });

  await test("GET /api/wardrobe (no auth)", async () => {
    const r = await fetch(`${BASE}/api/wardrobe`);
    if (r.status !== 401) throw new Error(`Expected 401, got ${r.status}`);
  });

  console.log("\nAll tests done.");
}

run().catch((e) => {
  console.error("Test runner failed:", e);
  process.exit(1);
});
