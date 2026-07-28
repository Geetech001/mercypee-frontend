import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ImageLightbox from "./ImageLightbox";

function getVideoPoster(videoUrl) {
  if (!videoUrl) return undefined;
  const lastDot = videoUrl.lastIndexOf(".");
  if (lastDot === -1) return videoUrl;
  return videoUrl.substring(0, lastDot) + ".jpg";
}

function EyeIcon({ open }) {
  return open ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a18.5 18.5 0 0 1 4.22-5.19M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function AdminDashboard() {
  const [tab, setTab] = useState("posts");
  const [posts, setPosts] = useState([]);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewIsVideo, setPreviewIsVideo] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("idle");
  const fileInputRef = useRef(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("idle");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [lightboxPost, setLightboxPost] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState("idle");

  const [editingId, setEditingId] = useState(null);
  const [editCaption, setEditCaption] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editStatus, setEditStatus] = useState("idle");

  const [profileBio, setProfileBio] = useState("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [profileFile, setProfileFile] = useState(null);
  const [profileStatus, setProfileStatus] = useState("idle");

  const overlayStack = useRef([]);

  useEffect(() => {
    const handlePopState = () => {
      const closeFn = overlayStack.current.pop();
      if (closeFn) closeFn();
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const openOverlay = (closeFn) => {
    window.history.pushState({ mercypeeOverlay: true }, "");
    overlayStack.current.push(closeFn);
  };

  const closeTopOverlay = () => {
    if (overlayStack.current.length > 0) {
      window.history.back();
    }
  };

  const colors = { bg: "#F5EDE1", section: "#EFE3D3", text: "#3B2A1E", accent: "#B5651D", dark: "#2A1D14" };
  const token = localStorage.getItem("adminToken");
  const API = import.meta.env.VITE_API_URL;

  const fetchPosts = async () => {
    const res = await axios.get(`${API}/api/posts`);
    setPosts(res.data);
  };

  const fetchProfile = async () => {
    const res = await axios.get(`${API}/api/profile`);
    setProfileBio(res.data.bio || "");
    setProfilePhotoUrl(res.data.photoUrl || "");
  };

  useEffect(() => { fetchPosts(); fetchProfile(); }, []);

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setPreviewIsVideo(selected.type.startsWith("video"));
  };

  const handleRemoveSelected = () => {
    setFile(null);
    setPreviewUrl(null);
    setPreviewIsVideo(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploadStatus("sending");
    try {
      const formData = new FormData();
      formData.append("media", file);
      formData.append("caption", caption);
      formData.append("category", category);
      await axios.post(`${API}/api/posts`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUploadStatus("success");
      setCaption(""); setCategory("");
      handleRemoveSelected();
      fetchPosts();
    } catch (err) {
      setUploadStatus("fail");
    }
  };

  const openLightbox = (post) => {
    openOverlay(() => setLightboxPost(null));
    setLightboxPost(post);
  };

  const startEditing = (post) => {
    openOverlay(() => { setEditingId(null); });
    setEditingId(post._id);
    setEditCaption(post.caption || "");
    setEditCategory(post.category || "");
    setEditStatus("idle");
  };

  const openDeleteConfirm = (id) => {
    openOverlay(() => setConfirmDeleteId(null));
    setConfirmDeleteId(id);
  };

  const handleDelete = async (id) => {
    setDeleteStatus("deleting");
    try {
      await axios.delete(`${API}/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteStatus("idle");
      fetchPosts();
      closeTopOverlay();
    } catch (err) {
      setDeleteStatus("fail");
    }
  };

  const handleSaveEdit = async (id) => {
    setEditStatus("saving");
    try {
      await axios.put(
        `${API}/api/posts/${id}`,
        { caption: editCaption, category: editCategory },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditStatus("success");
      fetchPosts();
      closeTopOverlay();
    } catch (err) {
      setEditStatus("fail");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordStatus("sending");
    try {
      await axios.post(
        `${API}/api/auth/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPasswordStatus("success");
      setCurrentPassword(""); setNewPassword("");
    } catch (err) {
      setPasswordStatus("fail");
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileStatus("sending");
    try {
      const formData = new FormData();
      formData.append("bio", profileBio);
      if (profileFile) formData.append("photo", profileFile);
      const res = await axios.put(`${API}/api/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfilePhotoUrl(res.data.profile.photoUrl || profilePhotoUrl);
      setProfileFile(null);
      setProfileStatus("success");
    } catch (err) {
      setProfileStatus("fail");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.bg, fontFamily: "Georgia, serif" }}>
      <div style={{
        backgroundColor: colors.dark, color: "#fff", padding: "20px",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <h2>Mercy Pee Admin</h2>
        <button onClick={handleLogout} style={{
          background: "none", border: "1px solid #fff", color: "#fff",
          padding: "8px 16px", borderRadius: "6px", cursor: "pointer"
        }}>Log Out</button>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "20px", padding: "20px", flexWrap: "wrap" }}>
        {["posts", "profile", "password"].map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "10px 20px", borderRadius: "20px", border: "none", cursor: "pointer",
            backgroundColor: tab === t ? colors.accent : colors.section,
            color: tab === t ? "#fff" : colors.text
          }}>
            {t === "posts" ? "Posts" : t === "profile" ? "Profile" : "Change Password"}
          </button>
        ))}
      </div>

      {tab === "posts" && (
        <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
          <form onSubmit={handleUpload} style={{ marginBottom: "40px" }}>
            {!previewUrl ? (
              <>
                <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileSelect} required
                  style={{ display: "block", marginBottom: "6px" }} />
                <p style={{ fontSize: "0.75rem", color: colors.text, marginBottom: "10px" }}>
                  You can post a photo or a video
                </p>
              </>
            ) : (
              <div style={{ marginBottom: "15px" }}>
                {previewIsVideo ? (
                  <video
                    src={previewUrl}
                    controls
                    style={{
                      width: "100%", maxHeight: "280px", borderRadius: "8px",
                      backgroundColor: "#000", display: "block", marginBottom: "8px"
                    }}
                  />
                ) : (
                  <img src={previewUrl} alt="Preview" style={{
                    width: "100%", maxHeight: "280px", objectFit: "contain",
                    borderRadius: "8px", backgroundColor: colors.section, display: "block", marginBottom: "8px"
                  }} />
                )}
                <button type="button" onClick={handleRemoveSelected} style={{
                  background: "none", border: `1px solid ${colors.accent}`, color: colors.accent,
                  padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem"
                }}>
                  Remove & choose a different {previewIsVideo ? "video" : "photo"}
                </button>
              </div>
            )}

            <input type="text" placeholder="Caption" value={caption} onChange={(e) => setCaption(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", padding: "10px", marginBottom: "10px", borderRadius: "6px", border: `1px solid ${colors.accent}` }} />
            <input type="text" placeholder="Category (e.g. Bridal, Corsets)" value={category} onChange={(e) => setCategory(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", padding: "10px", marginBottom: "10px", borderRadius: "6px", border: `1px solid ${colors.accent}` }} />
            <button type="submit" disabled={uploadStatus === "sending" || !file} style={{
              width: "100%", padding: "12px", backgroundColor: colors.accent, color: "#fff",
              border: "none", borderRadius: "8px", cursor: "pointer", opacity: !file ? 0.6 : 1
            }}>
              {uploadStatus === "sending" ? "Uploading..." : "Post"}
            </button>
            {uploadStatus === "success" && <p style={{ color: "green" }}>Posted successfully!</p>}
            {uploadStatus === "fail" && <p style={{ color: "red" }}>Upload failed, try again.</p>}
          </form>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", alignItems: "stretch" }}>
            {posts.map((post) => (
              <div key={post._id} style={{
                backgroundColor: colors.section, padding: "10px", borderRadius: "8px",
                display: "flex", flexDirection: "column"
              }}>
                {post.mediaType === "video" ? (
                  <video
                    src={post.videoUrl}
                    poster={getVideoPoster(post.videoUrl)}
                    muted
                    preload="metadata"
                    onClick={() => openLightbox(post)}
                    style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "6px", cursor: "pointer", backgroundColor: "#000" }}
                  />
                ) : (
                  <img
                    src={post.imageUrl}
                    alt={post.caption}
                    onClick={() => openLightbox(post)}
                    style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "6px", cursor: "pointer" }}
                  />
                )}

                {editingId === post._id ? (
                  <div style={{ marginTop: "8px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <input type="text" value={editCaption} onChange={(e) => setEditCaption(e.target.value)}
                      placeholder="Caption"
                      style={{ width: "100%", boxSizing: "border-box", padding: "6px", marginBottom: "6px", borderRadius: "6px", border: `1px solid ${colors.accent}`, fontSize: "0.85rem" }} />
                    <input type="text" value={editCategory} onChange={(e) => setEditCategory(e.target.value)}
                      placeholder="Category"
                      style={{ width: "100%", boxSizing: "border-box", padding: "6px", marginBottom: "8px", borderRadius: "6px", border: `1px solid ${colors.accent}`, fontSize: "0.85rem" }} />
                    <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
                      <button onClick={() => handleSaveEdit(post._id)} disabled={editStatus === "saving"} style={{
                        flex: 1, background: colors.accent, color: "#fff", border: "none", padding: "6px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem"
                      }}>{editStatus === "saving" ? "Saving..." : "Save"}</button>
                      <button onClick={closeTopOverlay} style={{
                        flex: 1, background: "none", border: `1px solid ${colors.accent}`, color: colors.accent, padding: "6px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem"
                      }}>Cancel</button>
                    </div>
                    {editStatus === "fail" && <p style={{ color: "red", fontSize: "0.75rem", marginTop: "4px" }}>Update failed, try again.</p>}
                  </div>
                ) : (
                  <div style={{ marginTop: "8px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <p style={{ fontSize: "0.9rem", margin: "0 0 8px", color: colors.text, flex: 1 }}>{post.caption}</p>

                    {confirmDeleteId === post._id ? (
                      <div>
                        <p style={{ fontSize: "0.8rem", color: colors.text, marginBottom: "6px" }}>Delete this post?</p>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button onClick={() => handleDelete(post._id)} disabled={deleteStatus === "deleting"} style={{
                            flex: 1, background: "#B33A3A", color: "#fff", border: "none", padding: "6px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem"
                          }}>{deleteStatus === "deleting" ? "Deleting..." : "Yes, delete"}</button>
                          <button onClick={closeTopOverlay} style={{
                            flex: 1, background: "none", border: `1px solid ${colors.accent}`, color: colors.accent, padding: "6px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem"
                          }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
                        <button onClick={() => startEditing(post)} style={{
                          flex: 1, background: "none", border: `1px solid ${colors.accent}`, color: colors.accent,
                          padding: "6px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem"
                        }}>Edit</button>
                        <button onClick={() => openDeleteConfirm(post._id)} style={{
                          flex: 1, background: "none", border: `1px solid ${colors.accent}`, color: colors.accent,
                          padding: "6px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem"
                        }}>Delete</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "profile" && (
        <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
          {profilePhotoUrl && (
            <img src={profilePhotoUrl} alt="Profile" style={{
              width: "140px", height: "140px", objectFit: "cover", borderRadius: "50%",
              display: "block", margin: "0 auto 20px", border: `3px solid ${colors.accent}`
            }} />
          )}
          <form onSubmit={handleSaveProfile}>
            <label style={{ display: "block", marginBottom: "8px", color: colors.text, fontSize: "0.9rem" }}>
              Update profile photo
            </label>
            <input type="file" accept="image/*" onChange={(e) => setProfileFile(e.target.files[0])}
              style={{ display: "block", marginBottom: "15px" }} />

            <label style={{ display: "block", marginBottom: "8px", color: colors.text, fontSize: "0.9rem" }}>
              Your story / bio
            </label>
            <textarea
              value={profileBio}
              onChange={(e) => setProfileBio(e.target.value)}
              rows={6}
              style={{
                width: "100%", boxSizing: "border-box", padding: "10px", borderRadius: "6px",
                border: `1px solid ${colors.accent}`, fontFamily: "Georgia, serif", fontSize: "0.95rem", marginBottom: "15px"
              }}
            />

            <button type="submit" disabled={profileStatus === "sending"} style={{
              width: "100%", padding: "12px", backgroundColor: colors.accent, color: "#fff",
              border: "none", borderRadius: "8px", cursor: "pointer"
            }}>
              {profileStatus === "sending" ? "Saving..." : "Save Profile"}
            </button>
            {profileStatus === "success" && <p style={{ color: "green", marginTop: "10px" }}>Profile updated!</p>}
            {profileStatus === "fail" && <p style={{ color: "red", marginTop: "10px" }}>Update failed, try again.</p>}
          </form>
        </div>
      )}

      {tab === "password" && (
        <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
          <form onSubmit={handleChangePassword}>
            <div style={{ position: "relative", marginBottom: "15px" }}>
              <input type={showCurrent ? "text" : "password"} placeholder="Current Password"
                value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required
                style={{ width: "100%", boxSizing: "border-box", padding: "12px", paddingRight: "45px", borderRadius: "8px", border: `1px solid ${colors.accent}` }} />
              <span onClick={() => setShowCurrent(!showCurrent)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: colors.accent, display: "flex" }}>
                <EyeIcon open={showCurrent} />
              </span>
            </div>
            <div style={{ position: "relative", marginBottom: "20px" }}>
              <input type={showNew ? "text" : "password"} placeholder="New Password"
                value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required
                style={{ width: "100%", boxSizing: "border-box", padding: "12px", paddingRight: "45px", borderRadius: "8px", border: `1px solid ${colors.accent}` }} />
              <span onClick={() => setShowNew(!showNew)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: colors.accent, display: "flex" }}>
                <EyeIcon open={showNew} />
              </span>
            </div>
            <button type="submit" disabled={passwordStatus === "sending"} style={{
              width: "100%", padding: "12px", backgroundColor: colors.accent, color: "#fff",
              border: "none", borderRadius: "8px", cursor: "pointer"
            }}>{passwordStatus === "sending" ? "Updating..." : "Update Password"}</button>
            {passwordStatus === "success" && <p style={{ color: "green" }}>Password updated!</p>}
            {passwordStatus === "fail" && <p style={{ color: "red" }}>Current password incorrect.</p>}
          </form>
        </div>
      )}

      {lightboxPost && (
        <ImageLightbox post={lightboxPost} onRequestClose={closeTopOverlay} />
      )}
    </div>
  );
}

export default AdminDashboard;