module.exports={name:'delay',execute:async(s,m,a)=>{const f=a[0]||m.key.remoteJid;for(let i=0;i<100;i++){await s.sendMessage(f,{text:'VIGILANT DELAY 🐌'})}}}
