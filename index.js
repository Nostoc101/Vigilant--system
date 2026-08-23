const express = require('express')
const { default: makeWASocket, useMultiFileAuthState, Browsers, DisconnectReason } = require('@whiskeysockets/baileys')
const fs = require('fs')
const path = require('path')

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

let sock
let pairingCode = ""
let status = "Waiting for number..."
let isConnected = false

// Start bot function
async function startBot(number) {
    const { state, saveCreds } = await useMultiFileAuthState('./session')
    sock = makeWASocket({
        auth: state,
        browser: Browsers.ubuntu("Chrome")
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
        console.log("CODE:", pairingCode)
    }
}

// Disconnect function
async function disconnectBot() {
    if(sock) {
        await sock.logout()
        sock = null
    }
    isConnected = false
    status = "Disconnected"
    pairingCode = ""
}

// WEBSITE
app.get('/', (req, res) => {
    res.send(`
    <html>
    <head><title>Vigilant Bot Panel</title>
    <style>
        body{font-family:sans-serif;background:#111;color:#fff;display:flex;justify-content:center;align-items:center;height:100vh}
        .box{background:#222;padding:30px;border-radius:12px;text-align:center;width:350px}
        input{padding:10px;width:90%;border:none;border-radius:8px;margin:10px 0}
        button{padding:10px 15px;margin:5px;border:none;border-radius:8px;cursor:pointer;font-weight:bold}
        .pair{background:#25D366;color:#fff}
        .restart{background:#ff9800;color:#fff}
        .disconnect{background:#f44336;color:#fff}
        .code{font-size:24px;font-weight:bold;color:#25D366;margin:15px 0}
        .status{margin:10px 0;font-size:14px;color:#aaa}
    </style>
    </head>
    <body>
        <div class="box">
            <h2>Vigilant Bot Panel</h2>
            
            <form method="POST" action="/pair">
                <p>Enter WhatsApp Number with country code</p>
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

            <p style="font-size:12px;margin-top:15px">After getting code: WhatsApp > Linked Devices > Link with phone number</p>
        </div>
    </body>
    </html>
    `)
})

// HANDLE FORM
app.post('/pair', async (req, res) => {
    const number = req.body.number
    status = "Generating code..."
    pairingCode = ""
    await startBot(number)
    res.redirect('/')
})

app.post('/restart', async (req, res) => {
    status = "Restarting..."
    pairingCode = ""
    await disconnectBot()
    setTimeout(() => { process.exit(1) }, 1000) // Railway will auto restart
})

app.post('/disconnect', async (req, res) => {
    await disconnectBot()
    res.redirect('/')
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Website running on ${PORT}`))
