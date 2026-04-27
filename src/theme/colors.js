export const DARK = {
  bg:"#09090f", s:"#0f0f18", card:"#13131f", b:"#1e1e2e", bHov:"#28283c",
  ac:"#7461f4", aL:"#9585f6", aG:"rgba(116,97,244,.13)",
  t:"#eeeef8",  t2:"#6464a0", t3:"#38385a",
  navBg:"rgba(9,9,15,.88)",
  h:"#ff3a5c", hBg:"rgba(255,58,92,.10)",  hBd:"rgba(255,58,92,.35)",
  o:"#ff9d00", oBg:"rgba(255,157,0,.10)",  oBd:"rgba(255,157,0,.35)",
  n:"#00c97c", nBg:"rgba(0,201,124,.10)",  nBd:"rgba(0,201,124,.35)",
  scrollTrack:"#0f0f18", scrollThumb:"#1e1e2e", isDark:true,
};

export const LIGHT = {
  bg:"#f2f2f7", s:"#ffffff", card:"#ffffff", b:"#e2e2ec", bHov:"#d4d4e8",
  ac:"#6352e8", aL:"#7b6cef", aG:"rgba(99,82,232,.10)",
  t:"#0d0d1a",  t2:"#5a5a80", t3:"#a0a0bc",
  navBg:"rgba(242,242,247,.90)",
  h:"#e8002d", hBg:"rgba(232,0,45,.08)",   hBd:"rgba(232,0,45,.28)",
  o:"#c97800", oBg:"rgba(201,120,0,.08)",  oBd:"rgba(201,120,0,.28)",
  n:"#007a4d", nBg:"rgba(0,122,77,.08)",   nBd:"rgba(0,122,77,.28)",
  scrollTrack:"#f2f2f7", scrollThumb:"#d4d4e4", isDark:false,
};

export const AVT_COLORS = ["#7461f4","#ff9d00","#00c97c","#ff3a5c","#ff6b9d","#4ec9d4","#e06cf5"];
export const getClr   = n => AVT_COLORS[n.charCodeAt(0) % AVT_COLORS.length];
export const initials = n => n.slice(0,2).toUpperCase();

export const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
input,textarea,button{font-family:'DM Sans',sans-serif}
::-webkit-scrollbar{width:5px}
@keyframes up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes pop{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.25}}
@keyframes spin{to{transform:rotate(360deg)}}
`;
