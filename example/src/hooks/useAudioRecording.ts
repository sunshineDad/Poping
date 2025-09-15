import { useState } from 'react';

type AudioState = 'idle' | 'recording' | 'processing';

interface AudioRecordingResult {
  audioBase64: string;
  mimeType: string;
}

export function useAudioRecording() {
  const [state, setState] = useState<AudioState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  
  const isSupported = typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia;

  const startRecording = async (): Promise<void> => {
    setState('recording');
    setError(null);
    // Mock implementation
  };

  const stopRecording = async (): Promise<AudioRecordingResult | null> => {
    setState('processing');
    // Mock implementation
    setTimeout(() => {
      setState('idle');
    }, 1000);
    return null;
  };

  const resetToIdle = (): void => {
    setState('idle');
    setError(null);
    setDuration(0);
    setAudioData(null);
  };

  return {
    state,
    startRecording,
    stopRecording,
    resetToIdle,
    error,
    duration,
    isSupported,
    audioData,
  };
}