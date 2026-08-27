import { useState, useEffect } from 'react';
import { soundSynth } from '../services/audio';

export function useAudioAlarm() {
  const [enabled, setEnabled] = useState<boolean>(soundSynth.getEnabled());
  const [volume, setVolume] = useState<number>(soundSynth.getVolume());

  const toggleSound = () => {
    const next = !enabled;
    setEnabled(next);
    soundSynth.setEnabled(next);
    if (next) {
      soundSynth.playAcknowledgeChime();
    }
  };

  const updateVolume = (val: number) => {
    setVolume(val);
    soundSynth.setVolume(val);
  };

  return {
    isSoundEnabled: enabled,
    soundVolume: volume,
    toggleSound,
    updateVolume,
    playCriticalAlert: () => soundSynth.playCriticalAlert(),
    playAcknowledgeChime: () => soundSynth.playAcknowledgeChime(),
    playSonarPing: () => soundSynth.playSonarPing(),
  };
}
