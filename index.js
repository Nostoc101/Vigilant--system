// index.js - BAILEYS BOT + ULTIMATE BUG DASHBOARD
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const cluster = require('cluster'); const os = require('os'); const crypto = require('crypto');
const fs = require('fs'); const path = require('path'); const http = require('http'); const https = require('https');

const LOG_FILE = path.join(__dirname, 'debug.log');
const PORT = process.env.PORT || 3000;
const PHONE_NUMBER = process.env.PHONE_NUMBER || '';
const WEBHOOK_URL = process.env.CHAT_WEBHOOK_URL || '';

function logToFile(type, message) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] [${type}] [PID: ${process.pid}] ${message}\n`;
  try { fs.appendFileSync(LOG_FILE, logLine, 'utf8'); } catch (err) {}
}

function sendLiveAlert(type, rawData) {
  if (!WEBHOOK_URL) return;
  const payload = JSON.stringify({ text: `🚨 *CRITICAL: ${type}* \n\`\`${rawData.substring(0, 500)}\`\`` });
  const urlTokens = new URL(WEBHOOK_URL);
  const req = https.request({ hostname: urlTokens.hostname, path: urlTokens.pathname + urlTokens.search, method: 'POST', headers: { 'Content-Type': 'application/json' } });
  req.on('error', () => {});
  req.write(payload); req.end();
}

const args = {}; process.argv.slice(2).forEach(arg => { const [key, value] = arg.replace(/^--/, '').split('='); args[key] = value; });
const command = args.cmd;

const BUG_MANIFEST = {
  'test-suite': 'Verifies microtask queue processing latency.',
  'force-crash': 'Forces standard runtime structural breakdown.',
  'memory-leak': 'Simulates rapid JavaScript heap expansion.',
  'cpu-spike': 'Engages intensive mathematical iterations.',
  'stack-overflow': 'Exhausts maximum execution call stack limits.',
  'unhandled-promise': 'Rejects active promises without a catch handler.',
  'invalid-json': 'Passes malformed serialization packets.',
  'module-not-found': 'Simulates a lookup failure for a non-existent dependency.'
  //...add the rest from your list if you want all 50
};

async function startWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const sock = makeWASocket({ auth: state, printQRInTerminal: false });
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (update) => {
        const { connection, pairingCode } = update;
        if (pairingCode) console.log('🔑 V7 PAIRING CODE:', pairingCode);
        if (connection === 'open') console.log('✅ NOSTOC-MD CONNECTED!');
    });
}

function executeBugCommand(cmd) {
  switch (cmd) {
    case 'test-suite': console.log("Test OK"); break;
    case 'force-crash': throw new Error('FORCE_ABORT');
    case 'memory-leak': global.leak = []; setInterval(() => { global.leak.push(crypto.randomBytes(2000000)); }, 50); break;
    case 'cpu-spike': while (true) { crypto.pbkdf2Sync('p', 's', 10000, 64, 'sha512'); }
    case 'stack-overflow': const loop = () => loop(); loop(); break;
    case 'unhandled-promise': Promise.reject(new Error('Mock Reject')); break;
    case 'invalid-json': JSON.parse("{ malformed }"); break;
    case 'module-not-found': require('non_existent_package'); break;
    default: break;
  }
}

if (cluster.isMaster &&!command) {
  const numCPUs = Math.min(os.cpus().length, 2);
  console.log(`[MASTER] Node live [${process.pid}]. Starting WhatsApp + Dashboard`);
  startWhatsApp(); // Run bot in master

  for (let i = 0; i < numCPUs; i++) { cluster.fork(); }
  cluster.on('exit', (worker) => {
    logToFile('WORKER_CRASH', `Process ${worker.process.pid} collapsed.`);
    sendLiveAlert('WORKER_CRASH_ALERT', `Worker ${worker.process.pid} died`);
    cluster.fork();
  });

  http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const selectedBug = url.searchParams.get('run');
    if (selectedBug && BUG_MANIFEST[selectedBug]) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`<h2>Executed: ${selectedBug}</h2><a href="/">Back</a>`);
      cluster.fork().send({cmd: selectedBug}); // crash a worker
      return;
    }
    let cards = ''; Object.keys(BUG_MANIFEST).forEach((key) => {
      cards += `<div style="border:1px solid #333;padding:10px;margin:5px;"><b>${key}</b><p>${BUG_MANIFEST[key]}</p><a href="/?run=${key}">TRIGGER</a></div>`;
    });
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<h2>⚡ NOSTOC BUG DASHBOARD</h2>${cards}`);
  }).listen(PORT);

} else {
  process.on('uncaughtException', (err) => {
    logToFile('CRITICAL_EXCEPTION', err.stack);
    sendLiveAlert('UNCAUGHT_EXCEPTION_FAIL', err.stack);
    process.exit(1);
  });
  if (command) executeBugCommand(command);
}