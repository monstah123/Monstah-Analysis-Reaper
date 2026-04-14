
import http from 'http';
import { parse } from 'url';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Simple .env.local loader (native to avoid deps)
const envPath = join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envData = fs.readFileSync(envPath, 'utf8');
  envData.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
}

const PORT = 3000;

const server = http.createServer(async (req, res) => {
  const parsedUrl = parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Handle /api/... routes
  if (pathname.startsWith('/api/')) {
    const apiFile = pathname.slice(5) + '.js';
    const filePath = join(__dirname, 'api', apiFile);

    if (fs.existsSync(filePath)) {
      try {
        const module = await import(`file://${filePath}?t=${Date.now()}`);
        const handler = module.default;

        // Shim req.query and req.body for Vercel style
        req.query = parsedUrl.query;
        
        // Simple body parser for POST
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              req.body = body ? JSON.parse(body) : {};
            } catch (e) {
              req.body = {};
            }
            
            // Shim res.status and res.json
            res.status = (code) => { res.statusCode = code; return res; };
            res.json = (data) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
              return res;
            };

            await handler(req, res);
          });
          return;
        }

        // Shim res.status and res.json for GET
        res.status = (code) => { res.statusCode = code; return res; };
        res.json = (data) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
          return res;
        };

        await handler(req, res);
      } catch (error) {
        console.error(`[API Server] Error in ${apiFile}:`, error);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: error.message }));
      }
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Not Found' }));
    }
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`[API Server] Monstah Backend Running on port ${PORT}`);
});
