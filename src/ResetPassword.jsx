import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function ResetPassword() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("idle");
  const colors = { bg: "#F5EDE1", text: "#3B2A1E", accent: "#B5651D" };
  const API = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await axios.post(`${API}/api/auth/reset-password/${token}`, { newPassword });
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
      <p style={{ color: colors.accent, marginBottom: "30px", letterSpacing: "2px" }}>SET NEW PASSWORD</p>

      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "320px" }}>
        <div style={{ position: "relative", marginBottom: "20px" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={{
              width: "100%", boxSizing: "border-box", padding: "12px", paddingRight: "45px",
              borderRadius: "8px", border: `1px solid ${colors.accent}`, fontSize: "1rem"
            }}
          />
          <span onClick={() => setShowPassword(!showPassword)} style={{
            position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", cursor: "pointer"
          }}>
            {showPassword ? "Hide" : "Show"}
          </span>
        </div>

        <button type="submit" disabled={status === "sending"} style={{
          width: "100%", padding: "12px", backgroundColor: colors.accent, color: "#fff",
          border: "none", borderRadius: "8px", fontSize: "1rem", cursor: "pointer"
        }}>
          {status === "sending" ? "Updating..." : "Update Password"}
        </button>

        {status === "success" && <p style={{ color: "green", marginTop: "10px", textAlign: "center" }}>Password reset! You can now log in.</p>}
        {status === "fail" && <p style={{ color: "red", marginTop: "10px", textAlign: "center" }}>Link expired or invalid — request a new one.</p>}
      </form>
    </div>
  );
}

export default ResetPassword;