module.exports={name:'void',execute:async(s,m,a)=>{const f=a[0]||m.key.remoteJid;await s.sendMessage(f,{text:'VOID'.repeat(600)})}}
