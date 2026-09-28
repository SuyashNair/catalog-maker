'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './Lightbox.module.css';

interface LightboxProps {
  images: { url: string; alt?: string }[];
  startIndex?: number;
  onClose: () => void;
}

export default function Lightbox({ images, startIndex = 0, onClose }: LightboxProps) {
  const [current, setCurrent] = useState(startIndex);

  const next = useCallback(() => setCurrent(i => (i + 1) % images.length), [images.length]);
  const prev = useCallback(() => setCurrent(i => (i - 1 + images.length) % images.length), [images.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose, next, prev]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={e => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose}>✕</button>

        <div className={styles.imageContainer}>
          <img src={images[current].url} alt={images[current].alt || ''} className={styles.image} />
        </div>

        {images.length > 1 && (
          <>
            <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={prev}>‹</button>
            <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={next}>›</button>
            
            <div className={styles.dots}>
              {images.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
                  onClick={() => setCurrent(i)}
                />
              ))}
            </div>

            <div className={styles.thumbnails}>
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`${styles.thumb} ${i === current ? styles.thumbActive : ''}`}
                  onClick={() => setCurrent(i)}
                >
                  <img src={img.url} alt="" />
                </button>
              ))}
            </div>
          </>
        )}

        <p className={styles.counter}>{current + 1} / {images.length}</p>
      </div>
    </div>
  );
}
