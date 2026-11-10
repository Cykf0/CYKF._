import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9228;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const scenes = [
  { name: 'scene-01-title', hash: '#village' },
  { name: 'scene-02-profile', hash: '#profile' },
  { name: 'scene-03-enchantments', hash: '#enchantments' },
  { name: 'scene-04-chest', hash: '#chest' },
  { name: 'scene-05-crafting', hash: '#crafting' },
  { name: 'scene-06-advancements', hash: '#advancements' },
  { name: 'scene-07-trades', hash: '#trades' },
  { name: 'scene-08-connect', hash: '#connect' },
  { name: 'scene-09-end', hash: '#end' }
];

async function captureScene(wsUrl, scene, outputFile) {
  return new Promise(async (resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let msgId = 1;
    const callbacks = new Map();

    ws.onopen = async () => {
      function send(method, params = {}) {
        return new Promise((res, rej) => {
          const id = msgId++;
          callbacks.set(id, { res, rej });
          ws.send(JSON.stringify({ id, method, params }));
        });
      }

      try {
        await send('Page.enable');
        await send('Runtime.enable');

        const targetUrl = `http://127.0.0.1:3000/?skipLoading=true${scene.hash}`;
        console.log(`[Capture] Navigating to ${targetUrl}...`);
        await send('Page.navigate', { url: targetUrl });

        // Wait for WebGL scene, loading screen and textures
        await sleep(3200);

        console.log(`[Capture] Taking screenshot for ${scene.name}...`);
        const result = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });

        if (result && result.data) {
          const buffer = Buffer.from(result.data, 'base64');
          fs.writeFileSync(outputFile, buffer);
          console.log(`[Capture] Saved screenshot to ${outputFile} (${buffer.length} bytes)`);
        }
        ws.close();
        resolve(outputFile);
      } catch (err) {
        ws.close();
        reject(err);
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && callbacks.has(data.id)) {
        const { res, rej } = callbacks.get(data.id);
        callbacks.delete(data.id);
        if (data.error) rej(data.error);
        else res(data.result);
      }
    };

    ws.onerror = (err) => reject(err);
  });
}

async function run() {
  console.log('[Capture] Launching Chrome...');
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--window-size=1280,720',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--disable-gpu-sandbox',
    '--no-sandbox',
    'about:blank'
  ]);

  await sleep(1500);

  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' });
    const target = await res.json();
    const wsUrl = target.webSocketDebuggerUrl;

    const outDir = path.resolve('screenshots');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    for (const sc of scenes) {
      await captureScene(wsUrl, sc, path.join(outDir, `${sc.name}.png`));
    }

    console.log('[Capture] Finished capturing all 9 scenes!');
  } finally {
    chrome.kill('SIGTERM');
  }
}

run().catch(console.error);
