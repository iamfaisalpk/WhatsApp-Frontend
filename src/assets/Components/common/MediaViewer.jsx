import React from "react";
import { X } from "lucide-react";

const MediaViewer = ({ media, onClose }) => {
    if (!media?.url) return null;

return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
    <button
        className="absolute top-4 right-4 text-white hover:text-red-400 transition-colors"
        onClick={onClose}
    >
        <X size={28} className="cursor-pointer" />
        </button>

        {media.type === "image" && (
        <img src={media.url} alt="Media" className="max-w-[90%] max-h-[90%]" />
    )}

        {media.type === "video" && (
        <video controls className="max-w-[90%] max-h-[90%]">
            <source src={media.url} type="video/mp4" />
        </video>
    )}

        {/* Do not open voice note in full screen viewer */}
        {media.type === "voice" && null}
    </div>
);
};

export default MediaViewer;
