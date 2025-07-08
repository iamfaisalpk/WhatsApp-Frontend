let currentWaveSurfer = null;

export const stopAllVoiceNotes = () => {
    if (currentWaveSurfer && currentWaveSurfer.isPlaying()) {
    currentWaveSurfer.stop();
}
};

export const setCurrentWaveSurfer = (wsInstance) => {
    stopAllVoiceNotes();
    currentWaveSurfer = wsInstance;
};
