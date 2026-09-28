'use client';

import { useState } from 'react';
import Link from 'next/link';
import { addToWishlist, removeFromWishlist, isInWishlist, toggleSelected, isSelected, type WishlistItem } from '@/lib/wishlist';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: any;
  design?: 'elegant' | 'vibrant';
  onQuickView?: (product: any) => void;
}

export default function ProductCard({ product, design = 'elegant', onQuickView }: ProductCardProps) {
  const [inWishlist, setInWishlist] = useState(() => isInWishlist(product._id));
  const [selected, setSelectedState] = useState(() => isSelected(product._id));
  const [imgLoaded, setImgLoaded] = useState(false);

  const imageUrl = product.images?.[0]?.thumbnail || product.images?.[0]?.url || '';
  const hasDiscount = product.compareAtPrice > product.price;

  const wishlistItem: WishlistItem = {
    _id: product._id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    image: imageUrl,
    sourceUrl: product.sourceUrl,
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product._id);
      setInWishlist(false);
    } else {
      addToWishlist(wishlistItem);
      setInWishlist(true);
    }
    window.dispatchEvent(new Event('wishlist-update'));
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSelected(wishlistItem);
    setSelectedState(!selected);
    window.dispatchEvent(new Event('selected-update'));
  };

  const cardClass = design === 'vibrant' ? `${styles.card} ${styles.vibrant}` : styles.card;

  return (
    <div className={cardClass}>
      <Link href={`/product/${product.slug}`} className={styles.imageWrap}>
        {!imgLoaded && <div className={`${styles.imgPlaceholder} skeleton`} />}
        {imageUrl && (
          <img
            src={imageUrl}
            alt={product.name}
            className={`${styles.image} ${imgLoaded ? styles.imageLoaded : ''}`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
          />
        )}

        {hasDiscount && (
          <span className={styles.discountBadge}>
            -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
          </span>
        )}

        {!product.inStock && <span className={styles.oosOverlay}>Out of Stock</span>}

        <div className={styles.actions}>
          <button
            className={`${styles.actionBtn} ${inWishlist ? styles.wishlisted : ''}`}
            onClick={handleWishlist}
            title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {inWishlist ? '♥' : '♡'}
          </button>
          <button
            className={`${styles.actionBtn} ${selected ? styles.selectedBtn : ''}`}
            onClick={handleSelect}
            title={selected ? 'Remove from enquiry' : 'Add to enquiry'}
          >
            {selected ? '✓' : '+'}
          </button>
        </div>
      </Link>

      <div className={styles.info}>
        <Link href={`/product/${product.slug}`}>
          <p className={styles.category}>{product.category?.name || 'Uncategorized'}</p>
          <h3 className={styles.name}>{product.name}</h3>
          <div className={styles.pricing}>
            <span className={styles.price}>₹{product.price?.toLocaleString('en-IN')}</span>
            {hasDiscount && (
              <span className={styles.comparePrice}>₹{product.compareAtPrice?.toLocaleString('en-IN')}</span>
            )}
          </div>
        </Link>
        {product.source && (
          <span className={`badge ${product.source === 'shopify' ? 'badge-success' : 'badge-warning'}`}>
            {product.source}
          </span>
        )}
      </div>
    </div>
  );
}
