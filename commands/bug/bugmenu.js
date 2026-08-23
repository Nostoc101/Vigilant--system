module.exports = {
name:'bugmenu',
desc:'Show bug menu',
execute:async(s,m)=>{
const f=m.key.remoteJid;
let txt=`╭━≫〖 *VIGILANT BUG MENU* 〗≪━╮
│.delay.lag.crash.invis
│.bugdoc.bugvc.bugpair.location
│.spam.jitter.freeze.gcbug
╰━━━━━━━━━━━━〣`;
await s.sendMessage(f,{text:txt},{quoted:m})
}}
