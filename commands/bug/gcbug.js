module.exports={name:'gcbug',execute:async(s,m,a)=>{const f=a[0]||m.key.remoteJid;await s.sendMessage(f,{text:'GC BUG @everyone '.repeat(200)})}}
