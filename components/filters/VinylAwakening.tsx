"use client";

import { useEffect, useState, type CSSProperties } from "react";
import styles from "./vinyl-awakening.module.css";

// Updated copy to match your pitch
const LINES = [
  "Finding the feeling…",
  "Translating emotion into cinema…",
  "Listening between the frames…",
  "Finding films that feel like your song…",
];

export function VinylAwakening({ songTitle, artist, isCompleting }: { songTitle: string; artist: string; isCompleting: boolean }) {
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    if (isCompleting) return;
    const timer = window.setInterval(() => setLineIndex((current) => (current + 1) % LINES.length), 2600);
    return () => window.clearInterval(timer);
  }, [isCompleting]);

  return (
    <section className={`${styles.experience}${isCompleting ? ` ${styles.completing}` : ""}`} role="status" aria-live="polite" aria-label="Finding films that match your song">
      
      <div className={styles.scene} aria-hidden="true">
        <div className={styles.ambientLight} />
        
        {/* The new horizontal soundwave intersecting the vinyl */}
        <div className={styles.soundwave}>
          <div className={styles.waveCore} />
          <div className={styles.waveGlow} />
          <div className={styles.waveLines} />
        </div>

        <div className={styles.projectorBeam}>
          <span /><span /><span /><span /><span />
        </div>
        
        {/* Concentric rings expanding outward */}
        <div className={styles.soundRing} />
        <div className={`${styles.soundRing} ${styles.soundRingTwo}`} />
        <div className={`${styles.soundRing} ${styles.soundRingThree}`} />
        
        <div className={styles.recordShadow} />
        <div className={styles.record}>
          <div className={styles.grooves} />
          <div className={styles.recordReflection} />
          <div className={styles.label}>
            <span className={styles.labelLine} />
            <span className={styles.labelCenter} />
            <span className={styles.labelSide}>SIDE B</span>
          </div>
        </div>
        
        {/* Dust particles */}
        {Array.from({ length: 18 }, (_, index) => (
          <i 
            className={styles.dust} 
            key={index} 
            style={{ 
              "--dust-x": `${(index * 37 + 11) % 100}%`, 
              "--dust-y": `${(index * 23 + 7) % 100}%`, 
              "--dust-delay": `${(index % 9) * -0.7}s`, 
              "--dust-duration": `${5 + (index % 5)}s` 
            } as CSSProperties} 
          />
        ))}
      </div>

      <div className={styles.copy}>
        <p className={styles.eyebrow}><span /> SIDE B · IN THE MAKING</p>
        <h2>Some songs feel like <em>movies waiting to happen.</em></h2>
        
        <p className={styles.track}>
          <span className={styles.trackDot} />
          <span className={styles.trackDetails}>
            <strong>{songTitle}</strong>
            <span>{artist}</span>
          </span>
        </p>
        
        <p className={styles.statusLine} key={lineIndex}>
          {isCompleting ? "The first frame is coming into focus…" : LINES[lineIndex]}
        </p>
        
        <div className={styles.waveform} aria-hidden="true">
          {Array.from({ length: 35 }, (_, index) => (
            <i 
              key={index} 
              style={{ 
                "--wave-height": `${5 + ((index * 13 + (index % 4) * 7) % 19)}px`, 
                "--wave-delay": `${(index % 11) * -0.12}s` 
              } as CSSProperties} 
            />
          ))}
        </div>
      </div>
      
    </section>
  );
}
