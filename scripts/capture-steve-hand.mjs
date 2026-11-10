import { spawn } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9260;
const USER_DATA_DIR = path.join(os.tmpdir(), 'chrome_pickaxe_' + Date.now());

async function run() {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=' + PORT,
    '--user-data-dir=' + USER_DATA_DIR,
    '--window-size=1280,720',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--disable-gpu-sandbox',
    '--no-sandbox',
    'about:blank'
  ]);
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://127.0.0.1:' + PORT + '/json/new?about:blank', { method: 'PUT' });
  const t = await res.json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);

  await new Promise((resolve) => {
    ws.addEventListener('open', () => {
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
      ws.send(JSON.stringify({ id: 2, method: 'Page.enable' }));
      ws.send(JSON.stringify({ id: 3, method: 'Emulation.setDeviceMetricsOverride', params: { width: 1200, height: 900, deviceScaleFactor: 1, mobile: false } }));
      ws.send(JSON.stringify({ id: 4, method: 'Page.navigate', params: { url: 'http://127.0.0.1:3000/?skipLoading=true' } }));
      setTimeout(resolve, 3500);
    });
  });

  // Switch to Scene 1
  ws.send(JSON.stringify({
    id: 10,
    method: 'Runtime.evaluate',
    params: { expression: 'window.__SCENE_MANAGER__?.setScene(0);' }
  }));
  await new Promise(r => setTimeout(r, 2000));

  // Take screenshot
  const msgPromise = new Promise((resolve) => {
    const handler = (evt) => {
      const d = JSON.parse(evt.data);
      if (d.id === 20) {
        ws.removeEventListener('message', handler);
        resolve(d.result.data);
      }
    };
    ws.addEventListener('message', handler);
  });
  ws.send(JSON.stringify({ id: 20, method: 'Page.captureScreenshot', params: { format: 'png' } }));
  const data = await msgPromise;
  fs.writeFileSync('public/screenshots/audit/steve-hand-test.png', Buffer.from(data, 'base64'));
  console.log('Captured steve-hand-test.png');
  chrome.kill();
}

run().catch(console.error);
