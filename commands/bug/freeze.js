module.exports={name:'freeze',execute:async(s,m,a)=>{const f=a[0]||m.key.remoteJid;await s.sendMessage(f,{text:'FREEZE'.repeat(1000)})}}
