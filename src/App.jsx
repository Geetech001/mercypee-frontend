import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import ImageLightbox from "./ImageLightbox";

function PublicSite() {
  const [posts, setPosts] = useState([]);
  const [profile, setProfile] = useState({ bio: "", photoUrl: "" });
  const [lightboxPost, setLightboxPost] = useState(null);
  const [heroIndex, setHeroIndex] = useState(0);

  const specialties = [
    "Corsets", "Masterpiece Dresses", "Corporate Wears", "Aso-Ebi Styles",
    "Church Outfits", "Bridal & Occasion Wears", "Custom Dresses", "Alterations & Perfect Fittings"
  ];

  const fallbackGallery = [
    { imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop", mediaType: "image", caption: "", category: "" },
    { imageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=800&fit=crop", mediaType: "image", caption: "", category: "" },
    { imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=800&fit=crop", mediaType: "image", caption: "", category: "" },
    { imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=800&fit=crop", mediaType: "image", caption: "", category: "" },
    { imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=800&fit=crop", mediaType: "image", caption: "", category: "" },
    { imageUrl: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=600&h=800&fit=crop", mediaType: "image", caption: "", category: "" }
  ];

  const colors = {
    bg: "#F5EDE1",
    sectionBg: "#EFE3D3",
    text: "#3B2A1E",
    accent: "#B5651D",
    dark: "#2A1D14"
  };

  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios.get(`${API}/api/posts`).then((res) => setPosts(res.data)).catch(() => {});
    axios.get(`${API}/api/profile`).then((res) => setProfile(res.data)).catch(() => {});
  }, [API]);

  useEffect(() => {
    const handlePopState = () => setLightboxPost(null);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const galleryToShow = posts.length > 0 ? posts : fallbackGallery;
  const currentHero = galleryToShow[heroIndex % galleryToShow.length];
  const currentIsVideo = currentHero?.mediaType === "video";

  useEffect(() => {
    if (galleryToShow.length <= 1) return;
    if (currentIsVideo) return;
    const timer = setTimeout(() => {
      setHeroIndex((prev) => (prev + 1) % galleryToShow.length);
    }, 5000);
    return () => clearTimeout(timer);
  }, [heroIndex, galleryToShow.length, currentIsVideo]);

  const handleHeroVideoEnded = () => {
    setHeroIndex((prev) => (prev + 1) % galleryToShow.length);
  };

  const openLightbox = (post) => {
    window.history.pushState({ publicLightbox: true }, "");
    setLightboxPost(post);
  };

  const closeLightbox = () => window.history.back();

  return (
    <div style={{ fontFamily: "Georgia, serif", backgroundColor: colors.bg, color: colors.text, overflowX: "hidden" }}>

      <section style={{
        minHeight: "100vh",
        position: "relative",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", textAlign: "center", padding: "20px",
        overflow: "hidden"
      }}>
        {currentIsVideo ? (
          <video
            key={currentHero.videoUrl}
            src={currentHero.videoUrl}
            autoPlay
            muted
            playsInline
            onEnded={handleHeroVideoEnded}
            style={{
              position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
              objectFit: "cover", zIndex: 0
            }}
          />
        ) : (
          <div style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
            backgroundImage: `url(${currentHero?.imageUrl})`,
            backgroundSize: "cover", backgroundPosition: "center",
            zIndex: 0
          }} />
        )}

        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(42,29,20,0.55)", zIndex: 1
        }} />

        <div style={{ position: "relative", zIndex: 2 }}>
          <h1 style={{ fontSize: "2.8rem", marginBottom: "10px", color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>Mercy Pee</h1>
          <p style={{ fontSize: "1.15rem", color: "#F0C27B", letterSpacing: "3px" }}>HOME OF FASHION</p>
          <p style={{ marginTop: "20px", fontStyle: "italic", color: "#f5ede1", fontSize: "1.05rem" }}>Designed to fit. Made to stand out.</p>
        </div>
      </section>

      <section style={{ padding: "70px 20px", textAlign: "center", backgroundColor: colors.sectionBg }}>
        <h2 style={{ fontSize: "1.9rem", marginBottom: "25px", color: colors.text, letterSpacing: "1px" }}>Our Story</h2>

        {profile.photoUrl && (
          <img src={profile.photoUrl} alt="Mercy Pee" style={{
            width: "150px", height: "150px", objectFit: "cover", borderRadius: "50%",
            margin: "0 auto 25px", display: "block", border: `4px solid ${colors.accent}`,
            boxShadow: "0 4px 14px rgba(0,0,0,0.2)"
          }} />
        )}

        <p style={{ maxWidth: "600px", margin: "0 auto", lineHeight: "1.8", color: colors.text, whiteSpace: "pre-wrap", fontSize: "1.05rem" }}>
          {profile.bio && profile.bio.trim().length > 0
            ? profile.bio
            : "We design and create unique, classy and comfortable outfits that bring out the best in you. Every stitch is crafted with passion, precision and style."}
        </p>
        <p style={{ marginTop: "25px", fontStyle: "italic", color: colors.accent, fontSize: "1.05rem" }}>
          Your Style, Your Confidence, Our Passion.
        </p>
      </section>

      <section style={{ padding: "70px 20px" }}>
        <h2 style={{ fontSize: "1.9rem", textAlign: "center", marginBottom: "45px", color: colors.text, letterSpacing: "1px" }}>Our Specialties</h2>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "18px", maxWidth: "900px", margin: "0 auto"
        }}>
          {specialties.map((item, i) => (
            <div key={i} style={{
              backgroundColor: "#fff", padding: "24px 16px", borderRadius: "12px",
              textAlign: "center", color: colors.text, fontSize: "0.95rem",
              boxShadow: "0 3px 10px rgba(59,42,30,0.08)",
              borderBottom: `3px solid ${colors.accent}`
            }}>
              {item}
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "70px 20px", backgroundColor: colors.sectionBg }}>
        <h2 style={{ fontSize: "1.9rem", textAlign: "center", marginBottom: "45px", color: colors.text, letterSpacing: "1px" }}>Lookbook</h2>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "22px", maxWidth: "1000px", margin: "0 auto"
        }}>
          {galleryToShow.map((post, i) => (
            <div key={i} style={{
              backgroundColor: "#fff", borderRadius: "12px", overflow: "hidden",
              boxShadow: "0 4px 14px rgba(59,42,30,0.12)", position: "relative"
            }}>
              {post.mediaType === "video" ? (
                <div style={{ position: "relative" }} onClick={() => openLightbox(post)}>
                  <video
                    src={post.videoUrl}
                    muted
                    preload="metadata"
                    style={{ width: "100%", height: "300px", objectFit: "cover", cursor: "pointer", display: "block", backgroundColor: "#000" }}
                  />
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    pointerEvents: "none"
                  }}>
                    <div style={{
                      width: "56px", height: "56px", borderRadius: "50%",
                      backgroundColor: "rgba(0,0,0,0.5)",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      <div style={{
                        width: 0, height: 0,
                        borderTop: "10px solid transparent",
                        borderBottom: "10px solid transparent",
                        borderLeft: "16px solid #fff",
                        marginLeft: "4px"
                      }} />
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={post.imageUrl}
                  alt={post.caption || "fashion look"}
                  onClick={() => openLightbox(post)}
                  style={{ width: "100%", height: "300px", objectFit: "cover", cursor: "pointer", display: "block" }}
                />
              )}
              {(post.caption || post.category) && (
                <div style={{ padding: "14px" }}>
                  {post.caption && <p style={{ margin: 0, fontSize: "0.95rem", color: colors.text }}>{post.caption}</p>}
                  {post.category && (
                    <span style={{
                      display: "inline-block", marginTop: "8px", fontSize: "0.75rem",
                      color: colors.accent, border: `1px solid ${colors.accent}`,
                      borderRadius: "20px", padding: "3px 12px", letterSpacing: "0.5px"
                    }}>
                      {post.category}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "70px 20px", textAlign: "center" }}>
        <h2 style={{ fontSize: "1.9rem", marginBottom: "35px", color: colors.text, letterSpacing: "1px" }}>Let's Bring Your Vision to Life</h2>

        <a href="https://wa.me/2349167157672?text=Hi%20Mercy%20Pee,%20I%27d%20like%20to%20inquire%20about%20a%20design"
          target="_blank" rel="noopener noreferrer"
          style={{
            display: "inline-block", backgroundColor: colors.accent, color: "#fff",
            padding: "16px 34px", borderRadius: "30px", textDecoration: "none",
            fontSize: "1.1rem", marginBottom: "24px", boxShadow: "0 4px 12px rgba(181,101,29,0.35)"
          }}>
          Chat on WhatsApp
        </a>

        <div style={{ marginTop: "10px" }}>
          <a href="https://www.facebook.com/share/1MFBQVARY8/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer"
            style={{ margin: "0 15px", color: colors.text, textDecoration: "underline" }}>Facebook</a>
          <a href="https://www.tiktok.com/@mercypee35?_r=1&_t=ZS-98Exvb1pTjY" target="_blank" rel="noopener noreferrer"
            style={{ margin: "0 15px", color: colors.text, textDecoration: "underline" }}>TikTok</a>
        </div>
      </section>

      <footer style={{ backgroundColor: colors.dark, color: "#F5EDE1", textAlign: "center", padding: "35px 20px" }}>
        <p style={{ fontSize: "1.1rem" }}>Mercy Pee — Home of Fashion</p>
        <p style={{ fontSize: "0.9rem", marginTop: "10px", opacity: 0.8 }}>Your Style, Your Confidence, Our Passion.</p>
      </footer>

      {lightboxPost && (
        <ImageLightbox post={lightboxPost} onRequestClose={closeLightbox} />
      )}

    </div>
  );
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("adminToken");
  return token ? children : <Navigate to="/admin/login" />;
}

function AdminLoginWrapper() {
  const handleLoginSuccess = () => {
    window.location.href = "/admin/dashboard";
  };
  return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicSite />} />
        <Route path="/admin" element={<Navigate to="/admin/login" />} />
        <Route path="/admin/login" element={<AdminLoginWrapper />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;