// src/utils/voicePlayerManager.jsx

const activeAudioElements = new Set();

const isElementInDOM = (element) => {
  return element && document.body.contains(element);
};

export const setCurrentAudio = (audioElement) => {
  if (audioElement instanceof HTMLAudioElement) {
    activeAudioElements.add(audioElement);
  }
};

export const stopAllVoiceNotes = (excludeAudio = null) => {
  const errors = [];
  activeAudioElements.forEach((audio) => {
    if (
      audio !== excludeAudio &&
      audio instanceof HTMLAudioElement &&
      isElementInDOM(audio)
    ) {
      try {
        if (!audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
      } catch (error) {
        errors.push({ audio, error });
        console.warn("Error stopping voice note:", error);
      }
    } else {
      activeAudioElements.delete(audio);
    }
  });
  return errors.length > 0 ? errors : null;
};

export const getCurrentAudio = () => {
  return activeAudioElements.size > 0 ? [...activeAudioElements].pop() : null;
};

export const clearCurrentAudio = (audioElement = null) => {
  if (audioElement) {
    activeAudioElements.delete(audioElement);
  } else {
    activeAudioElements.clear();
  }
};
