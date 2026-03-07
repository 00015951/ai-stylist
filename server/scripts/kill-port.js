/**
 * Kill process using given port (Windows compatible)
 * Usage: node scripts/kill-port.js [port]
 * Default port: 3001
 */
import { execSync } from "child_process";
import { platform } from "os";

const port = process.argv[2] || "3001";

function killWindows(port) {
  try {
    const out = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8" });
    const lines = out.trim().split("\n").filter((l) => l.includes("LISTENING"));
    const pids = [...new Set(lines.map((l) => l.trim().split(/\s+/).pop()).filter(Boolean))];
    for (const pid of pids) {
      execSync(`taskkill /PID ${pid} /F`, { stdio: "inherit" });
      console.log(`Killed PID ${pid} (port ${port})`);
    }
    if (pids.length === 0) console.log(`No process found on port ${port}`);
  } catch (e) {
    if (e.status === 1 || e.killed) console.log(`No process found on port ${port}`);
    else throw e;
  }
}

function killUnix(port) {
  try {
    execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: "inherit" });
    console.log(`Killed process on port ${port}`);
  } catch (e) {
    if (e.status === 1) console.log(`No process found on port ${port}`);
    else throw e;
  }
}

if (platform() === "win32") {
  killWindows(port);
} else {
  killUnix(port);
}
