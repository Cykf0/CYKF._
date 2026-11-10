import { spawn } from 'child_process';
import os from 'os';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9260;
const USER_DATA_DIR = path.join(os.tmpdir(), 'chrome_eval_' + Date.now());

async function run() {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=' + PORT,
    '--user-data-dir=' + USER_DATA_DIR,
    '--no-sandbox',
    'about:blank'
  ]);
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://127.0.0.1:' + PORT + '/json/new?about:blank', { method: 'PUT' });
  const t = await res.json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  let id = 1;
  function send(method, params = {}) {
    return new Promise(resolve => {
      const curId = id++;
      const onMsg = (evt) => {
        const d = JSON.parse(evt.data);
        if (d.id === curId) {
          ws.removeEventListener('message', onMsg);
          resolve(d.result);
        }
      };
      ws.addEventListener('message', onMsg);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });
  }
  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  await send('Page.navigate', { url: 'http://127.0.0.1:3000/?skipLoading=true' });
  await new Promise(r => setTimeout(r, 3000));

  const result = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        try {
          const img = new Image();
          await new Promise((res, rej) => {
            img.onload = res;
            img.onerror = (e) => rej('Img error: ' + e);
            img.src = '/skins/cykf.png';
          });
          const c = document.createElement('canvas');
          c.width = 64; c.height = 64;
          const ctx = c.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const face = ctx.getImageData(8, 8, 8, 8).data;
          const hex = [];
          for (let i = 0; i < face.length; i += 4) {
            hex.push('#' + [face[i], face[i+1], face[i+2]].map(x => x.toString(16).padStart(2, '0')).join(''));
          }
          const body = ctx.getImageData(20, 20, 8, 12).data;
          const bodyHex = [];
          for (let i = 0; i < body.length; i += 4) {
            bodyHex.push('#' + [body[i], body[i+1], body[i+2]].map(x => x.toString(16).padStart(2, '0')).join(''));
          }
          return { success: true, faceColors: [...new Set(hex)], bodyColors: [...new Set(bodyHex)].slice(0, 5) };
        } catch (e) {
          return { error: String(e) };
        }
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('Result in Chrome:', JSON.stringify(result.result.value));
  chrome.kill();
  try { fs.rmSync(USER_DATA_DIR, { recursive: true, force: true }); } catch {}
}
run().catch(console.error);
