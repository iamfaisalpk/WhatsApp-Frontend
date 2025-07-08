import React, { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

const VoiceMessagePlayer = ({ url, duration = 0, profilePic }) => {
  const audioRef = useRef(null);
  const isMountedRef = useRef(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration);

  const formatDuration = (seconds = 0) => {
    if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const generateWaveformBars = () => {
    const bars = [];
    const barCount = 45;
    for (let i = 0; i < barCount; i++) {
      const height = Math.random() * 25 + 5;
      bars.push(height);
    }
    return bars;
  };

  const [waveformBars] = useState(generateWaveformBars());

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !url) return;

    const handleTimeUpdate = () => {
      if (isMountedRef.current) setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (
        isMountedRef.current &&
        isFinite(audio.duration) &&
        !isNaN(audio.duration)
      ) {
        setAudioDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      if (isMountedRef.current) {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [url]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => console.error("Audio play failed:", err));
      setIsPlaying(true);
    }
  };

  const handleWaveformClick = (e) => {
    const audio = audioRef.current;
    if (!audio || !audioDuration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * audioDuration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const progressPercentage = audioDuration
    ? (currentTime / audioDuration) * 100
    : 0;

  return (
    <div className="flex items-center bg-[#075e54] text-white px-3 py-2 rounded-2xl w-full max-w-[360px] shadow-md gap-3">
      {/* Profile Picture */}
      {profilePic && (
        <img
          src={profilePic}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover"
        />
      )}

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
        style={{ display: "none" }}
      />

      {/* Play / Pause Button */}
      <button
        onClick={togglePlay}
        className="bg-white/20 hover:bg-white/30 w-9 h-9 rounded-full flex items-center justify-center shrink-0"
      >
        {isPlaying ? (
          <Pause size={18} className="text-white cursor-pointer" />
        ) : (
          <Play size={18} className="text-white cursor-pointer" />
        )}
      </button>

      {/* Waveform */}
      <div
        className="relative flex-1 h-[36px] flex items-end gap-[2px] cursor-pointer"
        onClick={handleWaveformClick}
      >
        <div
          className="absolute top-0 left-0 h-full bg-white/10 z-0 transition-all duration-100"
          style={{ width: `${progressPercentage}%` }}
        />
        <div
          className="absolute z-20 top-1/2 -translate-y-1/2 w-[8px] h-[8px] bg-blue-400 rounded-full"
          style={{ left: `${progressPercentage}%` }}
        />
        {waveformBars.map((height, index) => (
          <div
            key={index}
            className="w-[2px] z-10 bg-white/40"
            style={{ height: `${height}px` }}
          />
        ))}
      </div>

      {/* Duration and Timestamp */}
      <div className="flex flex-col items-end text-xs text-white/80">
        <span>
          {formatDuration(audioDuration)}
        </span>
      </div>
    </div>
  );
};

export default VoiceMessagePlayer;
