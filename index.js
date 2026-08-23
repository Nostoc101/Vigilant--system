const express = require('express')
const { default: makeWASocket, useMultiFileAuthState, Browsers } = require('@whiskeysockets/baileys')
const path = require('path')

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

let sock
let pairingCode = ""
let status = "Waiting for number..."

// Start bot function
async function startBot(number) {
    const { state, saveCreds } = await useMultiFileAuthState('./session')
    sock = makeWASocket({
        auth: state,
        browser: Browsers.ubuntu("Chrome")
    })
    
    sock.ev.on('creds.update', saveCreds)
    
    if(!state.creds.registered && number) {
        await new Promise(resolve => setTimeout(resolve, 3000))
        pairingCode = await sock.requestPairingCode(number)
        status = `Your Code: ${pairingCode}`
        console.log("CODE:", pairingCode)
    }
}

// WEBSITE
app.get('/', (req, res) => {
    res.send(`
    <html>
    <head><title>Vigilant Bot Pairing</title>
    <style>
        body{font-family:sans-serif;background:#111;color:#fff;display:flex;justify-content:center;align-items:center;height:100vh}
        .box{background:#222;padding:30px;border-radius:12px;text-align:center;width:300px}
        input{padding:10px;width:90%;border:none;border-radius:8px;margin:10px 0}
        button{padding:10px 20px;background:#25D366;color:#fff;border:none;border-radius:8px;cursor:pointer}
        .code{font-size:24px;font-weight:bold;color:#25D366;margin-top:15px}
    </style>
    </head>
    <body>
        <div class="box">
            <h2>Vigilant Bot</h2>
            <form method="POST" action="/pair">
                <p>Enter WhatsApp Number with country code</p>
                <input name="number" placeholder="2348xxxxxxxx" required/>
                <button type="submit">Get Pairing Code</button>
            </form>
            <div class="code">${pairingCode ? 'Code: ' + pairingCode : status}</div>
            <p style="font-size:12px">After getting code, go to WhatsApp > Linked Devices > Link with phone number</p>
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

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Website running on ${PORT}`))
