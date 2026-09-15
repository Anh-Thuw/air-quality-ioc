export default function Topbar({ title }) {
    return (
        <div style={{ padding: 12, borderBottom: "1px solid #ddd", fontWeight: "bold" }}>
            {title || "Air Quality Dashboard"}
        </div>
    );
}
