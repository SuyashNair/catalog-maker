'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getConfig } from '@/lib/api';
import { getWishlist, removeFromWishlist, clearWishlist, getSelected, toggleSelected, clearSelected, isSelected, generateWhatsAppUrl, type WishlistItem } from '@/lib/wishlist';
import styles from './page.module.css';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [selected, setSelected] = useState<WishlistItem[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'wishlist' | 'enquiry'>('wishlist');

  useEffect(() => {
    setWishlist(getWishlist());
    setSelected(getSelected());
    getConfig().then(res => setConfig(res.data)).catch(() => {});
  }, []);

  const handleRemove = (id: string) => {
    const updated = removeFromWishlist(id);
    setWishlist(updated);
    window.dispatchEvent(new Event('wishlist-update'));
  };

  const handleToggleSelect = (item: WishlistItem) => {
    const updated = toggleSelected(item);
    setSelected(updated);
    window.dispatchEvent(new Event('selected-update'));
  };

  const handleClearWishlist = () => {
    clearWishlist();
    setWishlist([]);
    window.dispatchEvent(new Event('wishlist-update'));
  };

  const handleClearSelected = () => {
    clearSelected();
    setSelected([]);
    window.dispatchEvent(new Event('selected-update'));
  };

  const handleWhatsApp = () => {
    if (selected.length === 0) return;
    const url = generateWhatsAppUrl(
      config?.whatsappNumber || '919999999999',
      selected,
      config?.whatsappMessage
    );
    window.open(url, '_blank');
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.title}>My Collection</h1>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'wishlist' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('wishlist')}
          >
            ♡ Wishlist ({wishlist.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'enquiry' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('enquiry')}
          >
            📩 Enquiry ({selected.length})
          </button>
        </div>

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <>
            {wishlist.length === 0 ? (
              <div className={styles.empty}>
                <p className={styles.emptyIcon}>♡</p>
                <h3>Your wishlist is empty</h3>
                <p>Browse our catalog and save products you love</p>
                <Link href="/" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Catalog</Link>
              </div>
            ) : (
              <>
                <div className={styles.toolbar}>
                  <p className={styles.count}>{wishlist.length} saved products</p>
                  <button className="btn btn-secondary btn-sm" onClick={handleClearWishlist}>Clear All</button>
                </div>
                <div className={styles.list}>
                  {wishlist.map(item => (
                    <div key={item._id} className={styles.item}>
                      <Link href={`/product/${item.slug}`} className={styles.itemImage}>
                        {item.image && <img src={item.image} alt={item.name} />}
                      </Link>
                      <div className={styles.itemInfo}>
                        <Link href={`/product/${item.slug}`}>
                          <h3 className={styles.itemName}>{item.name}</h3>
                        </Link>
                        <p className={styles.itemPrice}>₹{item.price?.toLocaleString('en-IN')}</p>
                      </div>
                      <div className={styles.itemActions}>
                        <button
                          className={`btn btn-sm ${isSelected(item._id) ? 'btn-primary' : 'btn-outline'}`}
                          onClick={() => handleToggleSelect(item)}
                        >
                          {isSelected(item._id) ? '✓ Selected' : '+ Select'}
                        </button>
                        <button className="btn btn-sm btn-secondary" onClick={() => handleRemove(item._id)}>
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Enquiry Tab */}
        {activeTab === 'enquiry' && (
          <>
            {selected.length === 0 ? (
              <div className={styles.empty}>
                <p className={styles.emptyIcon}>📩</p>
                <h3>No products selected for enquiry</h3>
                <p>Select products from the catalog to send a WhatsApp enquiry</p>
                <Link href="/" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Catalog</Link>
              </div>
            ) : (
              <>
                <div className={styles.toolbar}>
                  <p className={styles.count}>{selected.length} products selected</p>
                  <button className="btn btn-secondary btn-sm" onClick={handleClearSelected}>Clear All</button>
                </div>
                
                <div className={styles.list}>
                  {selected.map(item => (
                    <div key={item._id} className={styles.item}>
                      <Link href={`/product/${item.slug}`} className={styles.itemImage}>
                        {item.image && <img src={item.image} alt={item.name} />}
                      </Link>
                      <div className={styles.itemInfo}>
                        <Link href={`/product/${item.slug}`}>
                          <h3 className={styles.itemName}>{item.name}</h3>
                        </Link>
                        <p className={styles.itemPrice}>₹{item.price?.toLocaleString('en-IN')}</p>
                      </div>
                      <div className={styles.itemActions}>
                        <button className="btn btn-sm btn-secondary" onClick={() => handleToggleSelect(item)}>
                          ✕ Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* WhatsApp Enquiry Preview */}
                <div className={styles.enquiryBox}>
                  <h3 className={styles.enquiryTitle}>WhatsApp Enquiry Preview</h3>
                  <div className={styles.enquiryPreview}>
                    <p>Hi, I am interested in the following products:</p>
                    <br />
                    {selected.map((item, i) => (
                      <p key={item._id}>{i + 1}. {item.name} - ₹{item.price?.toLocaleString('en-IN')}</p>
                    ))}
                    <br />
                    <p>Please share more details and pricing.</p>
                  </div>
                  <button className="btn btn-whatsapp btn-lg" onClick={handleWhatsApp} style={{ width: '100%', marginTop: 16 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Send WhatsApp Enquiry ({selected.length} products)
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
