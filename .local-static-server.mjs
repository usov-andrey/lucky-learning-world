import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".mjs": "text/javascript", ".svg": "image/svg+xml", ".mp3": "audio/mpeg", ".png": "image/png" };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const full = path.join(root, p);
  fs.readFile(full, (err, data) => {
    if (err) { res.writeHead(404); res.end("not found"); return; }
    const ext = path.extname(full);
    res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(8934, () => console.log("listening on 8934"));
