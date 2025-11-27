const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../../");

const mime = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".php": "text/html",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".mp4": "video/mp4",
};

const server = http.createServer((req, res) => {
  const u = new URL(req.url || "/", "http://localhost:8080");
  const filePath = path.join(root, u.pathname.replace(/^\//, ""));
  if (fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      const indexPath = path.join(filePath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.writeHead(200, { "Content-Type": "text/html" });
        fs.createReadStream(indexPath).pipe(res);
      } else {
        res.writeHead(403);
        res.end("Directory listing forbidden");
      }
      return;
    }
    const ext = path.extname(filePath);
    const type = mime[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(8080, () => {
  console.log("Static server on http://localhost:8080");
});
