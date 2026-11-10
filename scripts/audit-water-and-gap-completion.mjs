import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9344;
const USER_DATA_DIR = "D:\\chrome_water_audit";

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const SCENES = [
  { id: 0, hash: '#welcome', name: 'scene01_title_welcome' },
  { id: 1, hash: '#profile', name: 'scene02_eternal_forest' },
  { id: 2, hash: '#skills', name: 'scene03_arcane_library' },
  { id: 3, hash: '#projects', name: 'scene04_abandoned_mines_lava' },
  { id: 4, hash: '#journey', name: 'scene05_frozen_frontier' },
  { id: 5, hash: '#advancements', name: 'scene06_deep_dark' },
  { id: 6, hash: '#services', name: 'scene07_villagers_home' },
  { id: 7, hash: '#contact', name: 'scene08_lost_paradise_waterfall' },
  { id: 8, hash: '#credits', name: 'scene09_endless_void' },
];

async function run() {
  if (!fs.existsSync('public/screenshots')) {
    fs.mkdirSync('public/screenshots', { recursive: true });
  }

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

    await new Promise((resolve) => ws.addEventListener('open', resolve));
    await send('Page.enable');
    await send('Runtime.enable');

    console.log('--- AUDITING ALL 9 WORLDS & WATER/LAVA SYSTEMS ---');

    for (const sc of SCENES) {
      console.log(`Auditing Scene ${sc.id + 1}: ${sc.name} (${sc.hash})...`);
      await send('Page.navigate', { url: `http://localhost:3000/?skipLoading&skipTitle${sc.hash}` });
      await sleep(3500);

      // Capture Primary Default View
      const shot1 = await send('Page.captureScreenshot', { format: 'png' });
      const f1 = `public/screenshots/audit_${sc.name}_primary.png`;
      fs.writeFileSync(f1, Buffer.from(shot1.data, 'base64'));
      console.log(`  ✓ Saved ${f1}`);

      // For Scene 04 (Abandoned Mines Lava), also inspect side lava waterfall & low bridge angles
      if (sc.id === 3) {
        // Move mouse to right to inspect lava waterfall & right cavern wall
        await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1100, y: 250 });
        await sleep(800);
        const shotLava = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('public/screenshots/audit_scene04_lava_waterfall_angle.png', Buffer.from(shotLava.data, 'base64'));
        console.log('  ✓ Saved public/screenshots/audit_scene04_lava_waterfall_angle.png');

        // Move mouse to low bottom to inspect bridge & floor basin connection
        await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 640, y: 650 });
        await sleep(800);
        const shotFloor = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('public/screenshots/audit_scene04_lava_basin_low_angle.png', Buffer.from(shotFloor.data, 'base64'));
        console.log('  ✓ Saved public/screenshots/audit_scene04_lava_basin_low_angle.png');
      }

      // For Scene 08 (Lost Paradise Waterfall), inspect waterfall flow & lake connection
      if (sc.id === 7) {
        await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 250, y: 300 });
        await sleep(800);
        const shotWater = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('public/screenshots/audit_scene08_waterfall_stream_angle.png', Buffer.from(shotWater.data, 'base64'));
        console.log('  ✓ Saved public/screenshots/audit_scene08_waterfall_stream_angle.png');
      }
    }

    // Verify WebGL Canvas & Runtime Error state
    const evalRes = await send('Runtime.evaluate', {
      expression: `({
        canvasExists: !!document.querySelector('canvas'),
        errorCount: window.__errorCount || 0,
        bodyClasses: document.body.className
      })`,
      returnByValue: true
    });
    console.log('Runtime verification results:', evalRes.result.value);

    ws.close();
    console.log('--- ALL 9 WORLDS & WATER/LAVA AUDIT COMPLETED SUCCESSFULLY ---');
  } catch (err) {
    console.error('Audit error:', err);
  } finally {
    chrome.kill();
  }
}

run();
