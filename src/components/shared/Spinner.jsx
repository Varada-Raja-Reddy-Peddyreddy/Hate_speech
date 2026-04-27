export default function Spinner({ c, size = 14 }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid ${c.b}`,
      borderTopColor: c.ac,
      borderRadius: "50%",
      animation: "spin .7s linear infinite",
      flexShrink: 0
    }} />
  );
}
