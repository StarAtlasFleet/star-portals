import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const starRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const host = '127.0.0.1';
const port = Number.parseInt(process.argv[2] ?? '4178', 10);
if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error(`Invalid preview port: ${process.argv[2]}`);
}

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8'],
  ['.svg', 'image/svg+xml; charset=utf-8'],
  ['.png', 'image/png'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.xml', 'application/xml; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8'],
]);

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', `http://${host}`);
    const relativePath = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    let absolutePath = resolve(starRoot, relativePath);
    const insideRoot = absolutePath === starRoot || absolutePath.startsWith(`${starRoot}${sep}`);
    if (!insideRoot) {
      response.writeHead(403).end('Forbidden');
      return;
    }

    const fileStat = await stat(absolutePath);
    if (fileStat.isDirectory()) absolutePath = join(absolutePath, 'index.html');
    const body = await readFile(absolutePath);
    response.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Type': contentTypes.get(extname(absolutePath).toLowerCase()) ?? 'application/octet-stream',
    });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch (error) {
    const status = error?.code === 'ENOENT' ? 404 : 400;
    response.writeHead(status).end(status === 404 ? 'Not Found' : 'Bad Request');
  }
});

server.listen(port, host, () => {
  console.log(`Star portal preview: http://${host}:${port}/starportal/?sound=0`);
});
