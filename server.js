// Local preview server: node server.js  ->  http://localhost:8080
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = __dirname, PORT = process.env.PORT || 8080;
const ROUTES = {
  '/hubspot-implementation': 'growlyze-hubspot-implementation.html',
  '/hubspot-migration': 'growlyze-hubspot-migration.html',
  '/hubspot-onboarding': 'growlyze-hubspot-onboarding.html',
};
const TYPES = { '.html': 'text/html; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp',
  '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]).replace(/\/+$/, '') || '/';
  if (url === '/') {
    res.writeHead(200, { 'Content-Type': TYPES['.html'] });
    return res.end(`<!doctype html><meta charset="utf-8"><title>Growlyze pages</title><body style="font:16px system-ui;padding:40px">
      <h1>Growlyze landing pages</h1><ul>${Object.keys(ROUTES).map(r => `<li><a href="${r}">${r}</a></li>`).join('')}</ul>`);
  }
  const file = path.normalize(path.join(ROOT, ROUTES[url] || url));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found');
  }
  const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const size = fs.statSync(file).size, range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
  if (range) { // video playback and seeking
    const start = range[1] ? +range[1] : 0, end = range[2] ? Math.min(+range[2], size - 1) : size - 1;
    res.writeHead(206, { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1 });
    return fs.createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Length': size });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`Growlyze preview running at http://localhost:${PORT}`));
