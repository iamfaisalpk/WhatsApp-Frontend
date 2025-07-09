import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, Mic } from "lucide-react";

const VoiceMessagePlayer = ({ url, duration = 0, profilePic, isSender }) => {
  const audioRef = useRef(null);
  const isMountedRef = useRef(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const formatDuration = (seconds = 0) => {
    if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  // Generate waveform bars that look more like WhatsApp
  const generateWaveformBars = () => {
    const bars = [];
    const barCount = 60; // More bars for denser look
    for (let i = 0; i < barCount; i++) {
      // Create more varied heights like WhatsApp
      const height = Math.random() * 20 + 3;
      bars.push(height);
    }
    return bars;
  };

  const barCount = 60;
  const [animatedBars, setAnimatedBars] = useState(Array(barCount).fill(10));

  useEffect(() => {
    let animationFrame;

    const animate = () => {
      setAnimatedBars((prevBars) => prevBars.map(() => Math.random() * 20 + 5));
      animationFrame = requestAnimationFrame(animate);
    };

    if (isPlaying) {
      animate();
    }

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !url) return;

    const handleTimeUpdate = () => {
      if (isMountedRef.current) setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (isMountedRef.current) {
        setIsLoading(false);
        setHasError(false);
        if (isFinite(audio.duration) && !isNaN(audio.duration)) {
          setAudioDuration(audio.duration);
        }
      }
    };

    const handleEnded = () => {
      if (isMountedRef.current) {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    const handleError = () => {
      if (isMountedRef.current) {
        setIsLoading(false);
        setHasError(true);
        setIsPlaying(false);
      }
    };

    const handleLoadStart = () => {
      if (isMountedRef.current) {
        setIsLoading(true);
        setHasError(false);
      }
    };

    const handleCanPlay = () => {
      if (isMountedRef.current) {
        setIsLoading(false);
        setHasError(false);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [url]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || hasError) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        setIsLoading(true);
        await audio.play();
        if (isMountedRef.current) {
          setIsPlaying(true);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Audio play failed:", err);
        if (isMountedRef.current) {
          setIsLoading(false);
          setHasError(true);
        }
      }
    }
  };

  const handleWaveformClick = (e) => {
    const audio = audioRef.current;
    if (!audio || !audioDuration || hasError) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * audioDuration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const progressPercentage = audioDuration
    ? Math.max(0, Math.min(100, (currentTime / audioDuration) * 100))
    : 0;

  if (!url) {
    return null;
  }

  return (
    <div
      className={`flex w-full ${
        isSender ? "justify-start" : "justify-end"
      } mb-1`}
    >
      <div
        className={`flex items-center px-3 py-2 rounded-2xl max-w-[320px] shadow-sm gap-2 ${
          isSender
            ? "bg-[#005c4b] text-white mr-auto"
            : "bg-[#202c33] text-white ml-auto"
        }`}
      >
        {/* Profile Image for Receiver */}
        {/* Profile Image */}
        {profilePic && (
          <img
            src={profilePic}
            alt="Profile"
            className={`w-8 h-8 rounded-full object-cover flex-shrink-0 ${
              isSender ? "order-last mr-2" : "order-first mr-0.5"
            }`}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}

        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          src={url}
          preload="metadata"
          style={{ display: "none" }}
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
          }}
        />

        {/* Play / Pause Button */}
        <button
          onClick={togglePlay}
          disabled={isLoading || hasError}
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
            hasError
              ? "bg-red-500/30 cursor-not-allowed"
              : isLoading
              ? "bg-white/10 cursor-wait"
              : isSender
              ? "bg-white/20 hover:bg-white/30 cursor-pointer"
              : "bg-[#00a884] hover:bg-[#00a884]/80 cursor-pointer"
          }`}
        >
          {isLoading ? (
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : hasError ? (
            <span className="text-red-400 text-xs">!</span>
          ) : isPlaying ? (
            <Pause size={14} className="text-white" />
          ) : (
            <Play size={14} className="text-white ml-0.5" />
          )}
        </button>

        {/* Waveform */}
        <div
          className={`relative flex-1 h-[30px] flex items-end gap-[1px] ${
            hasError ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          }`}
          onClick={handleWaveformClick}
        >
          {/* Progress circle indicator */}
          <div
            className={`absolute z-20 top-1/2 -translate-y-1/2 w-[12px] h-[12px] rounded-full border-2 transition-all duration-100 ${
              isSender
                ? "bg-white border-white"
                : "bg-[#00a884] border-[#00a884]"
            }`}
            style={{
              left: `${Math.max(0, Math.min(100, progressPercentage))}%`,
              transform: `translateX(-50%) translateY(-50%)`,
            }}
          />

          {/* Waveform bars */}
          {animatedBars.map((height, index) => {
            const barProgress = (index / animatedBars.length) * 100;

            const isPlayed = barProgress <= progressPercentage;

            return (
              <div
                key={index}
                className={`w-[2px] transition-all duration-100 ${
                  isPlayed
                    ? isSender
                      ? "bg-white/90"
                      : "bg-[#00a884]"
                    : "bg-white/40"
                }`}
                style={{ height: `${height}px` }}
              />
            );
          })}
        </div>

        {/* Duration and Status */}
        <div className="flex flex-col items-end text-xs text-white/70 min-w-[35px]">
          <span>
            {formatDuration(currentTime > 0 ? currentTime : audioDuration)}
          </span>
          {hasError && <span className="text-red-400 text-[10px]">Error</span>}
        </div>
      </div>
    </div>
  );
};

export default VoiceMessagePlayer;
