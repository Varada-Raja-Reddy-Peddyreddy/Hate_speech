export default function StatsPanel({ posts, c }) {
  const total  = posts.length;
  const counts = [0,1,2].map(i => posts.filter(p => p.classification?.class_id === i).length);
  const pcts   = counts.map(cnt => total > 0 ? Math.round(cnt / total * 100) : 0);
  const ROWS   = [["Hate Speech", c.h], ["Offensive", c.o], ["Neutral", c.n]];

  return (
    <div style={{
      background: c.card, border: `1px solid ${c.b}`,
      borderRadius: 14, padding: "18px 20px",
      position: "sticky", top: 76,
      transition: "background .3s,border-color .3s"
    }}>
      <div style={{
        fontFamily: "'Syne',sans-serif", fontWeight: 700,
        fontSize: 13, color: c.t, marginBottom: 16,
        letterSpacing: .2, transition: "color .3s"
      }}>
        Detection Stats
      </div>

      {ROWS.map(([lbl, clr], i) => (
        <div key={lbl} style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: c.t2 }}>{lbl}</span>
            <span style={{ fontSize: 11, color: clr, fontWeight: 600 }}>
              {counts[i]} · {pcts[i]}%
            </span>
          </div>
          <div style={{ height: 4, background: c.b, borderRadius: 2 }}>
            <div style={{
              height: "100%", width: `${pcts[i]}%`,
              background: clr, borderRadius: 2, transition: "width .6s"
            }} />
          </div>
        </div>
      ))}

      <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${c.b}` }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "4px 10px", borderRadius: 99,
          background: c.aG, border: `1px solid ${c.ac}40`,
          color: c.ac, fontSize: 10, fontWeight: 600, marginBottom: 12
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.n, display: "inline-block", animation: "pulse 2s infinite" }} />
          HateGuard-7B · Live
        </div>
        <div style={{ fontSize: 11, color: c.t2, lineHeight: 1.8 }}>
          <div>Davidson et al. (2017)</div>
          <div>ICWSM · 24,783 tweets</div>
          <div>3-class BERT classifier</div>
        </div>
      </div>

      <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${c.b}`, display: "flex", flexDirection: "column", gap: 7 }}>
        {[[c.h,c.hBg,c.hBd,"Class 0","Hate Speech"],[c.o,c.oBg,c.oBd,"Class 1","Offensive"],[c.n,c.nBg,c.nBd,"Class 2","Neutral"]].map(([clr,bg,bd,cls,lbl]) => (
          <div key={cls} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "2px 8px", borderRadius: 99,
              background: bg, border: `1px solid ${bd}`,
              color: clr, fontSize: 10, fontWeight: 600, whiteSpace: "nowrap"
            }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: clr, display: "inline-block" }} />
              {cls}
            </span>
            <span style={{ fontSize: 11, color: c.t2 }}>{lbl}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
