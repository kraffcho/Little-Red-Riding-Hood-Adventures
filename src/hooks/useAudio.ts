import { useState, useRef, useEffect, useCallback } from "react";
import { AUDIO_PATHS, DEFAULT_VOLUME, COOKIE_KEYS } from "../constants/gameConfig";

// manages background music, sound effects, and volume control
export const useAudio = () => {
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isSoundEffectsEnabled, setIsSoundEffectsEnabled] = useState(true);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [flowerCollectSoundBuffer, setFlowerCollectSoundBuffer] = useState<AudioBuffer | null>(null);
  const hasUserInteracted = useRef(false);
  
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // initialize background music on mount
  useEffect(() => {
    backgroundMusicRef.current = new Audio(AUDIO_PATHS.BACKGROUND_MUSIC);
    backgroundMusicRef.current.volume = volume;
    backgroundMusicRef.current.loop = true;

    return () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current = null;
      }
    };
  }, []);

  // preload flower collection sound using Web Audio API for better performance
  useEffect(() => {
    const loadFlowerCollectSound = async () => {
      try {
        const response = await fetch(AUDIO_PATHS.COLLECT_ITEM);
        const arrayBuffer = await response.arrayBuffer();
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;
        audioContext.decodeAudioData(arrayBuffer, (buffer) => {
          setFlowerCollectSoundBuffer(buffer);
        });
      } catch (error) {
        console.error("Failed to load flower collect sound:", error);
      }
    };

    loadFlowerCollectSound();
  }, []);

  // sync volume changes to background music
  useEffect(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.volume = volume;
    }
  }, [volume]);

  const playSound = useCallback((audioPath: string, requireInteraction: boolean = true) => {
    // wait for user interaction before playing (browser autoplay policy)
    if (requireInteraction && !hasUserInteracted.current) {
      return;
    }
    
    if (!isSoundEffectsEnabled) {
      return;
    }
    
    const sound = new Audio(audioPath);
    sound.volume = volume;
    sound.play().catch((error) => {
      // browsers block sound until user interacts with the page
      const isAutoplayError = error.name === "NotAllowedError" || 
                             error.message?.includes("user didn't interact") ||
                             error.message?.includes("play() failed");
      if (!isAutoplayError) {
        console.error("Failed to play sound:", error);
      }
    });
  }, [volume, isSoundEffectsEnabled]);

  const playRandomSound = useCallback((audioPaths: readonly string[], requireInteraction: boolean = true) => {
    const randomIndex = Math.floor(Math.random() * audioPaths.length);
    playSound(audioPaths[randomIndex], requireInteraction);
  }, [playSound]);

  const playBackgroundMusic = useCallback(() => {
    if (backgroundMusicRef.current) {
      hasUserInteracted.current = true;
      backgroundMusicRef.current.play().catch((error) => {
        const isAutoplayError = error.name === "NotAllowedError" || 
                               error.message?.includes("user didn't interact") ||
                               error.message?.includes("play() failed");
        if (!isAutoplayError) {
          console.error("Failed to play background music:", error);
        }
      });
      setIsPlayingMusic(true);
    }
  }, []);

  const stopBackgroundMusic = useCallback(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
      setIsPlayingMusic(false);
    }
  }, []);

  const playFlowerCollectSound = useCallback(() => {
    if (!hasUserInteracted.current || !isSoundEffectsEnabled) {
      return;
    }
    
    if (flowerCollectSoundBuffer && audioContextRef.current) {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = flowerCollectSoundBuffer;
      source.connect(audioContextRef.current.destination);
      source.start();
    }
  }, [flowerCollectSoundBuffer, isSoundEffectsEnabled]);

  const handleToggleSound = useCallback(() => {
    hasUserInteracted.current = true;
    if (isPlayingMusic) {
      stopBackgroundMusic();
      document.cookie = `${COOKIE_KEYS.BACKGROUND_MUSIC_PAUSED}=true; path=/`;
    } else {
      playBackgroundMusic();
      document.cookie = `${COOKIE_KEYS.BACKGROUND_MUSIC_PAUSED}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  }, [isPlayingMusic, playBackgroundMusic, stopBackgroundMusic]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
  }, []);

  const handleToggleSoundEffects = useCallback(() => {
    setIsSoundEffectsEnabled(prev => !prev);
  }, []);

  const checkMusicCookie = useCallback((): boolean => {
    return document.cookie.includes(`${COOKIE_KEYS.BACKGROUND_MUSIC_PAUSED}=true`);
  }, []);

  const resetMusic = useCallback(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
      backgroundMusicRef.current.currentTime = 0;
      setIsPlayingMusic(false);
    }
  }, []);

  const markUserInteracted = useCallback(() => {
    hasUserInteracted.current = true;
  }, []);

  return {
    isPlayingMusic,
    isSoundEffectsEnabled,
    volume,
    playSound,
    playRandomSound,
    playBackgroundMusic,
    stopBackgroundMusic,
    playFlowerCollectSound,
    handleToggleSound,
    handleToggleSoundEffects,
    handleVolumeChange,
    checkMusicCookie,
    resetMusic,
    markUserInteracted,
  };
};

