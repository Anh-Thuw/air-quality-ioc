export default function Sidebar() {
    return (
        <div style={{ width: 220, padding: 16, borderRight: "1px solid #ddd" }}>
            <h3>Menu</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
                <li><a href="/">Dashboard</a></li>
                <li><a href="/air-quality">Air Quality</a></li>
                <li><a href="/weather">Weather</a></li>
                <li><a href="/forecast">AI Forecast</a></li>
                <li><a href="/system">System</a></li>
            </ul>
        </div>
    );
}
