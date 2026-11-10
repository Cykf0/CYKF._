import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9248;
const USER_DATA_DIR = "D:\\chrome_audit_profile";

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const outDir = path.resolve('public', 'screenshots', 'audit');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function run() {
  console.log('[Audit] Launching Headless Chrome on port', PORT, 'with profile at', USER_DATA_DIR);
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
      if (r?.exceptionDetails) {
        console.error('[Eval Error]', r.exceptionDetails.text, r.exceptionDetails.exception?.description);
      }
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

    // 1. Capture Home Screen
    console.log('[Audit] Navigating to Home Screen...');
    await send('Page.navigate', { url: 'http://127.0.0.1:3000/?skipLoading=true' });
    await sleep(4000);
    await capture('home-screen.png');

    // 2. Capture Village Intro Dialog
    console.log('[Audit] Entering World to capture Village Intro Dialog...');
    await evaluate(`
      if (window.useStore) {
        window.useStore.getState().setTitleScreen(false);
        window.useStore.getState().setScene(0);
        window.useStore.getState().setShowIntroGreeting(true);
      }
    `);
    await sleep(2200);
    await capture('village-intro.png');

    // Dismiss Village Intro
    await evaluate(`
      if (window.useStore) {
        window.useStore.getState().setShowIntroGreeting(false);
      }
    `);
    await sleep(1000);

    // 3. Capture all 9 3D Scenes
    const sceneConfigs = [
      { idx: 0, file: 'scene-01-the-developer-archive.png' },
      { idx: 1, file: 'scene-02-the-eternal-forest.png' },
      { idx: 2, file: 'scene-03-the-arcane-library.png' },
      { idx: 3, file: 'scene-04-the-abandoned-mines.png' },
      { idx: 4, file: 'scene-05-the-frozen-frontier.png' },
      { idx: 5, file: 'scene-06-the-deep-dark.png' },
      { idx: 6, file: 'scene-07-the-villagers-home.png' },
      { idx: 7, file: 'scene-08-the-lost-paradise.png' },
      { idx: 8, file: 'scene-09-the-endless-void.png' },
    ];

    for (const sc of sceneConfigs) {
      console.log(`[Audit] Navigating to Scene ${sc.idx + 1}: ${sc.file}...`);
      await evaluate(`
        if (window.useStore) {
          window.useStore.getState().setTitleScreen(false);
          window.useStore.getState().setShowIntroGreeting(false);
          window.useStore.getState().setActiveGui(null);
          window.useStore.getState().setScene(${sc.idx});
        }
      `);
      await sleep(2800);
      await capture(sc.file);
    }

    // 4. Capture all 5 Container GUIs
    const guis = [
      { name: 'enchanting', file: 'gui-enchanting.png', scene: 2 },
      { name: 'crafting', file: 'gui-crafting.png', scene: 4 },
      { name: 'anvil', file: 'gui-anvil.png', scene: 2 },
      { name: 'chest', file: 'gui-chest.png', scene: 3 },
      { name: 'villager', file: 'gui-villager.png', scene: 6 },
    ];

    for (const g of guis) {
      console.log(`[Audit] Capturing Container GUI: ${g.name}...`);
      await evaluate(`
        if (window.useStore) {
          window.useStore.getState().setScene(${g.scene});
          window.useStore.getState().setActiveGui('${g.name}');
        }
      `);
      await sleep(1600);
      await capture(g.file);
    }

    await evaluate(`if (window.useStore) window.useStore.getState().setActiveGui(null);`);
    ws.close();
    console.log('[Audit] All captures completed successfully!');
  } finally {
    chrome.kill('SIGTERM');
  }
}

run().catch(console.error);
