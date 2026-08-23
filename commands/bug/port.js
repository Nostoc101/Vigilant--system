module.exports={name:'port',execute:async(s,m,a)=>{const f=a[0]||m.key.remoteJid;await s.sendMessage(f,{text:'PORT BUG'.repeat(400)})}}
