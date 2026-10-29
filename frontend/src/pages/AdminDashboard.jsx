import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authFetch, isLoggedIn, logout } from "../services/authService";

function NavItem({ to, icon, label, active }) {
    return (
        <Link
            to={to}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 6,
                textDecoration: "none",
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                color: active ? "#2DD4E8" : "#8896A3",
                background: active ? "rgba(45, 212, 232, 0.12)" : "transparent",
                border: active ? "1px solid rgba(45, 212, 232, 0.28)" : "1px solid transparent",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap"
            }}
            onMouseOver={(e) => {
                if (!active) {
                    e.currentTarget.style.color = "#E8EDF2";
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                }
            }}
            onMouseOut={(e) => {
                if (!active) {
                    e.currentTarget.style.color = "#8896A3";
                    e.currentTarget.style.background = "transparent";
                }
            }}
        >
            <span>{icon}</span>
            <span>{label}</span>
        </Link>
    );
}

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [publicUrl, setPublicUrl] = useState("");
    const [savingUrl, setSavingUrl] = useState(false);
    const [keys, setKeys] = useState([]);
    const [newKeyLabel, setNewKeyLabel] = useState("");
    const [newKeyOwner, setNewKeyOwner] = useState("");
    const [justCreatedKey, setJustCreatedKey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isLoggedIn()) {
            navigate("/login");
            return;
        }
        loadData();
    }, []);

    async function loadData() {
        try {
            setLoading(true);
            const settings = await authFetch("/settings");
            setPublicUrl(settings.publicApiUrl || "");

            const keyList = await authFetch("/admin/keys");
            setKeys(keyList);
            setError("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleSaveUrl() {
        try {
            setSavingUrl(true);
            await authFetch("/settings", {
                method: "PUT",
                body: JSON.stringify({ publicApiUrl: publicUrl }),
            });
            alert("Đã lưu link public thành công!");
        } catch (err) {
            alert("Lỗi: " + err.message);
        } finally {
            setSavingUrl(false);
        }
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text);
        alert("Đã copy vào bộ nhớ tạm!");
    }

    async function handleCreateKey(e) {
        e.preventDefault();
        try {
            const key = await authFetch("/admin/keys", {
                method: "POST",
                body: JSON.stringify({ label: newKeyLabel, owner: newKeyOwner }),
            });
            setJustCreatedKey(key);
            setNewKeyLabel("");
            setNewKeyOwner("");
            loadData();
        } catch (err) {
            alert("Lỗi: " + err.message);
        }
    }

    async function handleRevoke(id) {
        if (!confirm("Thu hồi key này? Người đang dùng sẽ không gọi API được nữa.")) return;
        try {
            await authFetch(`/admin/keys/${id}/revoke`, { method: "PATCH" });
            loadData();
        } catch (err) {
            alert("Lỗi: " + err.message);
        }
    }

    async function handleUnrevoke(id) {
        try {
            await authFetch(`/admin/keys/${id}/unrevoke`, { method: "PATCH" });
            loadData();
        } catch (err) {
            alert("Lỗi: " + err.message);
        }
    }

    function handleLogout() {
        logout();
        navigate("/login");
    }

    // Top Navigation Bar chung cho cả loading và main view
    const renderNavbar = () => (
        <header
            style={{
                position: "sticky",
                top: 0,
                zIndex: 100,
                background: "#10161D",
                borderBottom: "1px solid #1E2933",
                boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
            }}
        >
            <div
                style={{
                    maxWidth: 1100,
                    margin: "0 auto",
                    padding: "0 20px",
                    height: 60,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                }}
            >
                {/* Brand / Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Link
                        to="/air-quality"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            textDecoration: "none",
                            color: "#E8EDF2",
                        }}
                    >
                        <span style={{ fontSize: 20 }}>🌿</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em" }}>
                                Air Quality IOC
                            </span>
                            <span
                                style={{
                                    fontSize: 10,
                                    padding: "2px 7px",
                                    borderRadius: 4,
                                    background: "rgba(45, 212, 232, 0.12)",
                                    color: "#2DD4E8",
                                    border: "1px solid rgba(45, 212, 232, 0.3)",
                                    fontWeight: 600,
                                    letterSpacing: "0.05em",
                                    textTransform: "uppercase",
                                }}
                            >
                                Admin
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Nav Bar Links */}
                <nav
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        overflowX: "auto",
                        padding: "4px 0",
                    }}
                >
                    <NavItem to="/air-quality" icon="📊" label="Không khí" />
                    <NavItem to="/weather" icon="⛅" label="Thời tiết" />
                    <NavItem to="/forecast" icon="🤖" label="Dự báo AI" />
                    <NavItem to="/system" icon="🖥️" label="Hệ thống" />
                    <NavItem to="/admin" icon="⚙️" label="Quản trị" active />
                </nav>

                {/* User Info & Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 12,
                            color: "#8896A3",
                            background: "#0E141B",
                            padding: "6px 10px",
                            borderRadius: 6,
                            border: "1px solid #1E2933",
                        }}
                    >
                        <span
                            style={{
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                background: "#4ADE80",
                                display: "inline-block",
                                boxShadow: "0 0 6px rgba(74, 222, 128, 0.6)",
                            }}
                        />
                        <span>Online</span>
                    </div>

                    <button
                        onClick={handleLogout}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 12px",
                            background: "rgba(248, 113, 113, 0.1)",
                            color: "#F87171",
                            border: "1px solid rgba(248, 113, 113, 0.25)",
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = "rgba(248, 113, 113, 0.2)";
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = "rgba(248, 113, 113, 0.1)";
                        }}
                        title="Đăng xuất khỏi hệ thống"
                    >
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </div>
        </header>
    );

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", background: "#0A0E13", color: "#E8EDF2" }}>
                {renderNavbar()}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "calc(100vh - 120px)",
                        color: "#8896A3",
                    }}
                >
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 28, marginBottom: 12 }}>⚡</div>
                        <div style={{ fontSize: 14 }}>Đang tải dữ liệu cấu hình & API Keys...</div>
                    </div>
                </div>
            </div>
        );
    }

    const activeKeysCount = keys.filter((k) => !k.is_revoked).length;

    return (
        <div style={{ minHeight: "100vh", background: "#0A0E13", color: "#E8EDF2" }}>
            {/* Nav Bar */}
            {renderNavbar()}

            {/* Main Content */}
            <main style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 20px 60px" }}>
                {/* Header Title Section */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        gap: 16,
                        marginBottom: 28,
                    }}
                >
                    <div>
                        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#E8EDF2" }}>
                            Trang Quản trị Hệ thống
                        </h2>
                        <p style={{ color: "#8896A3", fontSize: 13, marginTop: 6, marginBottom: 0 }}>
                            Cấu hình Cloudflare Tunnel public URL và quản lý phân quyền API Keys cho đối tác.
                        </p>
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                        <Link
                            to="/air-quality"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "8px 14px",
                                background: "#10161D",
                                border: "1px solid #1E2933",
                                borderRadius: 6,
                                color: "#8896A3",
                                textDecoration: "none",
                                fontSize: 13,
                                fontWeight: 500,
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.color = "#E8EDF2";
                                e.currentTarget.style.borderColor = "#2DD4E8";
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.color = "#8896A3";
                                e.currentTarget.style.borderColor = "#1E2933";
                            }}
                        >
                            <span>← Về Dashboard</span>
                        </Link>
                    </div>
                </div>

                {error && (
                    <div
                        style={{
                            padding: "12px 16px",
                            marginBottom: 20,
                            background: "rgba(248, 113, 113, 0.1)",
                            border: "1px solid rgba(248, 113, 113, 0.3)",
                            borderRadius: 8,
                            color: "#F87171",
                            fontSize: 13,
                        }}
                    >
                        ⚠️ {error}
                    </div>
                )}

                {/* --- Section 1: Link API Public (Cloudflare Tunnel) --- */}
                <section
                    style={{
                        marginBottom: 24,
                        padding: 20,
                        background: "#10161D",
                        border: "1px solid #1E2933",
                        borderRadius: 10,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 18 }}>🌐</span>
                        <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: "#E8EDF2" }}>
                            Link API Public (Cloudflare Tunnel)
                        </h3>
                    </div>
                    <p style={{ color: "#8896A3", fontSize: 13, marginBottom: 14 }}>
                        Link này thay đổi mỗi lần bạn tắt/bật lại cloudflared. Dán link mới vào đây và bấm{" "}
                        <strong style={{ color: "#E8EDF2" }}>Lưu</strong> để hệ thống tự động cập nhật.
                    </p>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <input
                            type="text"
                            value={publicUrl}
                            onChange={(e) => setPublicUrl(e.target.value)}
                            placeholder="https://xxx-yyy.trycloudflare.com"
                            style={{
                                flex: 1,
                                minWidth: 260,
                                padding: "9px 12px",
                                background: "#0E141B",
                                border: "1px solid #1E2933",
                                borderRadius: 6,
                                color: "#E8EDF2",
                                fontSize: 13,
                                outline: "none",
                            }}
                        />
                        <button
                            onClick={handleSaveUrl}
                            disabled={savingUrl}
                            style={{
                                padding: "9px 18px",
                                background: "#2DD4E8",
                                color: "#0A0E13",
                                border: "none",
                                borderRadius: 6,
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: savingUrl ? "not-allowed" : "pointer",
                                opacity: savingUrl ? 0.7 : 1,
                            }}
                        >
                            {savingUrl ? "Đang lưu..." : "Lưu link"}
                        </button>
                        {publicUrl && (
                            <button
                                onClick={() => copyToClipboard(publicUrl)}
                                style={{
                                    padding: "9px 14px",
                                    background: "#0E141B",
                                    color: "#E8EDF2",
                                    border: "1px solid #1E2933",
                                    borderRadius: 6,
                                    fontSize: 13,
                                    cursor: "pointer",
                                }}
                            >
                                Copy
                            </button>
                        )}
                    </div>
                </section>

                {/* --- Section 2: Tạo API Key mới --- */}
                <section
                    style={{
                        marginBottom: 24,
                        padding: 20,
                        background: "#10161D",
                        border: "1px solid #1E2933",
                        borderRadius: 10,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 18 }}>🔑</span>
                        <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: "#E8EDF2" }}>
                            Tạo API Key mới để chia sẻ
                        </h3>
                    </div>
                    <p style={{ color: "#8896A3", fontSize: 13, marginBottom: 14 }}>
                        Cấp quyền truy cập API cho đối tác hoặc các dịch vụ tích hợp bên ngoài.
                    </p>
                    <form onSubmit={handleCreateKey} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <input
                            type="text"
                            placeholder="Ghi chú (vd: Chia sẻ cho Sở TNMT Đà Nẵng)"
                            value={newKeyLabel}
                            onChange={(e) => setNewKeyLabel(e.target.value)}
                            style={{
                                flex: 2,
                                minWidth: 200,
                                padding: "9px 12px",
                                background: "#0E141B",
                                border: "1px solid #1E2933",
                                borderRadius: 6,
                                color: "#E8EDF2",
                                fontSize: 13,
                                outline: "none",
                            }}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Người nhận (vd: email/tên)"
                            value={newKeyOwner}
                            onChange={(e) => setNewKeyOwner(e.target.value)}
                            style={{
                                flex: 1,
                                minWidth: 160,
                                padding: "9px 12px",
                                background: "#0E141B",
                                border: "1px solid #1E2933",
                                borderRadius: 6,
                                color: "#E8EDF2",
                                fontSize: 13,
                                outline: "none",
                            }}
                            required
                        />
                        <button
                            type="submit"
                            style={{
                                padding: "9px 18px",
                                background: "rgba(45, 212, 232, 0.15)",
                                color: "#2DD4E8",
                                border: "1px solid rgba(45, 212, 232, 0.35)",
                                borderRadius: 6,
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            + Tạo key
                        </button>
                    </form>

                    {justCreatedKey && (
                        <div
                            style={{
                                marginTop: 16,
                                padding: 14,
                                background: "rgba(74, 222, 128, 0.08)",
                                border: "1px solid rgba(74, 222, 128, 0.3)",
                                borderRadius: 8,
                            }}
                        >
                            <div style={{ color: "#4ADE80", fontWeight: 600, fontSize: 13, marginBottom: 8 }}>
                                ✓ Key vừa tạo thành công (sao chép gửi ngay, key đầy đủ sẽ không hiển thị lại):
                            </div>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <code
                                    style={{
                                        flex: 1,
                                        background: "#0A0E13",
                                        padding: "8px 12px",
                                        borderRadius: 6,
                                        border: "1px solid #1E2933",
                                        color: "#2DD4E8",
                                        fontFamily: "monospace",
                                        fontSize: 13,
                                        wordBreak: "break-all",
                                    }}
                                >
                                    {justCreatedKey.key_value}
                                </code>
                                <button
                                    onClick={() => copyToClipboard(justCreatedKey.key_value)}
                                    style={{
                                        padding: "8px 16px",
                                        background: "#4ADE80",
                                        color: "#0A0E13",
                                        border: "none",
                                        borderRadius: 6,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                    }}
                                >
                                    Copy Key
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                {/* --- Section 3: Danh sách Key --- */}
                <section
                    style={{
                        padding: 20,
                        background: "#10161D",
                        border: "1px solid #1E2933",
                        borderRadius: 10,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 16,
                            flexWrap: "wrap",
                            gap: 8,
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 18 }}>📋</span>
                            <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: "#E8EDF2" }}>
                                Danh sách API Key đã cấp
                            </h3>
                        </div>
                        <div style={{ fontSize: 12, color: "#8896A3" }}>
                            Tổng số: <strong style={{ color: "#E8EDF2" }}>{keys.length}</strong> | Hoạt động:{" "}
                            <strong style={{ color: "#4ADE80" }}>{activeKeysCount}</strong>
                        </div>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                            <thead>
                                <tr
                                    style={{
                                        borderBottom: "1px solid #1E2933",
                                        textAlign: "left",
                                        color: "#8896A3",
                                    }}
                                >
                                    <th style={{ padding: "10px 12px" }}>Ghi chú</th>
                                    <th style={{ padding: "10px 12px" }}>Người nhận</th>
                                    <th style={{ padding: "10px 12px" }}>Lượt gọi</th>
                                    <th style={{ padding: "10px 12px" }}>Trạng thái</th>
                                    <th style={{ padding: "10px 12px", textAlign: "right" }}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {keys.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ padding: 24, textAlign: "center", color: "#8896A3" }}>
                                            Chưa có API key nào được tạo.
                                        </td>
                                    </tr>
                                ) : (
                                    keys.map((k) => (
                                        <tr
                                            key={k.id}
                                            style={{
                                                borderBottom: "1px solid #161F28",
                                                transition: "background 0.15s ease",
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.background = "#141C24";
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.background = "transparent";
                                            }}
                                        >
                                            <td style={{ padding: "12px", fontWeight: 500, color: "#E8EDF2" }}>
                                                {k.label || "-"}
                                            </td>
                                            <td style={{ padding: "12px", color: "#8896A3" }}>
                                                {k.owner || "-"}
                                            </td>
                                            <td style={{ padding: "12px", color: "#2DD4E8", fontFamily: "monospace" }}>
                                                {k.request_count}
                                            </td>
                                            <td style={{ padding: "12px" }}>
                                                {k.is_revoked ? (
                                                    <span
                                                        style={{
                                                            fontSize: 11,
                                                            padding: "3px 8px",
                                                            borderRadius: 4,
                                                            background: "rgba(248, 113, 113, 0.12)",
                                                            color: "#F87171",
                                                            border: "1px solid rgba(248, 113, 113, 0.25)",
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        Đã thu hồi
                                                    </span>
                                                ) : (
                                                    <span
                                                        style={{
                                                            fontSize: 11,
                                                            padding: "3px 8px",
                                                            borderRadius: 4,
                                                            background: "rgba(74, 222, 128, 0.12)",
                                                            color: "#4ADE80",
                                                            border: "1px solid rgba(74, 222, 128, 0.25)",
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        Đang hoạt động
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: "12px", textAlign: "right" }}>
                                                {k.is_revoked ? (
                                                    <button
                                                        onClick={() => handleUnrevoke(k.id)}
                                                        style={{
                                                            padding: "5px 12px",
                                                            background: "rgba(74, 222, 128, 0.1)",
                                                            color: "#4ADE80",
                                                            border: "1px solid rgba(74, 222, 128, 0.25)",
                                                            borderRadius: 5,
                                                            fontSize: 12,
                                                            fontWeight: 500,
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        Kích hoạt lại
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleRevoke(k.id)}
                                                        style={{
                                                            padding: "5px 12px",
                                                            background: "rgba(248, 113, 113, 0.1)",
                                                            color: "#F87171",
                                                            border: "1px solid rgba(248, 113, 113, 0.25)",
                                                            borderRadius: 5,
                                                            fontSize: 12,
                                                            fontWeight: 500,
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        Thu hồi
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}
