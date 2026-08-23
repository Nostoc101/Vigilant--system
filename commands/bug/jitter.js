module.exports={name:'jitter',execute:async(s,m,a)=>{const f=a[0]||m.key.remoteJid;await s.sendMessage(f,{text:'JITTER'.repeat(500)})}}
