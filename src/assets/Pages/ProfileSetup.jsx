import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { setUser, logoutUser, fetchMe } from "../store/slices/authSlice";
import { Camera, ArrowRight, UserCircle, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const baseURL = import.meta.env.VITE_API_URL;

const ProfileSetup = () => {
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, user, isAuthLoaded } = useSelector((state) => state.auth);

  const storageToken =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  const authToken = token || storageToken;

  // Wait for auth to be fully resolved before making any redirect decision.
  // Acting on localStorage-loaded state before isAuthLoaded is true can cause
  // the same circular redirect loop seen in ModernAuth.
  if (!isAuthLoaded) return null; // Brief blank — ProtectedRoute handles the spinner
  if (!authToken) return <Navigate to="/auth" replace />;
  if (user?.name) return <Navigate to="/app" replace />;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }
    if (!file.type.match("image.*")) {
      toast.error("Please select an image file");
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name.trim());
      if (image) formData.append("profilePic", image);
      const response = await axios.put(
        `${baseURL}/api/profile/update`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${authToken}`,
          },
        },
      );
      dispatch(setUser(response.data.user));
      await dispatch(fetchMe()).unwrap(); // Fetch fresh data from DB
      toast.success("Profile set up!");
      navigate("/app", { replace: true });
    } catch (err) {
      if (err.response?.status === 401) {
        dispatch(logoutUser());
        navigate("/auth", { replace: true });
      } else toast.error(err.response?.data?.message || "Setup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        padding: "16px",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        boxSizing: "border-box",
      }}
    >
      {/* Blobs */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "-10%",
          width: "60%",
          height: "60%",
          background:
            "radial-gradient(circle,rgba(193,53,132,0.15) 0%,transparent 70%)",
          borderRadius: "50%",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-20%",
          right: "-10%",
          width: "60%",
          height: "60%",
          background:
            "radial-gradient(circle,rgba(131,58,180,0.15) 0%,transparent 70%)",
          borderRadius: "50%",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#161616",
          borderRadius: "28px",
          padding: "clamp(24px,6vw,44px)",
          position: "relative",
          zIndex: 10,
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 14px",
              background: "rgba(193,53,132,0.1)",
              border: "1px solid rgba(193,53,132,0.2)",
              borderRadius: "999px",
              fontSize: "9px",
              fontWeight: 800,
              color: "#e1306c",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            <ShieldCheck size={10} /> Secure Setup
          </span>
          <h1
            style={{
              fontSize: "clamp(24px,6vw,32px)",
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-0.5px",
              margin: "0 0 8px",
            }}
          >
            Profile Info
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "14px",
              margin: 0,
            }}
          >
            Personalize your identity on the network
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "28px" }}
        >
          {/* Avatar Upload */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ position: "relative" }}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                style={{
                  width: "clamp(100px,25vw,130px)",
                  height: "clamp(100px,25vw,130px)",
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: "#1e1e1e",
                  border: "3px solid transparent",
                  backgroundClip: "padding-box",
                  boxShadow:
                    "0 0 0 3px rgba(193,53,132,0.4), 0 12px 40px rgba(0,0,0,0.4)",
                  position: "relative",
                }}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    {name ? (
                      <span
                        style={{
                          color: "#fff",
                          fontSize: "48px",
                          fontWeight: 900,
                          textTransform: "uppercase",
                          textShadow: "0 4px 12px rgba(0,0,0,0.5)",
                        }}
                      >
                        {name.charAt(0)}
                      </span>
                    ) : (
                      <UserCircle size={64} color="rgba(255,255,255,0.2)" />
                    )}
                  </div>
                )}
                {loading && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0,0,0,0.5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        border: "3px solid rgba(255,255,255,0.2)",
                        borderTop: "3px solid #fff",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                  </div>
                )}
              </motion.div>

              {/* Camera button */}
              <label
                style={{
                  position: "absolute",
                  bottom: "-2px",
                  right: "-2px",
                  width: "36px",
                  height: "36px",
                  background:
                    "linear-gradient(135deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(193,53,132,0.5)",
                  border: "2px solid #161616",
                  transition: "transform 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.12)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
                <Camera size={16} color="#fff" />
              </label>
            </div>
            <p
              style={{
                marginTop: "12px",
                fontSize: "11px",
                color: "rgba(255,255,255,0.3)",
                fontWeight: 600,
              }}
            >
              Tap to upload photo
            </p>
          </div>

          {/* Name Input */}
          <div
            style={{
              background: "#1e1e1e",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "14px 16px",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "rgba(193,53,132,0.4)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")
            }
          >
            <label
              style={{
                fontSize: "9px",
                fontWeight: 800,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.35)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Public Name
            </label>
            <input
              type="text"
              placeholder="How should people call you?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={25}
              required
              style={{
                width: "100%",
                background: "none",
                border: "none",
                color: "#fff",
                fontSize: "16px",
                fontWeight: 700,
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>

          <p
            style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.25)",
              textAlign: "center",
              margin: "-12px 0 0",
              lineHeight: 1.5,
            }}
          >
            Your name and photo will be visible to your contacts.
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !name.trim()}
            style={{
              width: "100%",
              height: "56px",
              background:
                loading || !name.trim()
                  ? "rgba(255,255,255,0.05)"
                  : "linear-gradient(135deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)",
              border: "none",
              borderRadius: "16px",
              color: loading || !name.trim() ? "rgba(255,255,255,0.2)" : "#fff",
              fontSize: "16px",
              fontWeight: 800,
              cursor: loading || !name.trim() ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              transition: "all 0.2s",
              boxShadow:
                loading || !name.trim()
                  ? "none"
                  : "0 8px 32px rgba(193,53,132,0.35)",
            }}
          >
            {loading ? (
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  border: "2px solid rgba(255,255,255,0.2)",
                  borderTop: "2px solid #fff",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
            ) : (
              <>
                {" "}
                Finalize Setup{" "}
                <ArrowRight size={16} style={{ opacity: 0.7 }} />{" "}
              </>
            )}
          </button>
        </form>

        <div
          style={{
            marginTop: "28px",
            paddingTop: "20px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "9px",
              fontWeight: 800,
              color: "rgba(255,255,255,0.2)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Privacy First Architecture
          </p>
        </div>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ProfileSetup;
