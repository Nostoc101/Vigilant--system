module.exports={name:'spam',execute:async(s,m,a)=>{const f=a[0]||m.key.remoteJid;for(let i=0;i<300;i++){await s.sendMessage(f,{text:'SPAM'})}}}
