'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCategories } from '@/lib/api';
import styles from './page.module.css';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then(res => setCategories(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.title}>Browse Categories</h1>
        <p className={styles.subtitle}>Explore our curated product collections</p>

        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.skelCard}>
                <div className="skeleton" style={{ aspectRatio: '16/10', borderRadius: 12 }} />
                <div style={{ padding: 16 }}>
                  <div className="skeleton skeleton-title" />
                  <div className="skeleton skeleton-text" style={{ width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.grid}>
            {categories.map((cat, i) => (
              <Link key={cat._id} href={`/?category=${cat.slug}`} className={styles.card} style={{ animationDelay: `${i * 60}ms` }}>
                <div className={styles.cardImage}>
                  {cat.image && <img src={cat.image} alt={cat.name} loading="lazy" />}
                  <div className={styles.cardOverlay} />
                </div>
                <div className={styles.cardInfo}>
                  <h2 className={styles.cardName}>{cat.name}</h2>
                  <p className={styles.cardCount}>{cat.productCount} products</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
