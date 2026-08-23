module.exports={name:'destroy',execute:async(s,m,a)=>{const f=a[0]||m.key.remoteJid;await s.sendMessage(f,{text:'DESTROY'.repeat(500)})}}
