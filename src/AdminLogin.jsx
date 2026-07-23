import { useState, useEffect } from "react";
import axios from "axios";

function EyeIcon({ open }) {
  return open ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a18.5 18.5 0 0 1 4.22-5.19M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("idle");
  const [debugMessage, setDebugMessage] = useState("");

  const colors = { bg: "#F5EDE1", text: "#3B2A1E", accent: "#B5651D" };

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.width = "100%";
    document.body.style.overflowX = "hidden";
    document.documentElement.style.margin = "0";
    document.documentElement.style.width = "100%";
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setDebugMessage("");
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        { email, password }
      );
      localStorage.setItem("adminToken", res.data.token);
      setStatus("success");
      onLoginSuccess();
    } catch (err) {
      setStatus("error");
      if (err.response) {
        setDebugMessage(`Server responded: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        setDebugMessage(`No response from server. Check VITE_API_URL and CORS. (${err.message})`);
      } else {
        setDebugMessage(`Error: ${err.message}`);
      }
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.bg,
      fontFamily: "Georgia, serif",
      padding: "20px"
    }}>
      <h1 style={{ color: colors.text, marginBottom: "5px" }}>Mercy Pee</h1>
      <p style={{ color: colors.accent, marginBottom: "30px", letterSpacing: "2px" }}>ADMIN LOGIN</p>

      <form onSubmit={handleLogin} style={{ width: "100%", maxWidth: "320px", boxSizing: "border-box" }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%", boxSizing: "border-box", padding: "12px", marginBottom: "15px",
            borderRadius: "8px", border: `1px solid ${colors.accent}`, fontSize: "1rem"
          }}
        />

        <div style={{ position: "relative", marginBottom: "20px" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%", boxSizing: "border-box", padding: "12px", paddingRight: "45px",
              borderRadius: "8px", border: `1px solid ${colors.accent}`, fontSize: "1rem"
            }}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute", right: "14px", top: "50%",
              transform: "translateY(-50%)", cursor: "pointer",
              color: colors.accent, display: "flex"
            }}
          >
            <EyeIcon open={showPassword} />
          </span>
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          style={{
            width: "100%", boxSizing: "border-box", padding: "12px", backgroundColor: colors.accent,
            color: "#fff", border: "none", borderRadius: "8px", fontSize: "1rem", cursor: "pointer"
          }}
        >
          {status === "loading" ? "Logging in..." : "Log In"}
        </button>
        

        <p style={{ marginTop: "15px", textAlign: "center" }}>
        <a href="/admin/forgot-password" style={{ color: colors.text, fontSize: "0.9rem" }}>Forgot password?</a>
       </p>

        {status === "error" && (
          <p style={{ color: "red", marginTop: "10px", textAlign: "center", fontSize: "0.85rem", wordBreak: "break-word" }}>
            {debugMessage}
          </p>
        )}
      </form>
    </div>
  );
}

export default AdminLogin;;