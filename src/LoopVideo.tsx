import { useEffect, useRef } from 'react';

// Clip mudo en bucle: se detiene con la pausa global y cuando sale de pantalla.
export default function LoopVideo({ name, paused }: { name: string; paused: boolean }) {
 const video = useRef<HTMLVideoElement>(null);
 useEffect(() => {
  const v = video.current;
  if (!v) return;
  if (paused) { v.pause(); return; }
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) void v.play().catch(() => {}); else v.pause(); });
  io.observe(v);
  return () => io.disconnect();
 }, [paused]);
 return <video ref={video} className="loop-video" src={`/media/${name}.mp4`} poster={`/media/${name}-poster.webp`} muted loop playsInline preload="metadata" aria-hidden="true"/>;
}
