import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9260;
const USER_DATA_DIR = "D:\\chrome_audit_profile";

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    '--window-size=1280,720',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--disable-gpu-sandbox',
    '--no-sandbox',
    'about:blank'
  ]);

  await sleep(2000);

  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' });
    const target = await res.json();
    const ws = new WebSocket(target.webSocketDebuggerUrl);

    let msgId = 1;
    function send(method, params = {}) {
      return new Promise((resolve) => {
        const curId = msgId++;
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
    await send('Page.enable');
    await send('Runtime.enable');

    await send('Page.navigate', { url: 'http://127.0.0.1:3000/?skipLoading=true' });
    await sleep(4000);

    // Click Singleplayer button
    const clickResult = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const spBtn = btns.find(b => b.textContent && b.textContent.includes('Singleplayer'));
          if (spBtn) {
            spBtn.click();
            return 'Clicked Singleplayer!';
          }
          return 'Singleplayer button not found: ' + btns.map(b => b.textContent).join(' | ');
        })()
      `,
      returnByValue: true
    });
    console.log('[Click Result]:', clickResult?.result?.value);

    await sleep(2500);

    // Now capture what's on screen
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const buf = Buffer.from(shot.data, 'base64');
    fs.writeFileSync('public/screenshots/audit/after-singleplayer.png', buf);
    console.log('Saved after-singleplayer.png, size:', buf.length);

    // Switch to Scene 2 (The Eternal Forest) by pressing hotbar or setScene
    await send('Runtime.evaluate', {
      expression: `
        if (window.useStore) {
          window.useStore.getState().setScene(1);
        }
      `
    });
    await sleep(2500);

    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    const buf2 = Buffer.from(shot2.data, 'base64');
    fs.writeFileSync('public/screenshots/audit/test-scene-02.png', buf2);
    console.log('Saved test-scene-02.png, size:', buf2.length);

    ws.close();
  } finally {
    chrome.kill('SIGTERM');
  }
}

run().catch(console.error);
