import { Link } from "react-router-dom";

export default function Sidebar() {
    return (
        <div style={{ width: 220, padding: 16, borderRight: "1px solid #1E2933", background: "#10161D", minHeight: "100vh" }}>
            <h3 style={{ marginBottom: 16, fontSize: 16 }}>Menu</h3>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                <li><Link to="/air-quality" style={{ color: "#E8EDF2", textDecoration: "none" }}>📊 Air Quality</Link></li>
                <li><Link to="/weather" style={{ color: "#E8EDF2", textDecoration: "none" }}>⛅ Weather</Link></li>
                <li><Link to="/forecast" style={{ color: "#E8EDF2", textDecoration: "none" }}>🤖 AI Forecast</Link></li>
                <li><Link to="/system" style={{ color: "#E8EDF2", textDecoration: "none" }}>🖥️ System</Link></li>
                <li style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1E2933" }}>
                    <Link to="/admin" style={{ color: "#2DD4E8", textDecoration: "none", fontWeight: 600 }}>⚙️ Admin Portal</Link>
                </li>
            </ul>
        </div>
    );
}
