import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9252;
const USER_DATA_DIR = "D:\\chrome_audit_profile";

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const outDir = path.resolve('public', 'screenshots', 'audit');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function run() {
  console.log('[Audit 1-3] Launching Chrome...');
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

  await sleep(2200);

  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' });
    const target = await res.json();
    const wsUrl = target.webSocketDebuggerUrl;

    const ws = new WebSocket(wsUrl);
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

    await new Promise((resolve) => {
      ws.addEventListener('open', resolve, { once: true });
    });

    await send('Page.enable');
    await send('Runtime.enable');

    async function evaluate(expr) {
      const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      return r?.result?.value;
    }

    async function capture(filename) {
      const result = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      if (result && result.data) {
        const buffer = Buffer.from(result.data, 'base64');
        const filepath = path.join(outDir, filename);
        fs.writeFileSync(filepath, buffer);
        console.log(`[Audit] Captured ${filename} (${buffer.length} bytes)`);
      }
    }

    // Navigate and wait for canvas to mount
    console.log('[Audit] Navigating to app...');
    await send('Page.navigate', { url: 'http://127.0.0.1:3000/?skipLoading=true' });
    await sleep(5000);

    // 1. Home Screen
    console.log('[Audit] Capturing Home Screen...');
    await capture('home-screen.png');

    // 2. Village Intro
    console.log('[Audit] Capturing Village Intro Dialog...');
    await evaluate(`
      if (window.useStore) {
        window.useStore.getState().setTitleScreen(false);
        window.useStore.getState().setScene(0);
        window.useStore.getState().setShowIntroGreeting(true);
      }
    `);
    await sleep(2500);
    await capture('village-intro.png');

    // Dismiss intro
    await evaluate(`
      if (window.useStore) {
        window.useStore.getState().setShowIntroGreeting(false);
      }
    `);
    await sleep(1000);

    // 3. Scene 1: The Developer Archive
    console.log('[Audit] Capturing Scene 1: The Developer Archive...');
    await evaluate(`
      if (window.useStore) {
        window.useStore.getState().setTitleScreen(false);
        window.useStore.getState().setShowIntroGreeting(false);
        window.useStore.getState().setScene(0);
      }
    `);
    await sleep(3000);
    await capture('scene-01-the-developer-archive.png');

    // 4. Scene 2: The Eternal Forest
    console.log('[Audit] Capturing Scene 2: The Eternal Forest...');
    await evaluate(`
      if (window.useStore) {
        window.useStore.getState().setScene(1);
      }
    `);
    await sleep(3000);
    await capture('scene-02-the-eternal-forest.png');

    ws.close();
    console.log('[Audit] Scenes 1 & 2 captured successfully!');
  } finally {
    chrome.kill('SIGTERM');
  }
}

run().catch(console.error);
