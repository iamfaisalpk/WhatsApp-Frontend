import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Play, Pause } from "lucide-react";
import {
  stopAllVoiceNotes,
  setCurrentWaveSurfer,
} from "../../../../utils/voicePlayerManager"; 

const VoiceMessagePlayer = ({ url, duration = 0 }) => {
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const formatDuration = (seconds = 0) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  useEffect(() => {
    if (!url || !waveformRef.current) return;

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#999",
      progressColor: "#00ff88",
      height: 40,
      barWidth: 2,
      barGap: 2,
      cursorWidth: 0,
      responsive: true,
    });

    wavesurferRef.current = ws;

    ws.load(url);

    const handleFinish = () => setIsPlaying(false);
    ws.on("finish", handleFinish);

    return () => {
      ws.un("finish", handleFinish);
      try {
        ws.destroy();
      } catch (err) {
        console.warn("Cleanup error:", err.message);
      }
    };
  }, [url]);

  const togglePlay = () => {
    const ws = wavesurferRef.current;
    if (!ws) return;

    if (ws.isPlaying()) {
      ws.pause();
      setIsPlaying(false);
    } else {
      setCurrentWaveSurfer(ws); 
      ws.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-black/30 rounded-lg">
      <button
        onClick={togglePlay}
        className="bg-green-500 hover:bg-green-600 w-9 h-9 rounded-full flex items-center justify-center"
      >
        {isPlaying ? <Pause size={18} className="text-white" /> : <Play size={18} className="text-white" />}
      </button>
      <div
        ref={waveformRef}
        className="w-full max-w-[180px] h-[40px] overflow-hidden"
      />
      <span className="text-xs text-gray-300 w-[50px] text-right">
        {formatDuration(duration)}
      </span>
    </div>
  );
};

export default VoiceMessagePlayer;
