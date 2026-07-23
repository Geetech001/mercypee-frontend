import { useState, useEffect, useRef } from "react";

function ImageLightbox({ src, onRequestClose }) {
  const [zoomed, setZoomed] = useState(false);
  const touchStartY = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartY.current === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(deltaY) > 100) onRequestClose();
    touchStartY.current = null;
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.9)", display: "flex",
        alignItems: "center", justifyContent: "center", zIndex: 1000
      }}
    >
      <button onClick={onRequestClose} style={{
        position: "absolute", top: "20px", right: "20px",
        background: "rgba(255,255,255,0.15)", border: "none", color: "#fff",
        fontSize: "1.5rem", width: "44px", height: "44px", borderRadius: "50%",
        cursor: "pointer", zIndex: 1001
      }}>×</button>

      <img
        src={src}
        alt="fashion look enlarged"
        onClick={() => setZoomed(!zoomed)}
        style={{
          maxWidth: "95%", maxHeight: "90%", objectFit: "contain",
          transform: zoomed ? "scale(2)" : "scale(1)",
          transition: "transform 0.3s ease",
          cursor: zoomed ? "zoom-out" : "zoom-in"
        }}
      />
    </div>
  );
}

export default ImageLightbox;