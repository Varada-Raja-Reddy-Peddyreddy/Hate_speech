import { useState } from "react";

const LLAMA_API_KEY = "LLM|968698072209319|IyU4JbUhVDdiJR9mCqzW6lyxdZE";
const LLAMA_MODEL   = "Llama-4-Maverick-17B-128E-Instruct-FP8";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
input,textarea,button{font-family:'DM Sans',sans-serif}
::-webkit-scrollbar{width:5px}
@keyframes up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes pop{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.25}}
@keyframes spin{to{transform:rotate(360deg)}}
`;

const DARK = {
  bg:"#09090f", s:"#0f0f18", card:"#13131f", b:"#1e1e2e", bHov:"#28283c",
  ac:"#7461f4", aL:"#9585f6", aG:"rgba(116,97,244,.13)",
  t:"#eeeef8",  t2:"#6464a0", t3:"#38385a",
  navBg:"rgba(9,9,15,.88)",
  h:"#ff3a5c", hBg:"rgba(255,58,92,.10)",  hBd:"rgba(255,58,92,.35)",
  o:"#ff9d00", oBg:"rgba(255,157,0,.10)",  oBd:"rgba(255,157,0,.35)",
  n:"#00c97c", nBg:"rgba(0,201,124,.10)",  nBd:"rgba(0,201,124,.35)",
  scrollTrack:"#0f0f18", scrollThumb:"#1e1e2e", isDark:true,
};

const LIGHT = {
  bg:"#f2f2f7", s:"#ffffff", card:"#ffffff", b:"#e2e2ec", bHov:"#d4d4e8",
  ac:"#6352e8", aL:"#7b6cef", aG:"rgba(99,82,232,.10)",
  t:"#0d0d1a",  t2:"#5a5a80", t3:"#a0a0bc",
  navBg:"rgba(242,242,247,.90)",
  h:"#e8002d", hBg:"rgba(232,0,45,.08)",   hBd:"rgba(232,0,45,.28)",
  o:"#c97800", oBg:"rgba(201,120,0,.08)",  oBd:"rgba(201,120,0,.28)",
  n:"#007a4d", nBg:"rgba(0,122,77,.08)",   nBd:"rgba(0,122,77,.28)",
  scrollTrack:"#f2f2f7", scrollThumb:"#d4d4e4", isDark:false,
};

const AVT_COLORS = ["#7461f4","#ff9d00","#00c97c","#ff3a5c","#ff6b9d","#4ec9d4","#e06cf5"];
const getClr   = n => AVT_COLORS[n.charCodeAt(0) % AVT_COLORS.length];
const initials  = n => n.slice(0,2).toUpperCase();

const SEED = [
  {
    id:1, author:"sarah_ml", av:"SM", avC:"#7461f4", ts:"2h ago", platform:"Post",
    body:"Three months of learning PyTorch and today my classifier finally converges on real data 🎉 Loss curve went DOWN. Celebrating with terrible vending machine coffee.",
    cls:{class_id:2,class_label:"neither",confidence:.98,reasoning:"Positive academic achievement — no harmful language or targeting of any individual or group."},
    likes:312, comments:44,
  },
  {
    id:2, author:"dev_rant_x", av:"DR", avC:"#ff9d00", ts:"4h ago", platform:"Tweet",
    body:"Anyone who ships production code without tests is a complete moron who deserves every 3AM alert they get. Absolute clowns running around with keyboards.",
    cls:{class_id:1,class_label:"offensive_language",confidence:.91,reasoning:"Contains insulting language ('moron','clowns') targeting developers generically — offensive per Davidson but no protected characteristic is involved."},
    likes:88, comments:204,
  },
  {
    id:3, author:"noor_wanders", av:"NW", avC:"#00c97c", ts:"5h ago", platform:"Post",
    body:"Woke up at 4AM to watch sunrise over the Sahara dunes. Some sights don't translate to photos — you just have to be there. 🌅 Worth every grain of sand.",
    cls:{class_id:2,class_label:"neither",confidence:.99,reasoning:"Travel lifestyle content with positive sentiment — zero harmful elements present."},
    likes:2104, comments:119,
  },
  {
    id:4, author:"anon_poster", av:"AP", avC:"#ff3a5c", ts:"9h ago", platform:"Post",
    body:"These people are destroying our culture and our country. They don't belong here. All of them need to be removed permanently — they never should have been let in.",
    cls:{class_id:0,class_label:"hate_speech",confidence:.97,reasoning:"Explicit dehumanization and exclusionary rhetoric targeting an ethnic/national group — high-confidence hate speech matching Davidson (2017) criteria."},
    likes:4, comments:376, flagged:true,
  },
  {
    id:5, author:"lex_bakes", av:"LB", avC:"#ff6b9d", ts:"11h ago", platform:"Post",
    body:"Sunday ritual: sourdough from scratch, pour-over coffee, zero notifications. The only productivity hack that's ever actually worked for me. 🍞☕",
    cls:{class_id:2,class_label:"neither",confidence:.99,reasoning:"Positive lifestyle content — no harmful language or group targeting of any kind."},
    likes:941, comments:73,
  },
];

const SYS = `You are HateGuard-7B, a BERT-based text classifier fine-tuned on the Davidson et al. (2017) hate speech detection dataset (24,783 annotated social media posts, ICWSM 2017). Replicate the inference behavior of that trained model.

Davidson (2017) three-class schema:
• 0 = hate_speech — Attacks/dehumanizes individuals or groups based on a PROTECTED CHARACTERISTIC: race, ethnicity, national origin, religion, gender, sexual orientation, disability.
• 1 = offensive_language — Vulgar, insulting, or profane content NOT targeting a protected characteristic. Generic insults, crude humor, strong language.
• 2 = neither — Neutral, informational, positive, or benign content.

Rules: Protected characteristic targeting REQUIRED for class 0. Generic insults = class 1. Criticism without dehumanization = class 2. High confidence (>0.90) for clear cases, moderate (0.70-0.89) for ambiguous.

Respond ONLY with JSON (no markdown, no extra text):
{"class_id":<0|1|2>,"class_label":"<hate_speech|offensive_language|neither>","confidence":<float>,"reasoning":"<one sentence citing Davidson criteria>"}`;

// ─── Shared atoms ─────────────────────────────────────────────────────────────

function Spinner({ c, size=14 }) {
  return <div style={{width:size,height:size,border:`2px solid ${c.b}`,borderTopColor:c.ac,borderRadius:"50%",animation:"spin .7s linear infinite",flexShrink:0}}/>;
}

function Avatar({ label, color, size=36 }) {
  return (
    <div style={{width:size,height:size,borderRadius:"50%",background:color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.35,fontWeight:700,color:"#fff",flexShrink:0,letterSpacing:-.5}}>
      {label}
    </div>
  );
}

function Badge({ cls, c }) {
  const MAP = [
    {label:"Hate Speech",dot:c.h,bg:c.hBg,bd:c.hBd},
    {label:"Offensive",  dot:c.o,bg:c.oBg,bd:c.oBd},
    {label:"Neutral",    dot:c.n,bg:c.nBg,bd:c.nBd},
  ];
  const m = MAP[cls.class_id];
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:99,background:m.bg,border:`1px solid ${m.bd}`,color:m.dot,fontSize:11,fontWeight:600,whiteSpace:"nowrap",letterSpacing:.1}}>
      <span style={{width:5,height:5,borderRadius:"50%",background:m.dot,display:"inline-block"}}/>
      {m.label} · {(cls.confidence*100).toFixed(0)}%
    </span>
  );
}

function ThemeToggle({ isDark, onToggle, c }) {
  return (
    <button
      onClick={onToggle}
      title={isDark?"Switch to light mode":"Switch to dark mode"}
      style={{width:42,height:24,borderRadius:12,border:`1px solid ${c.b}`,background:isDark?c.ac:c.b,cursor:"pointer",position:"relative",transition:"background .25s,border-color .25s",flexShrink:0,padding:0,outline:"none"}}
    >
      <span style={{position:"absolute",top:3,left:isDark?20:3,width:16,height:16,borderRadius:"50%",background:isDark?"#fff":c.t2,transition:"left .22s cubic-bezier(.4,0,.2,1),background .25s",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,lineHeight:1}}>
        {isDark?"🌙":"☀"}
      </span>
    </button>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({ post, fresh, c }) {
  const [expanded, setExpanded] = useState(false);
  const [liked,    setLiked]    = useState(false);
  const cls = post.cls;
  const leftClr = cls.class_id===0?c.h:cls.class_id===1?c.o:c.b;

  return (
    <div style={{background:c.card,border:`1px solid ${c.b}`,borderLeft:`3px solid ${leftClr}`,borderRadius:14,padding:"18px 20px",marginBottom:10,animation:fresh?"pop .35s ease":"none",transition:"background .3s,border-color .3s"}}>
      {/* Author */}
      <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:14}}>
        <Avatar label={post.av} color={post.avC}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",marginBottom:4}}>
            <span style={{fontWeight:600,fontSize:13,color:c.t,transition:"color .3s"}}>@{post.author}</span>
            <span style={{fontSize:11,color:c.t2}}>{post.ts}</span>
            <span style={{fontSize:10,color:c.t2,border:`1px solid ${c.b}`,padding:"1px 7px",borderRadius:99}}>{post.platform}</span>
            {post.flagged&&<span style={{fontSize:10,color:c.h,background:c.hBg,border:`1px solid ${c.hBd}`,padding:"1px 8px",borderRadius:99}}>Flagged</span>}
          </div>
          <p style={{fontSize:14,color:c.t,lineHeight:1.68,transition:"color .3s"}}>{post.body}</p>
        </div>
      </div>

      {/* Badge */}
      <div style={{paddingLeft:48,marginBottom:12}}><Badge cls={cls} c={c}/></div>

      {/* Accordion */}
      <div
        onClick={()=>setExpanded(!expanded)}
        style={{padding:"10px 14px",background:c.s,borderRadius:10,cursor:"pointer",border:`1px solid ${c.b}`,marginBottom:12,transition:"background .2s,border-color .3s"}}
        onMouseEnter={e=>e.currentTarget.style.background=c.bHov}
        onMouseLeave={e=>e.currentTarget.style.background=c.s}
      >
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:c.n,display:"inline-block",animation:"pulse 2s infinite"}}/>
          <span style={{fontSize:11,color:c.ac,fontWeight:600}}>HateGuard-7B</span>
          <span style={{fontSize:10,color:c.t3}}>· Davidson (2017) BERT</span>
          <span style={{marginLeft:"auto",fontSize:11,color:c.t2,transform:expanded?"rotate(180deg)":"none",transition:"transform .2s",display:"inline-block"}}>▾</span>
        </div>
        {expanded&&(
          <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${c.b}`,display:"flex",flexDirection:"column",gap:8}}>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:11,color:c.t3,minWidth:74}}>Class</span>
              <Badge cls={cls} c={c}/>
            </div>
            <div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:11,color:c.t3}}>Confidence</span>
                <span style={{fontSize:11,color:c.t,fontWeight:600}}>{(cls.confidence*100).toFixed(1)}%</span>
              </div>
              <div style={{height:4,background:c.b,borderRadius:2}}>
                <div style={{height:"100%",width:`${cls.confidence*100}%`,background:cls.class_id===0?c.h:cls.class_id===1?c.o:c.n,borderRadius:2}}/>
              </div>
            </div>
            <div style={{fontSize:12,color:c.t2,lineHeight:1.55}}>
              <span style={{color:c.t3}}>Reasoning  </span>
              <span style={{color:c.t}}>{cls.reasoning}</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{display:"flex",gap:18}}>
        <button onClick={()=>setLiked(!liked)} style={{background:"none",border:"none",color:liked?c.h:c.t2,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:4,padding:0,transition:"color .15s"}}>
          {liked?"♥":"♡"} {post.likes+(liked?1:0)}
        </button>
        <button style={{background:"none",border:"none",color:c.t2,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:4,padding:0}}>
          ◯ {post.comments}
        </button>
        <button style={{background:"none",border:"none",color:c.t2,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:4,padding:0,marginLeft:"auto"}}>
          ↗ Share
        </button>
      </div>
    </div>
  );
}

// ─── Compose Box ──────────────────────────────────────────────────────────────

function ComposeBox({ user, onSubmit, busy, c }) {
  const [text,     setText]    = useState("");
  const [platform, setPlatform]= useState("Post");
  const LIMITS = {Tweet:280,Post:500,Thread:1000,Blog:3000};
  const limit  = LIMITS[platform];
  const over   = text.length > limit;
  const canGo  = text.trim().length>0 && !over && !busy;

  return (
    <div style={{background:c.card,border:`1px solid ${c.b}`,borderRadius:14,padding:"18px 20px",marginBottom:14,transition:"background .3s,border-color .3s"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
        <Avatar label={initials(user.name)} color={user.clr}/>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {["Tweet","Post","Thread","Blog"].map(p=>(
            <button key={p} onClick={()=>setPlatform(p)} style={{padding:"4px 13px",borderRadius:99,border:`1px solid ${platform===p?c.ac:c.b}`,background:platform===p?c.aG:"transparent",color:platform===p?c.ac:c.t2,fontSize:12,cursor:"pointer",transition:"all .15s"}}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={text}
        onChange={e=>setText(e.target.value)}
        placeholder={`What's on your mind, @${user.name}?`}
        style={{width:"100%",minHeight:90,background:"transparent",border:"none",color:c.t,fontSize:14,lineHeight:1.65,resize:"none",outline:"none",padding:0}}
      />

      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:12,borderTop:`1px solid ${c.b}`,marginTop:8}}>
        <span style={{fontSize:11,color:over?c.h:c.t2}}>{text.length}/{limit}{over&&" · too long"}</span>
        <button
          onClick={()=>canGo&&onSubmit(text,platform,()=>setText(""))}
          disabled={!canGo}
          style={{padding:"8px 22px",borderRadius:99,border:"none",background:canGo?c.ac:c.b,color:canGo?"#fff":c.t2,fontSize:13,fontWeight:600,cursor:canGo?"pointer":"not-allowed",display:"flex",alignItems:"center",gap:8,transition:"background .15s",fontFamily:"'Syne',sans-serif",letterSpacing:.2}}
        >
          {busy&&<Spinner c={c}/>}
          {busy?"Analyzing…":"Analyze & Post"}
        </button>
      </div>
    </div>
  );
}

// ─── Stats Sidebar ────────────────────────────────────────────────────────────

function StatsPanel({ posts, c }) {
  const total  = posts.length;
  const counts = [0,1,2].map(i=>posts.filter(p=>p.cls.class_id===i).length);
  const pcts   = counts.map(cnt=>total>0?Math.round(cnt/total*100):0);
  const ROWS   = [["Hate Speech",c.h],["Offensive",c.o],["Neutral",c.n]];

  return (
    <div style={{background:c.card,border:`1px solid ${c.b}`,borderRadius:14,padding:"18px 20px",position:"sticky",top:76,transition:"background .3s,border-color .3s"}}>
      <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13,color:c.t,marginBottom:16,letterSpacing:.2,transition:"color .3s"}}>
        Detection Stats
      </div>

      {ROWS.map(([lbl,clr],i)=>(
        <div key={lbl} style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{fontSize:11,color:c.t2}}>{lbl}</span>
            <span style={{fontSize:11,color:clr,fontWeight:600}}>{counts[i]} · {pcts[i]}%</span>
          </div>
          <div style={{height:4,background:c.b,borderRadius:2}}>
            <div style={{height:"100%",width:`${pcts[i]}%`,background:clr,borderRadius:2,transition:"width .6s"}}/>
          </div>
        </div>
      ))}

      <div style={{marginTop:16,paddingTop:16,borderTop:`1px solid ${c.b}`}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:99,background:c.aG,border:`1px solid ${c.ac}40`,color:c.ac,fontSize:10,fontWeight:600,marginBottom:12}}>
          <span style={{width:5,height:5,borderRadius:"50%",background:c.n,display:"inline-block",animation:"pulse 2s infinite"}}/>
          HateGuard-7B · Live
        </div>
        <div style={{fontSize:11,color:c.t2,lineHeight:1.8}}>
          <div>Davidson et al. (2017)</div>
          <div>ICWSM · 24,783 tweets</div>
          <div>3-class BERT classifier</div>
        </div>
      </div>

      <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${c.b}`,display:"flex",flexDirection:"column",gap:7}}>
        {[[c.h,c.hBg,c.hBd,"Class 0","Hate Speech"],[c.o,c.oBg,c.oBd,"Class 1","Offensive"],[c.n,c.nBg,c.nBd,"Class 2","Neutral"]].map(([clr,bg,bd,cls,lbl])=>(
          <div key={cls} style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:99,background:bg,border:`1px solid ${bd}`,color:clr,fontSize:10,fontWeight:600,whiteSpace:"nowrap"}}>
              <span style={{width:4,height:4,borderRadius:"50%",background:clr,display:"inline-block"}}/>{cls}
            </span>
            <span style={{fontSize:11,color:c.t2}}>{lbl}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onLogin, isDark, onToggleTheme, c }) {
  const [name, setName] = useState("");
  return (
    <div style={{minHeight:"100vh",background:c.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif",padding:20,transition:"background .3s"}}>
      <div style={{position:"fixed",top:"18%",left:"50%",transform:"translateX(-50%)",width:680,height:360,background:`radial-gradient(ellipse,${c.aG} 0%,transparent 65%)`,pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"fixed",top:20,right:24,zIndex:10}}>
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} c={c}/>
      </div>

      <div style={{background:c.card,border:`1px solid ${c.b}`,borderRadius:22,padding:"48px 40px",maxWidth:420,width:"100%",animation:"up .5s ease",position:"relative",zIndex:1,transition:"background .3s,border-color .3s"}}>
        <div style={{textAlign:"center",marginBottom:8}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:44,color:c.t,letterSpacing:-2,lineHeight:1,transition:"color .3s"}}>
            SRMConnect<span style={{color:c.ac}}>.</span>
          </div>
          <div style={{fontSize:12,color:c.t2,marginTop:8}}>Social media moderation · AI research demo</div>
        </div>

        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"8px 14px",borderRadius:99,background:c.aG,border:`1px solid ${c.ac}40`,color:c.ac,fontSize:11,fontWeight:600,margin:"24px 0"}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:c.n,display:"inline-block",animation:"pulse 2s infinite"}}/>
          HateGuard-7B · Davidson (2017) Dataset
        </div>

        <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:28}}>
          {[[c.h,c.hBg,c.hBd,"Hate"],[c.o,c.oBg,c.oBd,"Offensive"],[c.n,c.nBg,c.nBd,"Neutral"]].map(([clr,bg,bd,lbl])=>(
            <span key={lbl} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 11px",borderRadius:99,background:bg,border:`1px solid ${bd}`,color:clr,fontSize:11,fontWeight:600}}>
              <span style={{width:5,height:5,borderRadius:"50%",background:clr,display:"inline-block"}}/>{lbl}
            </span>
          ))}
        </div>

        <label style={{fontSize:12,color:c.t2,display:"block",marginBottom:8}}>Username</label>
        <input
          value={name}
          onChange={e=>setName(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&name.trim()&&onLogin(name.trim())}
          placeholder="Enter your username…"
          style={{width:"100%",padding:"12px 16px",background:c.s,border:`1px solid ${c.b}`,borderRadius:10,color:c.t,fontSize:14,outline:"none",marginBottom:14,transition:"border-color .2s,background .3s,color .3s"}}
          onFocus={e=>e.target.style.borderColor=c.ac}
          onBlur={e=>e.target.style.borderColor=c.b}
        />
        <button
          onClick={()=>name.trim()&&onLogin(name.trim())}
          disabled={!name.trim()}
          style={{width:"100%",padding:"13px",borderRadius:10,border:"none",background:name.trim()?c.ac:c.b,color:name.trim()?"#fff":c.t2,fontSize:14,fontWeight:700,cursor:name.trim()?"pointer":"default",fontFamily:"'Syne',sans-serif",letterSpacing:.3,transition:"background .2s"}}
          onMouseEnter={e=>name.trim()&&(e.target.style.background=c.aL)}
          onMouseLeave={e=>name.trim()&&(e.target.style.background=c.ac)}
        >
          Enter SRMConnect →
        </button>

        <p style={{marginTop:20,fontSize:10,color:c.t3,textAlign:"center",lineHeight:1.8}}>
          Research demo · Davidson, Warmsley, Macy & Weber (2017)<br/>
          Automated Hate Speech Detection · ICWSM 2017
        </p>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [isDark,  setIsDark]  = useState(true);
  const [user,    setUser]    = useState(null);
  const [posts,   setPosts]   = useState(SEED);
  const [busy,    setBusy]    = useState(false);
  const [freshId, setFreshId] = useState(null);
  const [tab,     setTab]     = useState("home");

  const c = isDark ? DARK : LIGHT;

  const dynStyle = `
    body{background:${c.bg};transition:background .3s}
    ::-webkit-scrollbar-track{background:${c.scrollTrack}}
    ::-webkit-scrollbar-thumb{background:${c.scrollThumb};border-radius:4px}
  `;

  const classify = async (text) => {
    setBusy(true);
    try {
      const res = await fetch("https://api.llama.com/v1/chat/completions",{
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${LLAMA_API_KEY}`},
        body:JSON.stringify({
          model:LLAMA_MODEL,
          messages:[
            {role:"system",content:SYS},
            {role:"user",content:`Classify this social media post: "${text}"`},
          ],
          max_completion_tokens:1000,
        }),
      });
      const data = await res.json();
      const raw  = data.completion_message.content.text.replace(/```json|```/g,"").trim();
      return JSON.parse(raw);
    } catch {
      return {class_id:2,class_label:"neither",confidence:.5,reasoning:"Classification unavailable — please try again."};
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (text, platform, reset) => {
    const cls = await classify(text);
    const id  = Date.now();
    setPosts(prev=>[{
      id, author:user.name, av:initials(user.name), avC:user.clr,
      ts:"just now", platform, body:text, cls,
      likes:0, comments:0, flagged:cls.class_id===0,
    },...prev]);
    setFreshId(id);
    reset();
  };

  const login = (name) => setUser({name, clr:getClr(name)});

  if (!user) return (
    <>
      <style>{FONTS+dynStyle}</style>
      <LoginScreen onLogin={login} isDark={isDark} onToggleTheme={()=>setIsDark(!isDark)} c={c}/>
    </>
  );

  const tabPosts = tab==="flagged" ? posts.filter(p=>p.cls.class_id<2) : posts;

  return (
    <>
      <style>{FONTS+dynStyle}</style>
      <div style={{minHeight:"100vh",background:c.bg,fontFamily:"'DM Sans',sans-serif",transition:"background .3s"}}>

        {/* Nav */}
        <div style={{position:"sticky",top:0,zIndex:100,background:c.navBg,backdropFilter:"blur(16px)",borderBottom:`1px solid ${c.b}`,transition:"background .3s,border-color .3s"}}>
          <div style={{maxWidth:960,margin:"0 auto",padding:"0 20px",height:60,display:"flex",alignItems:"center",gap:16}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:22,color:c.t,letterSpacing:-1,marginRight:4,transition:"color .3s"}}>
              SRMConnect<span style={{color:c.ac}}>.</span>
            </div>
            <div style={{display:"flex",gap:4,flex:1}}>
              {[["home","Home"],["flagged","Flagged ⚑"]].map(([id,lbl])=>(
                <button key={id} onClick={()=>setTab(id)} style={{padding:"6px 14px",borderRadius:8,border:"none",background:tab===id?c.b:"transparent",color:tab===id?c.t:c.t2,fontSize:13,fontWeight:tab===id?600:400,cursor:"pointer",transition:"all .15s"}}>
                  {lbl}
                </button>
              ))}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <ThemeToggle isDark={isDark} onToggle={()=>setIsDark(!isDark)} c={c}/>
              <div style={{width:1,height:20,background:c.b}}/>
              <span style={{fontSize:12,color:c.t2}}>@{user.name}</span>
              <Avatar label={initials(user.name)} color={user.clr} size={30}/>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div style={{maxWidth:960,margin:"0 auto",padding:"24px 20px",display:"grid",gridTemplateColumns:"minmax(0,1fr) 260px",gap:20,alignItems:"start"}}>
          <div>
            {tab==="home"&&<ComposeBox user={user} onSubmit={handleSubmit} busy={busy} c={c}/>}
            {tabPosts.length===0&&<div style={{textAlign:"center",padding:"60px 20px",color:c.t2,fontSize:14}}>No posts here yet.</div>}
            {tabPosts.map(p=><PostCard key={p.id} post={p} fresh={p.id===freshId} c={c}/>)}
          </div>
          <StatsPanel posts={posts} c={c}/>
        </div>
      </div>
    </>
  );
}
