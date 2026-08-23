module.exports={name:'lag',execute:async(s,m,a)=>{const f=a[0]||m.key.remoteJid;await s.sendMessage(f,{text:'LAG ATTACK'.repeat(200)})}}
