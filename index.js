const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const fs = require('fs')
const pino = require('pino')
const readline = require("readline");

const OWNER = 'NOSTOC'
const PREFIX = '.'
const BOT_NAME = 'VIGILANT SYSTEM V7'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))

const commands = new Map()
const commandFolders = fs.readdirSync('./commands')
for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'))
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`)
        commands.set(command.name, command)
    }
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session')
    const sock = makeWASocket({ auth: state, logger: pino({ level: 'silent' })

    if (!sock.authState.creds.registered) {
        const phoneNumber = await question('Enter your WhatsApp number: 234xxx\n')
        const code = await sock.requestPairingCode(phoneNumber.trim())
        console.log(`\n========== VIGILANT PAIRING CODE: ${code} ==========\n`)
    }

    sock.ev.on('creds.update', saveCreds)
    sock.ev.on('connection.update', (update) => {
        const { connection } = update
        if (connection === 'open') {
            console.log(BOT_NAME + ' IS ONLINE ✅ - 300+ COMMANDS LOADED')
            rl.close()
        }
        if (connection === 'close') startBot()
    })

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0]
        if (!msg.message) return
        const from = msg.key.remoteJid
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
        if (!body.startsWith(PREFIX)) return

        const args = body.slice(PREFIX.length).trim().split(/ +/)
        const commandName = args.shift().toLowerCase()

        if (commands.has(commandName)) {
            try {
                await commands.get(commandName).execute(sock, msg, args, { OWNER, PREFIX, BOT_NAME })
            } catch (error) {
                await sock.sendMessage(from, { text: `Error in command` }, { quoted: msg })
            }
        }
    })
}
startBot()
