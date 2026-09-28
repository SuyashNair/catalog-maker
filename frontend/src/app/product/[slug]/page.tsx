'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getProduct, getConfig } from '@/lib/api';
import { addToWishlist, removeFromWishlist, isInWishlist, toggleSelected, isSelected, generateWhatsAppUrl, type WishlistItem } from '@/lib/wishlist';
import ProductCard from '@/components/ProductCard';
import Lightbox from '@/components/Lightbox';
import styles from './page.module.css';

export default function ProductPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [selected, setSelectedState] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([getProduct(slug), getConfig()])
      .then(([prodRes, configRes]) => {
        setProduct(prodRes.data);
        setRelated(prodRes.related || []);
        setConfig(configRes.data);
        setInWishlist(isInWishlist(prodRes.data._id));
        setSelectedState(isSelected(prodRes.data._id));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className="container">
          <div className={styles.detail}>
            <div className={styles.gallery}>
              <div className="skeleton" style={{ aspectRatio: '1', borderRadius: 12 }} />
            </div>
            <div className={styles.info}>
              <div className="skeleton skeleton-text" style={{ width: '30%' }} />
              <div className="skeleton skeleton-title" style={{ width: '80%', height: 28 }} />
              <div className="skeleton skeleton-text" style={{ width: '25%', height: 32 }} />
              <div className="skeleton" style={{ height: 100, marginTop: 16 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.page}>
        <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
          <h2>Product not found</h2>
          <Link href="/" className="btn btn-primary" style={{ marginTop: 16 }}>Back to Catalog</Link>
        </div>
      </div>
    );
  }

  const wishlistItem: WishlistItem = {
    _id: product._id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    image: product.images?.[0]?.url || '',
    sourceUrl: product.sourceUrl,
  };

  const handleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product._id);
      setInWishlist(false);
    } else {
      addToWishlist(wishlistItem);
      setInWishlist(true);
    }
    window.dispatchEvent(new Event('wishlist-update'));
  };

  const handleSelect = () => {
    toggleSelected(wishlistItem);
    setSelectedState(!selected);
    window.dispatchEvent(new Event('selected-update'));
  };

  const handleWhatsApp = () => {
    const url = generateWhatsAppUrl(config?.whatsappNumber || '', [wishlistItem]);
    window.open(url, '_blank');
  };

  const hasDiscount = product.compareAtPrice > product.price;

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link href={`/?category=${product.category.slug}`}>{product.category.name}</Link>
              <span>/</span>
            </>
          )}
          <span className={styles.breadcrumbCurrent}>{product.name}</span>
        </nav>

        <div className={styles.detail}>
          {/* Image Gallery */}
          <div className={styles.gallery}>
            <div className={styles.mainImage} onClick={() => setLightboxOpen(true)}>
              {product.images?.[activeImage] && (
                <img src={product.images[activeImage].url} alt={product.name} className={styles.mainImg} />
              )}
              <div className={styles.zoomHint}>🔍 Click to zoom</div>
            </div>

            {product.images?.length > 1 && (
              <div className={styles.thumbs}>
                {product.images.map((img: any, i: number) => (
                  <button
                    key={i}
                    className={`${styles.thumb} ${i === activeImage ? styles.thumbActive : ''}`}
                    onClick={() => setActiveImage(i)}
                  >
                    <img src={img.thumbnail || img.url} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className={styles.info}>
            {product.category && (
              <Link href={`/?category=${product.category.slug}`} className={styles.catLabel}>
                {product.category.name}
              </Link>
            )}
            <h1 className={styles.title}>{product.name}</h1>

            <div className={styles.pricing}>
              <span className={styles.price}>₹{product.price?.toLocaleString('en-IN')}</span>
              {hasDiscount && (
                <>
                  <span className={styles.comparePrice}>₹{product.compareAtPrice?.toLocaleString('en-IN')}</span>
                  <span className={styles.discount}>
                    {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% off
                  </span>
                </>
              )}
            </div>

            <div className={styles.availability}>
              {product.inStock ? (
                <span className="badge badge-success">✓ In Stock</span>
              ) : (
                <span className="badge badge-error">✕ Out of Stock</span>
              )}
              <span className={`badge ${product.source === 'shopify' ? 'badge-success' : product.source === 'woocommerce' ? 'badge-warning' : 'badge-gold'}`}>
                {product.source}
              </span>
            </div>

            {product.sku && <p className={styles.sku}>SKU: {product.sku}</p>}

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div className={styles.variants}>
                <p className={styles.variantLabel}>Variants:</p>
                <div className={styles.variantList}>
                  {product.variants.map((v: any, i: number) => (
                    <span key={i} className={styles.variantChip}>
                      {v.name} {v.price !== product.price && `(₹${v.price})`}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className={styles.actions}>
              <button className="btn btn-whatsapp btn-lg" onClick={handleWhatsApp} style={{ flex: 1 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Enquire on WhatsApp
              </button>
              <button className={`btn ${inWishlist ? 'btn-primary' : 'btn-outline'} btn-lg`} onClick={handleWishlist}>
                {inWishlist ? '♥ Saved' : '♡ Wishlist'}
              </button>
              <button className={`btn ${selected ? 'btn-primary' : 'btn-secondary'} btn-lg`} onClick={handleSelect}>
                {selected ? '✓ Selected' : '+ Select'}
              </button>
            </div>

            {/* Description */}
            {product.description && (
              <div className={styles.description}>
                <h3>Description</h3>
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>
            )}

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className={styles.tags}>
                {product.tags.map((tag: string, i: number) => (
                  <span key={i} className={styles.tag}>{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className={styles.relatedSection}>
            <h2 className={styles.relatedTitle}>Related Products</h2>
            <div className={styles.relatedGrid}>
              {related.map(p => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && product.images?.length > 0 && (
        <Lightbox
          images={product.images.map((img: any) => ({ url: img.url, alt: img.alt }))}
          startIndex={activeImage}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
