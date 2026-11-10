import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9265;
const USER_DATA_DIR = path.join(os.tmpdir(), 'chrome_close_' + Date.now());

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

  await sleep(2500);

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
  await sleep(3500);

  // Switch to Scene 2
  await send('Runtime.evaluate', { expression: 'window.useStore.getState().setScene(1);' });
  await sleep(1500);

  // Click the close button
  await send('Runtime.evaluate', {
    expression: `
      const btn = document.querySelector('button[title="Close"]');
      if (btn) btn.click();
    `
  });
  await sleep(1000);

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('public/screenshots/audit/panel-closed.png', Buffer.from(shot.data, 'base64'));
  console.log('Captured panel-closed.png');

  // Now click the reopen pill
  await send('Runtime.evaluate', {
    expression: `
      const pill = document.querySelector('button[title="Open Player Profile"]');
      if (pill) pill.click();
    `
  });
  await sleep(1000);

  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('public/screenshots/audit/panel-reopened.png', Buffer.from(shot2.data, 'base64'));
  console.log('Captured panel-reopened.png');

  chrome.kill();
}

run().catch(console.error);
