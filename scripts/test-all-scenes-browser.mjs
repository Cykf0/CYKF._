import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9265;
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

    ws.onmessage = (evt) => {
      const d = JSON.parse(evt.data);
      if (d.method === 'Runtime.consoleAPICalled') {
        const args = d.params.args.map(a => a.value || a.description).join(' ');
        console.log(`[Browser Console ${d.params.type}]`, args);
      } else if (d.method === 'Runtime.exceptionThrown') {
        console.error(`[Browser Exception]`, d.params.exceptionDetails.text, d.params.exceptionDetails.exception?.description);
      }
    };

    await new Promise(r => ws.addEventListener('open', r, { once: true }));
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Log.enable');

    await send('Page.navigate', { url: 'http://127.0.0.1:3000/?skipLoading=true' });
    await sleep(4000);

    // Enter singleplayer
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const spBtn = btns.find(b => b.textContent && b.textContent.includes('Singleplayer'));
          if (spBtn) spBtn.click();
        })()
      `
    });

    await sleep(2000);

    // Dismiss intro dialog by clicking "Explore Archive"
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const expBtn = btns.find(b => b.textContent && b.textContent.includes('EXPLORE ARCHIVE'));
          if (expBtn) expBtn.click();
        })()
      `
    });

    await sleep(2000);

    // Capture Scene 1
    console.log('[Capturing Scene 1...]');
    let shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('public/screenshots/audit/real-scene-01.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved real-scene-01.png');

    // Switch to Scene 2
    console.log('[Switching to Scene 2...]');
    await send('Runtime.evaluate', { expression: `window.useStore.getState().setScene(1);` });
    await sleep(2500);

    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('public/screenshots/audit/real-scene-02.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved real-scene-02.png');

    // Switch to Scene 3
    console.log('[Switching to Scene 3...]');
    await send('Runtime.evaluate', { expression: `window.useStore.getState().setScene(2);` });
    await sleep(2500);

    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('public/screenshots/audit/real-scene-03.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved real-scene-03.png');

    // Switch to Scene 4
    console.log('[Switching to Scene 4...]');
    await send('Runtime.evaluate', { expression: `window.useStore.getState().setScene(3);` });
    await sleep(2500);

    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('public/screenshots/audit/real-scene-04.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved real-scene-04.png');

    // Switch to Scene 5
    console.log('[Switching to Scene 5...]');
    await send('Runtime.evaluate', { expression: `window.useStore.getState().setScene(4);` });
    await sleep(2500);

    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('public/screenshots/audit/real-scene-05.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved real-scene-05.png');

    // Switch to Scene 6
    console.log('[Switching to Scene 6...]');
    await send('Runtime.evaluate', { expression: `window.useStore.getState().setScene(5);` });
    await sleep(2500);

    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('public/screenshots/audit/real-scene-06.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved real-scene-06.png');

    // Switch to Scene 7
    console.log('[Switching to Scene 7...]');
    await send('Runtime.evaluate', { expression: `window.useStore.getState().setScene(6);` });
    await sleep(2500);

    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('public/screenshots/audit/real-scene-07.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved real-scene-07.png');

    // Switch to Scene 8
    console.log('[Switching to Scene 8...]');
    await send('Runtime.evaluate', { expression: `window.useStore.getState().setScene(7);` });
    await sleep(2500);

    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('public/screenshots/audit/real-scene-08.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved real-scene-08.png');

    // Switch to Scene 9
    console.log('[Switching to Scene 9...]');
    await send('Runtime.evaluate', { expression: `window.useStore.getState().setScene(8);` });
    await sleep(2500);

    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('public/screenshots/audit/real-scene-09.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved real-scene-09.png');

    ws.close();
  } finally {
    chrome.kill('SIGTERM');
  }
}

run().catch(console.error);
