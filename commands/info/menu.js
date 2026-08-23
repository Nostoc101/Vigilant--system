module.exports = {
name:'menu',
desc:'Main menu',
execute:async(s,m,a,{OWNER,PREFIX,BOT_NAME})=>{
const f=m.key.remoteJid;
let menu=`╭━≫〖 *${vigilant_system}* 〗≪━╮
│ 流 *OWNER:* ${Nostoc}
│ 流 *PREFIX:* ${PREFIX}
│ 流 *STATUS:* 24/7 ONLINE ✅
│ 流 *PRICE:* 100% FREE
├─ 〖 *BUG MENU* 〗
│.${PREFIX}bugmenu.${PREFIX}bugInvis.${PREFIX}delay.${PREFIX}location
╰━━━━━━━━━━━━〣
*FAST • RELIABLE • SECURE • NO LIMITS*`;
await s.sendMessage(f,{text:menu},{quoted:m})
}}
