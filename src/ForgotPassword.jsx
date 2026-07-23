import { useState } from "react";
import axios from "axios";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const colors = { bg: "#F5EDE1", text: "#3B2A1E", accent: "#B5651D" };
  const API = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await axios.post(`${API}/api/auth/forgot-password`, { email });
      setStatus("success");
    } catch (err) {
      setStatus("fail");
    }
  };

  return (
    <div style={{
      minHeight: "100vh", width: "100%", boxSizing: "border-box", display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      backgroundColor: colors.bg, fontFamily: "Georgia, serif", padding: "20px"
    }}>
      <h1 style={{ color: colors.text, marginBottom: "5px" }}>Mercy Pee</h1>
      <p style={{ color: colors.accent, marginBottom: "30px", letterSpacing: "2px" }}>RESET PASSWORD</p>

      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "320px" }}>
        <input
          type="email"
          placeholder="Enter your admin email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%", boxSizing: "border-box", padding: "12px", marginBottom: "15px",
            borderRadius: "8px", border: `1px solid ${colors.accent}`, fontSize: "1rem"
          }}
        />
        <button type="submit" disabled={status === "sending"} style={{
          width: "100%", padding: "12px", backgroundColor: colors.accent, color: "#fff",
          border: "none", borderRadius: "8px", fontSize: "1rem", cursor: "pointer"
        }}>
          {status === "sending" ? "Sending..." : "Send Reset Link"}
        </button>

        {status === "success" && <p style={{ color: "green", marginTop: "10px", textAlign: "center" }}>Reset link sent — check the email inbox.</p>}
        {status === "fail" && <p style={{ color: "red", marginTop: "10px", textAlign: "center" }}>No account found with that email.</p>}

        <p style={{ marginTop: "20px", textAlign: "center" }}>
          <a href="/admin/login" style={{ color: colors.text }}>Back to Login</a>
        </p>
      </form>
    </div>
  );
}

export default ForgotPassword;