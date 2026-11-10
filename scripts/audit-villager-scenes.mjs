import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9254;
const USER_DATA_DIR = path.join(os.tmpdir(), 'chrome_audit_' + Date.now());

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const outDir = path.resolve('public', 'screenshots', 'audit');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function run() {
  console.log('[Audit Villager] Launching Chrome...');
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

    // Navigate to app
    console.log('[Audit] Navigating to app...');
    await send('Page.navigate', { url: 'http://127.0.0.1:3000/?skipLoading=true' });
    await sleep(4000);

    // 1. Enter world, Scene 1
    console.log('[Audit] Switching to Scene 1: The Developer Archive...');
    await evaluate(`
      if (window.useStore) {
        window.useStore.getState().setTitleScreen(false);
        window.useStore.getState().setShowIntroGreeting(false);
        window.useStore.getState().setScene(0);
      }
    `);
    await sleep(3500);
    await capture('villager-scene-01.png');

    // 2. Switch to Scene 2: The Eternal Forest (Profile Panel)
    console.log('[Audit] Switching to Scene 2: The Eternal Forest...');
    await evaluate(`
      if (window.useStore) {
        window.useStore.getState().setScene(1);
      }
    `);
    await sleep(2500);
    await capture('profile-scene-02.png');

    // 2. Switch to Scene 4: Abandoned Mineshaft (pickaxe holding pose)
    console.log('[Audit] Switching to Scene 4: Abandoned Mines...');
    await evaluate(`
      if (window.useStore) {
        window.useStore.getState().setScene(3);
      }
    `);
    await sleep(2500);
    await capture('pickaxe-scene-04.png');

    // 3. Switch to Scene 6: Deep Dark (soul torch holding pose)
    console.log('[Audit] Switching to Scene 6: Deep Dark...');
    await evaluate(`
      if (window.useStore) {
        window.useStore.getState().setScene(5);
      }
    `);
    await sleep(2500);
    await capture('torch-scene-06.png');

    // 4. Switch to Scene 7: The Villager's Home
    console.log('[Audit] Switching to Scene 7: The Villager\'s Home...');
    await evaluate(`
      if (window.useStore) {
        window.useStore.getState().setScene(6);
      }
    `);
    await sleep(2500);
    await capture('villager-scene-07.png');

    // 5. Open Villager Trading GUI
    console.log('[Audit] Opening Villager Trading GUI...');
    await evaluate(`
      if (window.useStore) {
        window.useStore.getState().setActiveGui('villager');
      }
    `);
    await sleep(1500);
    await capture('villager-trading-gui.png');

    // 6. Close GUI and switch to Scene 9: The End (soul torch holding pose)
    console.log('[Audit] Switching to Scene 9: The Endless Void...');
    await evaluate(`
      if (window.useStore) {
        window.useStore.getState().setActiveGui('none');
        window.useStore.getState().setScene(8);
      }
    `);
    await sleep(2500);
    await capture('torch-scene-09.png');

    ws.close();
    console.log('[Audit] Completed successfully!');
  } finally {
    chrome.kill('SIGTERM');
    try {
      fs.rmSync(USER_DATA_DIR, { recursive: true, force: true });
    } catch {}
  }
}

run().catch(console.error);
