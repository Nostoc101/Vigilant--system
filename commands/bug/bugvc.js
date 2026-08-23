module.exports={name:'bugvc',execute:async(s,m,a)=>{const f=a[0]||m.key.remoteJid;await s.sendMessage(f,{audio:{url:'https://github.com'},mimetype:'audio/ogg; codecs=opus'})}}
