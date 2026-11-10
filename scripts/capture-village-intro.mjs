import { spawn } from 'child_process';
import fs from 'fs';

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9242',
  '--window-size=1280,720',
  '--use-gl=angle',
  '--use-angle=swiftshader',
  '--enable-webgl',
  '--ignore-gpu-blocklist',
  '--disable-gpu-sandbox',
  '--no-sandbox',
  'about:blank'
]);

setTimeout(async () => {
  try {
    const res = await fetch('http://127.0.0.1:9242/json/new?about:blank', { method: 'PUT' });
    const target = await res.json();
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    let id = 1;
    function send(method, params = {}) {
      return new Promise((r) => {
        const curId = id++;
        const onMsg = (evt) => {
          const d = JSON.parse(evt.data);
          if (d.id === curId) {
            ws.removeEventListener('message', onMsg);
            r(d.result);
          }
        };
        ws.addEventListener('message', onMsg);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });
    }
    ws.onopen = async () => {
      await send('Page.enable');
      await send('Runtime.enable');
      await send('Page.navigate', { url: 'http://127.0.0.1:3000/?skipLoading=true' });
      await new Promise(r => setTimeout(r, 2500));
      
      // Set TitleScreen = false and ShowIntroGreeting = true to reveal village and dialogue
      await send('Runtime.evaluate', {
        expression: `
          if (window.useStore) {
            window.useStore.getState().setTitleScreen(false);
            window.useStore.getState().setShowIntroGreeting(true);
          }
        `
      });
      await new Promise(r => setTimeout(r, 2200));

      const shot = await send('Page.captureScreenshot', { format: 'png' });
      const buf = Buffer.from(shot.data, 'base64');
      fs.writeFileSync('public/screenshots/village_intro.png', buf);
      try {
        fs.writeFileSync('C:\\Users\\hp\\.gemini\\antigravity\\brain\\5e92b84d-e7e8-49d6-b5ac-45a4b02eaaae\\village_intro.png', buf);
      } catch (e) {}
      console.log('Saved village_intro.png, size:', buf.length);
      ws.close();
      chrome.kill();
      process.exit(0);
    };
  } catch (e) {
    console.error(e);
    chrome.kill();
    process.exit(1);
  }
}, 1500);
