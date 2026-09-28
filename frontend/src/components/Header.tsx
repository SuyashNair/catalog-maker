'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getConfig } from '@/lib/api';
import { getWishlist, getSelected } from '@/lib/wishlist';
import styles from './Header.module.css';

export default function Header() {
  const [config, setConfig] = useState<any>(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [selectedCount, setSelectedCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    getConfig().then(res => setConfig(res.data)).catch(() => {});
    
    const update = () => {
      setWishlistCount(getWishlist().length);
      setSelectedCount(getSelected().length);
    };
    update();
    window.addEventListener('storage', update);
    window.addEventListener('wishlist-update', update);
    window.addEventListener('selected-update', update);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener('wishlist-update', update);
      window.removeEventListener('selected-update', update);
    };
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>✦</span>
          <span className={styles.logoText}>{config?.catalogName || 'Catalog Maker'}</span>
        </Link>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
          <Link href="/" className={styles.navLink} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/category" className={styles.navLink} onClick={() => setMenuOpen(false)}>Categories</Link>
          <Link href="/wishlist" className={styles.navLink} onClick={() => setMenuOpen(false)}>
            ♡ Wishlist
            {wishlistCount > 0 && <span className={styles.badge}>{wishlistCount}</span>}
          </Link>
          {selectedCount > 0 && (
            <Link href="/wishlist" className={`${styles.navLink} ${styles.enquiryLink}`} onClick={() => setMenuOpen(false)}>
              📩 Enquiry ({selectedCount})
            </Link>
          )}
        </nav>

        <div className={styles.actions}>
          <Link href="/wishlist" className={styles.iconBtn} title="Wishlist">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            {wishlistCount > 0 && <span className={styles.badgeDot}>{wishlistCount}</span>}
          </Link>
          <button className={styles.menuBtn} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span className={`${styles.menuIcon} ${menuOpen ? styles.menuIconOpen : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
