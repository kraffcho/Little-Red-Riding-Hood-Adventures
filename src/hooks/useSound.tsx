import { useEffect, useRef } from "react";

const useSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = (src: string, repeat: boolean = false, volume: number = 1) => {
    if (audioRef.current) {
      audioRef.current.src = src;
      audioRef.current.loop = repeat;
      audioRef.current.volume = volume;
      audioRef.current.play().catch((error) => {
        console.error("Failed to play audio:", error);
      });
    }
  };

  useEffect(() => {
    const audioElement = new Audio();
    audioRef.current = audioElement;
    document.body.appendChild(audioElement);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        document.body.removeChild(audioRef.current);
      }
    };
  }, []);

  return playSound;
};

export default useSound;
