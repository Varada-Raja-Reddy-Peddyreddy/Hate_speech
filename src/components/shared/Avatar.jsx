export default function Avatar({ label, color, size = 36 }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: "50%",
      background: color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * .35, fontWeight: 700, color: "#fff",
      flexShrink: 0, letterSpacing: -.5
    }}>
      {label}
    </div>
  );
}
