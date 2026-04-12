// Simple static file server for SmartHire dist build
// Uses only Node.js built-in modules — no npm install needed
const http = require("http");
const fs = require("fs");
const path = require("path");

const DIST = path.join(__dirname, "dist");
const PORT = 3000;
const FLAG = path.join(__dirname, "server-running.flag");

const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

http
  .createServer((req, res) => {
    const urlPath = req.url.split("?")[0];
    let filePath = path.join(DIST, urlPath === "/" ? "index.html" : urlPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(DIST, "index.html");
    }
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || "application/octet-stream";
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      res.writeHead(200, { "Content-Type": mime });
      res.end(data);
    });
  })
  .listen(PORT, "127.0.0.1", () => {
    fs.writeFileSync(
      FLAG,
      `running on port ${PORT} at ${new Date().toISOString()}`,
    );
    console.log(`\n✅  SmartHire is running at http://localhost:${PORT}\n`);
  });
