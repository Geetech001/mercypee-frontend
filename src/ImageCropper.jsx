import { useState, useRef, useEffect } from "react";

function ImageCropper({ imageUrl, onConfirm, onCancel }) {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const dragStart = useRef(null);
  const pinchStart = useRef(null);

  const colors = { text: "#3B2A1E", accent: "#B5651D" };

  const getDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      pinchStart.current = { distance: getDistance(e.touches), scale };
    } else if (e.touches.length === 1) {
      dragStart.current = {
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y
      };
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (e.touches.length === 2 && pinchStart.current) {
      const newDistance = getDistance(e.touches);
      const ratio = newDistance / pinchStart.current.distance;
      let newScale = pinchStart.current.scale * ratio;
      newScale = Math.max(1, Math.min(newScale, 4));
      setScale(newScale);
    } else if (e.touches.length === 1 && dragStart.current) {
      setOffset({
        x: e.touches[0].clientX - dragStart.current.x,
        y: e.touches[0].clientY - dragStart.current.y
      });
    }
  };

  const handleTouchEnd = () => {
    dragStart.current = null;
    pinchStart.current = null;
  };

  const handleConfirm = () => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img) return;

    const boxSize = container.offsetWidth; // square crop box
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");

    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;

    // how the image is currently displayed inside the box (before scale/offset)
    const baseDisplayW = boxSize;
    const baseDisplayH = (naturalH / naturalW) * boxSize;
    const displayW = baseDisplayW * scale;
    const displayH = baseDisplayH * scale;

    const imgLeft = (boxSize - displayW) / 2 + offset.x;
    const imgTop = (boxSize - displayH) / 2 + offset.y;

    const scaleFactor = naturalW / displayW;

    const sx = (0 - imgLeft) * scaleFactor;
    const sy = (0 - imgTop) * scaleFactor;
    const sSize = boxSize * scaleFactor;

    ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, 800, 800);

    canvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], "cropped.jpg", { type: "image/jpeg" });
        onConfirm(croppedFile);
      }
    }, "image/jpeg", 0.9);
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.9)", zIndex: 2000,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px"
    }}>
      <p style={{ color: "#fff", marginBottom: "12px", fontSize: "0.9rem", textAlign: "center" }}>
        Pinch to zoom, drag to reposition
      </p>

      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          width: "min(85vw, 340px)",
          aspectRatio: "1 / 1",
          overflow: "hidden",
          position: "relative",
          backgroundColor: "#000",
          borderRadius: "10px",
          touchAction: "none"
        }}
      >
        <img
          ref={imgRef}
          src={imageUrl}
          alt="Crop preview"
          draggable={false}
          style={{
            position: "absolute",
            top: "50%", left: "50%",
            width: "100%",
            transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "center center",
            userSelect: "none"
          }}
        />
      </div>

      <div style={{ display: "flex", gap: "12px", marginTop: "20px", width: "min(85vw, 340px)" }}>
        <button onClick={onCancel} style={{
          flex: 1, padding: "12px", background: "none", border: "1px solid #fff",
          color: "#fff", borderRadius: "8px", cursor: "pointer"
        }}>
          Cancel
        </button>
        <button onClick={handleConfirm} style={{
          flex: 1, padding: "12px", backgroundColor: colors.accent, color: "#fff",
          border: "none", borderRadius: "8px", cursor: "pointer"
        }}>
          Use this photo
        </button>
      </div>
    </div>
  );
}

export default ImageCropper;