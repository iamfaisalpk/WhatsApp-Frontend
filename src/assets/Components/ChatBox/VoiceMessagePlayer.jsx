import React, { useRef, useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";

const VoiceMessagePlayer = ({ url, duration = 0, isOwnMessage }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration);
  const [isLoading, setIsLoading] = useState(false);

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return "0:00";
    const min = Math.floor(secs / 60);
    const sec = Math.floor(secs % 60);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("Audio playback error:", err);
      setIsPlaying(false);
    }
  };

  const syncTime = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setAudioDuration(audioRef.current.duration);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "6px 8px",
        minWidth: "200px",
      }}
    >
      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
        onTimeUpdate={syncTime}
        onEnded={handleEnded}
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onLoadedMetadata={(e) => {
          if (e.target.duration && !isNaN(e.target.duration)) {
            setAudioDuration(e.target.duration);
          }
        }}
      />

      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "transform 0.1s, background 0.15s",
          flexShrink: 0,
          background: isOwnMessage
            ? "rgba(255,255,255,0.25)"
            : "rgba(225,48,108,0.2)",
          color: isOwnMessage ? "#fff" : "#e1306c",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {isLoading ? (
          <div
            style={{
              width: "14px",
              height: "14px",
              border: "2px solid rgba(255,255,255,0.3)",
              borderTop: "2px solid currentColor",
              borderRadius: "50%",
              animation: "voiceSpin 0.7s linear infinite",
            }}
          />
        ) : isPlaying ? (
          <Pause size={14} fill="currentColor" />
        ) : (
          <Play size={14} fill="currentColor" style={{ marginLeft: "2px" }} />
        )}
      </button>

      {/* Progress area */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Progress bar */}
        <div
          style={{
            position: "relative",
            height: "4px",
            background: isOwnMessage
              ? "rgba(255,255,255,0.2)"
              : "rgba(255,255,255,0.1)",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              width: `${progress}%`,
              borderRadius: "4px",
              transition: "width 0.1s linear",
              background: isOwnMessage ? "#fff" : "#e1306c",
            }}
          />
        </div>

        {/* Time display */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "4px",
            fontSize: "10px",
            fontWeight: 600,
            color: isOwnMessage
              ? "rgba(255,255,255,0.7)"
              : "rgba(255,255,255,0.4)",
          }}
        >
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(audioDuration)}</span>
        </div>
      </div>

      <style>{`
        @keyframes voiceSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default VoiceMessagePlayer;
