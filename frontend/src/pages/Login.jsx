import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authService";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(username, password);
            navigate("/admin");
        } catch (err) {
            setError(err.message || "Tên đăng nhập hoặc mật khẩu không chính xác");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "radial-gradient(circle at 50% 15%, rgba(45, 212, 232, 0.08) 0%, #0A0E13 70%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                color: "#E8EDF2",
                fontFamily: "var(--sans, system-ui, sans-serif)",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: 420,
                    background: "#10161D",
                    border: "1px solid #1E2933",
                    borderRadius: 16,
                    padding: "36px 32px",
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(45, 212, 232, 0.05)",
                    position: "relative",
                }}
            >
                {/* Decorative Top Accent Line */}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 32,
                        right: 32,
                        height: 2,
                        background: "linear-gradient(90deg, transparent, #2DD4E8, transparent)",
                    }}
                />

                {/* Header / Logo */}
                <div style={{ textAlign: "center", marginBottom: 30 }}>
                    <div
                        style={{
                            width: 52,
                            height: 52,
                            borderRadius: 14,
                            background: "rgba(45, 212, 232, 0.1)",
                            border: "1px solid rgba(45, 212, 232, 0.25)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 14px",
                            fontSize: 26,
                        }}
                    >
                        🌿
                    </div>
                    <h2
                        style={{
                            fontSize: 22,
                            fontWeight: 700,
                            letterSpacing: "-0.02em",
                            margin: "0 0 6px",
                            color: "#E8EDF2",
                        }}
                    >
                        Air Quality IOC
                    </h2>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                        <span
                            style={{
                                fontSize: 11,
                                padding: "2px 8px",
                                borderRadius: 4,
                                background: "rgba(45, 212, 232, 0.12)",
                                color: "#2DD4E8",
                                border: "1px solid rgba(45, 212, 232, 0.25)",
                                fontWeight: 600,
                                letterSpacing: "0.05em",
                                textTransform: "uppercase",
                            }}
                        >
                            Admin Portal
                        </span>
                        <span style={{ fontSize: 12, color: "#8896A3" }}>• Đăng nhập quản trị</span>
                    </div>
                </div>

                {/* Error Box */}
                {error && (
                    <div
                        style={{
                            marginBottom: 20,
                            padding: "12px 14px",
                            background: "rgba(248, 113, 113, 0.1)",
                            border: "1px solid rgba(248, 113, 113, 0.25)",
                            borderRadius: 8,
                            color: "#F87171",
                            fontSize: 13,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    {/* Username Input */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                fontSize: 12,
                                fontWeight: 600,
                                color: "#8896A3",
                                marginBottom: 6,
                            }}
                        >
                            TÊN ĐĂNG NHẬP
                        </label>
                        <div style={{ position: "relative" }}>
                            <span
                                style={{
                                    position: "absolute",
                                    left: 12,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    fontSize: 14,
                                    color: "#8896A3",
                                    pointerEvents: "none",
                                }}
                            >
                                👤
                            </span>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Nhập tài khoản admin..."
                                required
                                style={{
                                    width: "100%",
                                    padding: "11px 14px 11px 36px",
                                    background: "#0E141B",
                                    border: "1px solid #1E2933",
                                    borderRadius: 8,
                                    color: "#E8EDF2",
                                    fontSize: 14,
                                    outline: "none",
                                    transition: "border-color 0.2s, box-shadow 0.2s",
                                    boxSizing: "border-box",
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = "#2DD4E8";
                                    e.target.style.boxShadow = "0 0 0 3px rgba(45, 212, 232, 0.15)";
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = "#1E2933";
                                    e.target.style.boxShadow = "none";
                                }}
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                fontSize: 12,
                                fontWeight: 600,
                                color: "#8896A3",
                                marginBottom: 6,
                            }}
                        >
                            MẬT KHẨU
                        </label>
                        <div style={{ position: "relative" }}>
                            <span
                                style={{
                                    position: "absolute",
                                    left: 12,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    fontSize: 14,
                                    color: "#8896A3",
                                    pointerEvents: "none",
                                }}
                            >
                                🔒
                            </span>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{
                                    width: "100%",
                                    padding: "11px 40px 11px 36px",
                                    background: "#0E141B",
                                    border: "1px solid #1E2933",
                                    borderRadius: 8,
                                    color: "#E8EDF2",
                                    fontSize: 14,
                                    outline: "none",
                                    transition: "border-color 0.2s, box-shadow 0.2s",
                                    boxSizing: "border-box",
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = "#2DD4E8";
                                    e.target.style.boxShadow = "0 0 0 3px rgba(45, 212, 232, 0.15)";
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = "#1E2933";
                                    e.target.style.boxShadow = "none";
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: "absolute",
                                    right: 12,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "none",
                                    border: "none",
                                    color: "#8896A3",
                                    cursor: "pointer",
                                    fontSize: 14,
                                    padding: 4,
                                }}
                                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                            >
                                {showPassword ? "👁️" : "👁️‍🗨️"}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: 8,
                            padding: "12px",
                            background: loading ? "#1E2933" : "#2DD4E8",
                            color: loading ? "#8896A3" : "#0A0E13",
                            border: "none",
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 700,
                            cursor: loading ? "not-allowed" : "pointer",
                            transition: "all 0.2s ease",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            boxShadow: loading ? "none" : "0 4px 14px rgba(45, 212, 232, 0.3)",
                        }}
                        onMouseOver={(e) => {
                            if (!loading) {
                                e.currentTarget.style.filter = "brightness(1.1)";
                                e.currentTarget.style.transform = "translateY(-1px)";
                            }
                        }}
                        onMouseOut={(e) => {
                            if (!loading) {
                                e.currentTarget.style.filter = "none";
                                e.currentTarget.style.transform = "none";
                            }
                        }}
                    >
                        {loading ? (
                            <>
                                <span>Đang xác thực...</span>
                            </>
                        ) : (
                            <>
                                <span>Đăng nhập hệ thống</span>
                                <span>→</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Link back to Dashboard */}
                <div
                    style={{
                        marginTop: 26,
                        paddingTop: 20,
                        borderTop: "1px solid #1E2933",
                        textAlign: "center",
                    }}
                >
                    <Link
                        to="/air-quality"
                        style={{
                            fontSize: 13,
                            color: "#8896A3",
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            transition: "color 0.2s",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.color = "#2DD4E8")}
                        onMouseOut={(e) => (e.currentTarget.style.color = "#8896A3")}
                    >
                        <span>← Quay về Trung tâm Giám sát</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
