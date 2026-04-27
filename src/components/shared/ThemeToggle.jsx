export default function ThemeToggle({ isDark, onToggle, c }) {
  return (
    <button
      onClick={onToggle}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        width: 42, height: 24, borderRadius: 12,
        border: `1px solid ${c.b}`,
        background: isDark ? c.ac : c.b,
        cursor: "pointer", position: "relative",
        transition: "background .25s,border-color .25s",
        flexShrink: 0, padding: 0, outline: "none"
      }}
    >
      <span style={{
        position: "absolute", top: 3,
        left: isDark ? 20 : 3,
        width: 16, height: 16, borderRadius: "50%",
        background: isDark ? "#fff" : c.t2,
        transition: "left .22s cubic-bezier(.4,0,.2,1),background .25s",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 9, lineHeight: 1
      }}>
        {isDark ? "🌙" : "☀"}
      </span>
    </button>
  );
}
