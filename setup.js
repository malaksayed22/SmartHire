// Setup script — writes results to setup-log.txt
const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const LOG = path.join(__dirname, "setup-log.txt");
const log = (msg) => {
  fs.appendFileSync(LOG, msg + "\n");
  console.log(msg);
};

fs.writeFileSync(LOG, "");
log("=== SmartHire Setup ===");
log(new Date().toISOString());

try {
  const nodeVer = process.version;
  log("Node: " + nodeVer);
} catch (e) {
  log("Node error: " + e.message);
}

try {
  const npmVer = execSync("npm --version", { encoding: "utf8" }).trim();
  log("npm: " + npmVer);
} catch (e) {
  log("npm error: " + e.message);
}

const nodeModules = path.join(__dirname, "node_modules");
if (fs.existsSync(nodeModules)) {
  log("node_modules: EXISTS");
} else {
  log("node_modules: MISSING — running npm install...");
  try {
    execSync("npm install", { cwd: __dirname, stdio: "inherit" });
    log("npm install: DONE");
  } catch (e) {
    log("npm install FAILED: " + e.message);
  }
}

log("Starting server on port 3000...");
const http = require("http");
const DIST = path.join(__dirname, "dist");
const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};
http
  .createServer((req, res) => {
    let p = req.url.split("?")[0];
    let fp = path.join(DIST, p === "/" ? "index.html" : p);
    if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory())
      fp = path.join(DIST, "index.html");
    const mime =
      MIME[path.extname(fp).toLowerCase()] || "application/octet-stream";
    fs.readFile(fp, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      res.writeHead(200, { "Content-Type": mime });
      res.end(data);
    });
  })
  .listen(3000, "127.0.0.1", () => {
    log("Server ready: http://localhost:3000");
  });
