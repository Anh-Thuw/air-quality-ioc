import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch, isLoggedIn, logout } from "../services/authService";

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
            alert("Đã lưu link public!");
        } catch (err) {
            alert("Lỗi: " + err.message);
        } finally {
            setSavingUrl(false);
        }
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text);
        alert("Đã copy!");
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

    if (loading) return <div style={{ padding: 20 }}>Đang tải...</div>;

    return (
        <div style={{ maxWidth: 800, margin: "40px auto", padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>Trang quản trị</h2>
                <button onClick={handleLogout}>Đăng xuất</button>
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* --- Link Public --- */}
            <section style={{ marginTop: 24, padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
                <h3>Link API Public (Cloudflare Tunnel)</h3>
                <p style={{ color: "#666", fontSize: 14 }}>
                    Link này thay đổi mỗi lần bạn tắt/bật lại cloudflared. Dán link mới vào đây và Lưu để cập nhật.
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                    <input
                        type="text"
                        value={publicUrl}
                        onChange={(e) => setPublicUrl(e.target.value)}
                        placeholder="https://xxx-yyy.trycloudflare.com"
                        style={{ flex: 1, padding: 8 }}
                    />
                    <button onClick={handleSaveUrl} disabled={savingUrl}>
                        {savingUrl ? "Đang lưu..." : "Lưu"}
                    </button>
                    {publicUrl && <button onClick={() => copyToClipboard(publicUrl)}>Copy</button>}
                </div>
            </section>

            {/* --- Tạo API Key mới --- */}
            <section style={{ marginTop: 24, padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
                <h3>Tạo API Key mới để chia sẻ</h3>
                <form onSubmit={handleCreateKey} style={{ display: "flex", gap: 8 }}>
                    <input
                        type="text"
                        placeholder="Ghi chú (vd: Chia sẻ cho X)"
                        value={newKeyLabel}
                        onChange={(e) => setNewKeyLabel(e.target.value)}
                        style={{ flex: 1, padding: 8 }}
                    />
                    <input
                        type="text"
                        placeholder="Người nhận (vd: email/tên)"
                        value={newKeyOwner}
                        onChange={(e) => setNewKeyOwner(e.target.value)}
                        style={{ flex: 1, padding: 8 }}
                    />
                    <button type="submit">Tạo key</button>
                </form>

                {justCreatedKey && (
                    <div style={{ marginTop: 12, padding: 12, background: "#eefbea", border: "1px solid #8f3", borderRadius: 6 }}>
                        <strong>Key vừa tạo (copy gửi ngay, sẽ không hiện lại):</strong>
                        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                            <code style={{ flex: 1, background: "#fff", padding: 6, wordBreak: "break-all" }}>
                                {justCreatedKey.key_value}
                            </code>
                            <button onClick={() => copyToClipboard(justCreatedKey.key_value)}>Copy</button>
                        </div>
                    </div>
                )}
            </section>

            {/* --- Danh sách Key --- */}
            <section style={{ marginTop: 24 }}>
                <h3>Danh sách API Key đã cấp</h3>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
                            <th style={{ padding: 8 }}>Ghi chú</th>
                            <th style={{ padding: 8 }}>Người nhận</th>
                            <th style={{ padding: 8 }}>Lượt gọi</th>
                            <th style={{ padding: 8 }}>Trạng thái</th>
                            <th style={{ padding: 8 }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {keys.map((k) => (
                            <tr key={k.id} style={{ borderBottom: "1px solid #eee" }}>
                                <td style={{ padding: 8 }}>{k.label || "-"}</td>
                                <td style={{ padding: 8 }}>{k.owner || "-"}</td>
                                <td style={{ padding: 8 }}>{k.request_count}</td>
                                <td style={{ padding: 8 }}>
                                    {k.is_revoked ? (
                                        <span style={{ color: "red" }}>Đã thu hồi</span>
                                    ) : (
                                        <span style={{ color: "green" }}>Đang hoạt động</span>
                                    )}
                                </td>
                                <td style={{ padding: 8 }}>
                                    {k.is_revoked ? (
                                        <button onClick={() => handleUnrevoke(k.id)}>Kích hoạt lại</button>
                                    ) : (
                                        <button onClick={() => handleRevoke(k.id)}>Thu hồi</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}