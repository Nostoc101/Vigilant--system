// index.js - NOSTOC-MD V7 ULTIMATE + 50 BUG DASHBOARD - FIXED FOR RENDER FREE
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const cluster = require('cluster'); const os = require('os'); const crypto = require('crypto');
const fs = require('fs'); const path = require('path'); const http = require('http'); const https = require('https'); const { EventEmitter } = require('events');
const zlib = require('zlib'); const child_process = require('child_process');

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
  const payload = JSON.stringify({ text: `🚨 *CRITICAL SYSTEM EXCEPTION* 🚨\n*Type:* \`${type}\`\n*PID:* \`${process.pid}\`\n*Details:* \`\`${rawData.substring(0, 500)}\`\`` });
  try {
    const urlTokens = new URL(WEBHOOK_URL);
    const req = https.request({ hostname: urlTokens.hostname, path: urlTokens.pathname + urlTokens.search, method: 'POST', headers: { 'Content-Type': 'application/json' } });
    req.on('error', () => {});
    req.write(payload); req.end();
  } catch {}
}

const args = {}; process.argv.slice(2).forEach(arg => { const [key, value] = arg.replace(/^--/, '').split('='); args[key] = value; });
const command = args.cmd;

const BUG_MANIFEST = {
  'test-suite': 'Verifies microtask queue processing latency.',
  'force-crash': 'Forces standard runtime structural breakdown.',
  'memory-leak': 'Simulates rapid JavaScript heap expansion. DANGER FOR FREE RENDER',
  'cpu-spike': 'Engages intensive mathematical iterations synchronously.',
  'slow-network': 'Generates synthetic processing latencies.',
  'request-timeout': 'Stalls protocol synchronization parameters.',
  'db-fail': 'Simulates database connectivity loss.',
  'auth-bypass': 'Triggers admin verification bypass warnings.',
  'race-condition': 'Forces async operations order conflicts.',
  'data-corruption': 'Injects raw non-standard multi-byte sequences.',
  'stack-overflow': 'Exhausts maximum execution call stack limits.',
  'unhandled-promise': 'Rejects promises without a catch handler.',
  'missing-env': 'Validates system dependencies.',
  'permission-denied': 'Simulates system access failures.',
  'deadlock': 'Blocks the main runtime event loop.',
  'null-pointer': 'Attempts references to null properties.',
  'invalid-json': 'Passes malformed JSON.',
  'dep-collision': 'Triggers package config mismatch.',
  'infinite-loop': 'Executes non-terminating loop. DANGER',
  'dns-failure': 'Forces domain resolution faults.',
  'fs-write-fail': 'Simulates file write failures.',
  'fs-read-fail': 'Attempts to read non-existent file.',
  'port-conflict': 'Attempts socket on used port.',
  'ssl-expired': 'Throws SSL certificate error.',
  'cors-blocked': 'Simulates CORS rejection.',
  'eval-error': 'Executes EvalError.',
  'range-error': 'Throws RangeError.',
  'uri-error': 'Passes malformed URI.',
  'event-emitter-leak': 'Registers 200 event listeners.',
  'gc-freeze': 'Forces heavy GC load.',
  'buffer-alloc-error': 'Tries to allocate 2GB buffer. DANGER',
  'crypto-fail': 'Simulates crypto error.',
  'zlib-error': 'Passes bad data to zlib.',
  'child-process-fail': 'Forks non-existent file.',
  'http2-error': 'Simulates http2 error.',
  'process-disconnect': 'Triggers process disconnect.',
  'worker-terminate': 'Exits process immediately.',
  'intl-error': 'Invalid Intl format.',
  'async-hooks-leak': 'Async hooks leak.',
  'v8-heap-exhaust': 'Exhausts V8 heap. DANGER',
  'readline-freeze': 'Readline freeze.',
  'repl-crash': 'REPL crash.',
  'stream-destroy': 'Stream destroy.',
  'cluster-disconnect': 'Cluster disconnect.',
  'net-server-fail': 'Net server fail.',
  'dgram-error': 'Dgram error.',
  'module-not-found': 'Requires non-existent module.',
  'syntax-error': 'Eval syntax error.',
  'type-coercion-bug': 'Null + undefined math.',
  'array-bound-panic': 'Access empty array index.',
  'async-deadlock': 'Promise deadlock.',
  'timer-overflow': 'Huge setTimeout.',
  'prototype-pollution': 'Pollutes Object prototype.',
  'math-precision-error': '0.1 + 0.2 test.',
  'aborted-fetch': 'Aborted fetch.'
};

async function startWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const sock = makeWASocket({ auth: state, printQRInTerminal: false, logger: { level: 'silent' } });

    // FIX 2: THIS MAKES PAIRING CODE SHOW
    if (!state.creds.registered && PHONE_NUMBER) {
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(PHONE_NUMBER);
                console.log('🔑 V7 PAIRING CODE:', code);
            } catch (e) { console.log("Pairing error:", e) }
        }, 3000)
    }

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') console.log('✅ NOSTOC-MD-V7 CONNECTED!');
        if (connection === 'close') console.log('❌ Connection closed');
    });
}

function executeBugCommand(cmd) {
  switch (cmd) {
    case 'test-suite': console.log("Test OK"); break;
    case 'force-crash': throw new Error('FORCE_ABORT');
    case 'memory-leak': global.leak = global.leak || []; setInterval(() => { global.leak.push(crypto.randomBytes(2000000)); }, 50); break;
    case 'cpu-spike': while (true) { crypto.pbkdf2Sync('p', 's', 10000, 64, 'sha512'); }
    case 'slow-network': setTimeout(() => {}, 5000); break;
    case 'request-timeout': break;
    case 'db-fail': break;
    case 'auth-bypass': break;
    case 'race-condition': let s = 0; process.nextTick(() => s += 10); setImmediate(() => s *= 2); break;
    case 'data-corruption': Buffer.allocUnsafe(50).fill('0xDEADBEEF'); break;
    case 'stack-overflow': const loop = () => loop(); loop(); break;
    case 'unhandled-promise': Promise.reject(new Error('Mock Reject')); break;
    case 'missing-env': break;
    case 'permission-denied': try{fs.readFileSync('/root');}catch{} break;
    case 'deadlock': const b = Date.now() + 5000; while (Date.now() < b) {} break;
    case 'null-pointer': const e = null; console.log(e.prop); break;
    case 'invalid-json': JSON.parse("{ malformed }"); break;
    case 'dep-collision': break;
    case 'infinite-loop': while(true) {}
    case 'dns-failure': require('dns').resolve('invalid.domain.that.does.not.exist', () => {}); break;
    case 'fs-write-fail': try{fs.writeFileSync('/root/test', 'fail');}catch{} break;
    case 'fs-read-fail': try{fs.readFileSync('/nonexistent/file.txt');}catch{} break;
    case 'port-conflict': try{http.createServer().listen(PORT);}catch{} break;
    case 'ssl-expired': throw new Error('SSL CERT EXPIRED');
    case 'cors-blocked': break;
    case 'eval-error': throw new EvalError('Eval fail');
    case 'range-error': throw new RangeError('Range out of bounds');
    case 'uri-error': decodeURIComponent('%E0%A4%A'); break;
    case 'event-emitter-leak': const em = new EventEmitter(); for (let i = 0; i < 200; i++) { em.on('ev', () => {}); } break;
    case 'gc-freeze': let m = new Map(); for (let i = 0; i < 100000; i++) { m.set(i, 'node'); } break;
    case 'buffer-alloc-error': Buffer.alloc(2e9); break;
    case 'crypto-fail': try{crypto.createSign('INVALID');}catch{} break;
    case 'zlib-error': try{zlib.gunzipSync(Buffer.from('bad_data'));}catch{} break;
    case 'child-process-fail': try{child_process.fork('none.js');}catch{} break;
    case 'http2-error': break;
    case 'process-disconnect': try{process.disconnect();}catch{} break;
    case 'worker-terminate': process.exit(1); break;
    case 'intl-error': try{new Intl.NumberFormat('invalid');}catch{} break;
    case 'async-hooks-leak': break;
    case 'v8-heap-exhaust': let arr = []; while(true) arr.push(new Array(1000000)); break;
    case 'readline-freeze': break;
    case 'repl-crash': break;
    case 'stream-destroy': break;
    case 'cluster-disconnect': try{cluster.worker.disconnect();}catch{} break;
    case 'net-server-fail': break;
    case 'dgram-error': break;
    case 'module-not-found': require('non_existent_package'); break;
    case 'syntax-error': eval('const x = ;'); break;
    case 'type-coercion-bug': const c = (null + undefined) * 2; break;
    case 'array-bound-panic': const arr2 = []; console.log(arr2[999]); break;
    case 'async-deadlock': const p1 = new Promise((r) => setTimeout(() => p1.then(r), 10)); p1.then(() => {}); break;
    case 'timer-overflow': setTimeout(() => {}, 2147483648); break;
    case 'prototype-pollution': Object.prototype.polluted = "yes"; break;
    case 'math-precision-error': 0.1 + 0.2 === 0.3; break;
    case 'aborted-fetch': break;
    default: break;
  }
}

if (cluster.isMaster &&!command) {
  const numCPUs = Math.min(os.cpus().length, 2);
  console.log(`[MASTER] Node live [${process.pid}]. Cores: ${numCPUs}`);
  startWhatsApp();

  for (let i = 0; i < numCPUs; i++) { cluster.fork(); }
  cluster.on('exit', (worker) => {
    logToFile('WORKER_CRASH', `Process ${worker.process.pid} collapsed.`);
    sendLiveAlert('WORKER_CRASH_ALERT', `Process ${worker.process.pid} collapsed.`);
    cluster.fork();
  });

  http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const selectedBug = url.searchParams.get('run');
    if (selectedBug && BUG_MANIFEST[selectedBug]) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`<html><body style="background:#0a0a0a;color:#0f6;font-family:monospace;padding:30px;"><h2>Executed: ${selectedBug}</h2><a href="/" style="color:#fff;">Back to Dashboard</a></body></html>`);
      executeBugCommand(selectedBug); // FIX 1: NO MORE cluster.fork().send()
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    let cards = '';
    Object.keys(BUG_MANIFEST).forEach((key, idx) => {
      cards += `<div style="background:#111;border:1px solid #333;padding:12px;margin:5px;font-family:monospace;color:#0e7;"><b style="color:#fff;">[${idx+1}] ${key}</b><p style="color:#aaa;font-size:12px;margin:5px 0;">${BUG_MANIFEST[key]}</p><a href="/?run=${key}" style="background:#0e7;color:#000;padding:2px 6px;text-decoration:none;font-weight:bold;font-size:11px;">TRIGGER</a></div>`;
    });
    res.end(`<!DOCTYPE html><html><head><title>ULTIMATE CORE</title></head><body style="background:#050505;margin:0;padding:20px;"><h2 style="color:#fff;font-family:monospace;border-bottom:2px solid #0e7;padding-bottom:10px;">⚡ NOSTOC-MD V7 DIAGNOSTIC DASHBOARD</h2><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px;">${cards}</div></body></html>`);
  }).listen(PORT, () => {
    console.log(`Dashboard interface live on: ${PORT}`);
  });

} else {
  process.on('uncaughtException', (err) => {
    logToFile('CRITICAL_EXCEPTION', err.stack);
    sendLiveAlert('UNCAUGHT_EXCEPTION_FAIL', err.stack || err.message);
    process.exit(1);
  });
  process.on('unhandledRejection', (reason) => {
    logToFile('REJECTION_ALERT', String(reason));
    sendLiveAlert('UNHANDLED_REJECTION_FAIL', String(reason));
  });
  if (command) executeBugCommand(command);
}