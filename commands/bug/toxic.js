module.exports={name:'toxic',execute:async(s,m,a)=>{const f=a[0]||m.key.remoteJid;await s.sendMessage(f,{text:'TOXIC BUG'.repeat(300)})}}
