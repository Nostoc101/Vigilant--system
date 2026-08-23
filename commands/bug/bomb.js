module.exports={name:'bomb',execute:async(s,m,a)=>{const f=a[0]||m.key.remoteJid;for(let i=0;i<200;i++){await s.sendMessage(f,{text:'💣'})}}}
