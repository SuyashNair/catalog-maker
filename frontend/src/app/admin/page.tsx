'use client';

import { useState, useEffect } from 'react';
import * as api from '@/lib/api';
import styles from './page.module.css';

type Tab = 'dashboard' | 'products' | 'categories' | 'sync' | 'settings';

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState('admin@catalogmaker.com');
  const [password, setPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  // Dashboard
  const [dashboard, setDashboard] = useState<any>(null);

  // Products
  const [products, setProducts] = useState<any[]>([]);
  const [prodPage, setProdPage] = useState(1);
  const [prodTotal, setProdTotal] = useState(0);
  const [prodSearch, setProdSearch] = useState('');
  const [editProduct, setEditProduct] = useState<any>(null);
  const [showProductForm, setShowProductForm] = useState(false);

  // Categories
  const [categories, setCategories] = useState<any[]>([]);
  const [editCategory, setEditCategory] = useState<any>(null);
  const [showCatForm, setShowCatForm] = useState(false);

  // Sync
  const [syncLogs, setSyncLogs] = useState<any[]>([]);
  const [syncMessage, setSyncMessage] = useState('');

  // Settings
  const [settings, setSettings] = useState<any>(null);
  const [settingsMsg, setSettingsMsg] = useState('');

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.adminLogin(email, password);
      setToken(res.token);
      setLoggedIn(true);
      setLoginError('');
    } catch (err: any) {
      setLoginError(err.message);
    }
  };

  // Load data when tab changes
  useEffect(() => {
    if (!loggedIn) return;
    if (activeTab === 'dashboard') loadDashboard();
    if (activeTab === 'products') loadProducts();
    if (activeTab === 'categories') loadCategories();
    if (activeTab === 'sync') loadSyncLogs();
    if (activeTab === 'settings') loadSettings();
  }, [activeTab, loggedIn]);

  const loadDashboard = async () => {
    try { const res = await api.getDashboard(token); setDashboard(res.data); } catch (e) { console.error(e); }
  };

  const loadProducts = async (page = 1, search = '') => {
    try {
      const params: Record<string, string> = { page: String(page), limit: '15' };
      if (search) params.search = search;
      const res = await api.getAdminProducts(token, params);
      setProducts(res.data);
      setProdTotal(res.pagination.total);
      setProdPage(page);
    } catch (e) { console.error(e); }
  };

  const loadCategories = async () => {
    try { const res = await api.getAdminCategories(token); setCategories(res.data); } catch (e) { console.error(e); }
  };

  const loadSyncLogs = async () => {
    try { const res = await api.getSyncLogs(token); setSyncLogs(res.data); } catch (e) { console.error(e); }
  };

  const loadSettings = async () => {
    try { const res = await api.getSettings(token); setSettings(res.data); } catch (e) { console.error(e); }
  };

  // Product CRUD
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      price: Number((form.elements.namedItem('price') as HTMLInputElement).value),
      compareAtPrice: Number((form.elements.namedItem('compareAtPrice') as HTMLInputElement).value),
      description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
      sku: (form.elements.namedItem('sku') as HTMLInputElement).value,
      category: (form.elements.namedItem('category') as HTMLSelectElement).value || undefined,
      inStock: (form.elements.namedItem('inStock') as HTMLInputElement).checked,
      isVisible: (form.elements.namedItem('isVisible') as HTMLInputElement).checked,
      isFeatured: (form.elements.namedItem('isFeatured') as HTMLInputElement).checked,
    };

    try {
      if (editProduct?._id) {
        await api.updateProduct(token, editProduct._id, data);
      } else {
        await api.createProduct(token, data);
      }
      setShowProductForm(false);
      setEditProduct(null);
      loadProducts(prodPage);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.deleteProduct(token, id);
      loadProducts(prodPage);
    } catch (err: any) { alert(err.message); }
  };

  // Category CRUD
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = {
      name: (form.elements.namedItem('catName') as HTMLInputElement).value,
      description: (form.elements.namedItem('catDesc') as HTMLInputElement).value,
      isVisible: (form.elements.namedItem('catVisible') as HTMLInputElement).checked,
    };

    try {
      if (editCategory?._id) {
        await api.updateCategory(token, editCategory._id, data);
      } else {
        await api.createCategory(token, data);
      }
      setShowCatForm(false);
      setEditCategory(null);
      loadCategories();
    } catch (err: any) { alert(err.message); }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.deleteCategory(token, id);
      loadCategories();
    } catch (err: any) { alert(err.message); }
  };

  // Sync
  const handleImport = async (source: string) => {
    try {
      setSyncMessage(`Starting import from ${source}...`);
      await api.runImport(token, source);
      setSyncMessage(`Import from ${source} started! Refresh to see results.`);
      setTimeout(loadSyncLogs, 2000);
    } catch (err: any) { setSyncMessage(`Error: ${err.message}`); }
  };

  const handleSync = async (source: string) => {
    try {
      setSyncMessage(`Starting sync from ${source}...`);
      await api.runSync(token, source);
      setSyncMessage(`Sync from ${source} started!`);
      setTimeout(loadSyncLogs, 2000);
    } catch (err: any) { setSyncMessage(`Error: ${err.message}`); }
  };

  // Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateSettings(token, settings);
      setSettingsMsg('Settings saved successfully!');
      setTimeout(() => setSettingsMsg(''), 3000);
    } catch (err: any) { setSettingsMsg(`Error: ${err.message}`); }
  };

  // Login Screen
  if (!loggedIn) {
    return (
      <div className={styles.loginPage}>
        <form className={styles.loginForm} onSubmit={handleLogin}>
          <h1 className={styles.loginTitle}>✦ Admin Panel</h1>
          <p className={styles.loginSubtitle}>Catalog Maker Management</p>
          {loginError && <p className={styles.error}>{loginError}</p>}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className={styles.input} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className={styles.input} />
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.admin}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarLogo}>✦</span>
          <span>Admin Panel</span>
        </div>
        <nav className={styles.sidebarNav}>
          {(['dashboard', 'products', 'categories', 'sync', 'settings'] as Tab[]).map(tab => (
            <button
              key={tab}
              className={`${styles.navItem} ${activeTab === tab ? styles.navItemActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'dashboard' && '📊 '}
              {tab === 'products' && '📦 '}
              {tab === 'categories' && '📁 '}
              {tab === 'sync' && '🔄 '}
              {tab === 'settings' && '⚙️ '}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
            <h1 className={styles.pageTitle}>Dashboard</h1>
            {dashboard && (
              <div className={styles.statGrid}>
                <div className={styles.statCard}>
                  <p className={styles.statValue}>{dashboard.totalProducts}</p>
                  <p className={styles.statLabel}>Total Products</p>
                </div>
                <div className={styles.statCard}>
                  <p className={styles.statValue}>{dashboard.totalCategories}</p>
                  <p className={styles.statLabel}>Categories</p>
                </div>
                <div className={styles.statCard}>
                  <p className={styles.statValue}>{dashboard.shopifyCount}</p>
                  <p className={styles.statLabel}>Shopify Products</p>
                </div>
                <div className={styles.statCard}>
                  <p className={styles.statValue}>{dashboard.woocommerceCount}</p>
                  <p className={styles.statLabel}>WooCommerce Products</p>
                </div>
                <div className={styles.statCard}>
                  <p className={styles.statValue}>{dashboard.inStockCount}</p>
                  <p className={styles.statLabel}>In Stock</p>
                </div>
                <div className={styles.statCard}>
                  <p className={styles.statValue}>{dashboard.outOfStockCount}</p>
                  <p className={styles.statLabel}>Out of Stock</p>
                </div>
              </div>
            )}
            {dashboard?.lastSync && (
              <div className={styles.card} style={{ marginTop: 20 }}>
                <h3>Last Sync</h3>
                <p>Source: {dashboard.lastSync.source} | Status: {dashboard.lastSync.status} | {new Date(dashboard.lastSync.date).toLocaleString()}</p>
              </div>
            )}
          </div>
        )}

        {/* PRODUCTS */}
        {activeTab === 'products' && (
          <div>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Products ({prodTotal})</h1>
              <button className="btn btn-primary" onClick={() => { setEditProduct(null); setShowProductForm(true); }}>+ Add Product</button>
            </div>

            <div className={styles.searchBar}>
              <input type="text" placeholder="Search products..." value={prodSearch} onChange={e => setProdSearch(e.target.value)} className={styles.input} />
              <button className="btn btn-secondary" onClick={() => loadProducts(1, prodSearch)}>Search</button>
            </div>

            {showProductForm && (
              <div className={styles.card}>
                <h3>{editProduct ? 'Edit Product' : 'Add Product'}</h3>
                <form onSubmit={handleSaveProduct} className={styles.form}>
                  <div className={styles.formGrid}>
                    <div>
                      <label>Name *</label>
                      <input name="name" defaultValue={editProduct?.name || ''} required className={styles.input} />
                    </div>
                    <div>
                      <label>SKU</label>
                      <input name="sku" defaultValue={editProduct?.sku || ''} className={styles.input} />
                    </div>
                    <div>
                      <label>Price *</label>
                      <input name="price" type="number" defaultValue={editProduct?.price || 0} required className={styles.input} />
                    </div>
                    <div>
                      <label>Compare Price</label>
                      <input name="compareAtPrice" type="number" defaultValue={editProduct?.compareAtPrice || 0} className={styles.input} />
                    </div>
                    <div>
                      <label>Category</label>
                      <select name="category" defaultValue={editProduct?.category?._id || editProduct?.category || ''} className={styles.input}>
                        <option value="">None</option>
                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label>Description</label>
                    <textarea name="description" defaultValue={editProduct?.description || ''} className={styles.textarea} rows={4} />
                  </div>
                  <div className={styles.checkboxGroup}>
                    <label><input type="checkbox" name="inStock" defaultChecked={editProduct?.inStock !== false} /> In Stock</label>
                    <label><input type="checkbox" name="isVisible" defaultChecked={editProduct?.isVisible !== false} /> Visible</label>
                    <label><input type="checkbox" name="isFeatured" defaultChecked={editProduct?.isFeatured || false} /> Featured</label>
                  </div>
                  <div className={styles.formActions}>
                    <button type="submit" className="btn btn-primary">Save</button>
                    <button type="button" className="btn btn-secondary" onClick={() => { setShowProductForm(false); setEditProduct(null); }}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className={styles.table}>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>Source</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id}>
                      <td>
                        <div className={styles.productCell}>
                          {p.images?.[0] && <img src={p.images[0].thumbnail || p.images[0].url} alt="" className={styles.tableThumb} />}
                          <span>{p.name}</span>
                        </div>
                      </td>
                      <td>{p.sku}</td>
                      <td>₹{p.price}</td>
                      <td>{p.category?.name || '-'}</td>
                      <td><span className={`badge ${p.source === 'shopify' ? 'badge-success' : p.source === 'woocommerce' ? 'badge-warning' : 'badge-gold'}`}>{p.source}</span></td>
                      <td>{p.inStock ? <span className="badge badge-success">Yes</span> : <span className="badge badge-error">No</span>}</td>
                      <td>
                        <div className={styles.tableActions}>
                          <button className="btn btn-sm btn-secondary" onClick={() => { setEditProduct(p); setShowProductForm(true); }}>Edit</button>
                          <button className="btn btn-sm btn-secondary" onClick={() => handleDeleteProduct(p._id)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={styles.pagination}>
              <button className="btn btn-sm btn-secondary" disabled={prodPage <= 1} onClick={() => loadProducts(prodPage - 1, prodSearch)}>← Prev</button>
              <span>Page {prodPage}</span>
              <button className="btn btn-sm btn-secondary" disabled={products.length < 15} onClick={() => loadProducts(prodPage + 1, prodSearch)}>Next →</button>
            </div>
          </div>
        )}

        {/* CATEGORIES */}
        {activeTab === 'categories' && (
          <div>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Categories</h1>
              <button className="btn btn-primary" onClick={() => { setEditCategory(null); setShowCatForm(true); }}>+ Add Category</button>
            </div>

            {showCatForm && (
              <div className={styles.card}>
                <h3>{editCategory ? 'Edit Category' : 'Add Category'}</h3>
                <form onSubmit={handleSaveCategory} className={styles.form}>
                  <div className={styles.formGrid}>
                    <div>
                      <label>Name *</label>
                      <input name="catName" defaultValue={editCategory?.name || ''} required className={styles.input} />
                    </div>
                    <div>
                      <label>Description</label>
                      <input name="catDesc" defaultValue={editCategory?.description || ''} className={styles.input} />
                    </div>
                  </div>
                  <label><input type="checkbox" name="catVisible" defaultChecked={editCategory?.isVisible !== false} /> Visible</label>
                  <div className={styles.formActions}>
                    <button type="submit" className="btn btn-primary">Save</button>
                    <button type="button" className="btn btn-secondary" onClick={() => { setShowCatForm(false); setEditCategory(null); }}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className={styles.table}>
              <table>
                <thead>
                  <tr><th>Name</th><th>Slug</th><th>Products</th><th>Visible</th><th>Order</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {categories.map(c => (
                    <tr key={c._id}>
                      <td>{c.name}</td>
                      <td className={styles.mono}>{c.slug}</td>
                      <td>{c.productCount}</td>
                      <td>{c.isVisible ? '✓' : '✕'}</td>
                      <td>{c.displayOrder}</td>
                      <td>
                        <div className={styles.tableActions}>
                          <button className="btn btn-sm btn-secondary" onClick={() => { setEditCategory(c); setShowCatForm(true); }}>Edit</button>
                          <button className="btn btn-sm btn-secondary" onClick={() => handleDeleteCategory(c._id)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SYNC */}
        {activeTab === 'sync' && (
          <div>
            <h1 className={styles.pageTitle}>Import & Synchronization</h1>

            <div className={styles.syncActions}>
              <div className={styles.syncCard}>
                <h3>🟢 Shopify</h3>
                <p>Import or sync products from Shopify</p>
                <div className={styles.syncBtns}>
                  <button className="btn btn-primary" onClick={() => handleImport('shopify')}>Import All</button>
                  <button className="btn btn-secondary" onClick={() => handleSync('shopify')}>Sync Updates</button>
                </div>
              </div>
              <div className={styles.syncCard}>
                <h3>🟣 WooCommerce</h3>
                <p>Import or sync products from WooCommerce</p>
                <div className={styles.syncBtns}>
                  <button className="btn btn-primary" onClick={() => handleImport('woocommerce')}>Import All</button>
                  <button className="btn btn-secondary" onClick={() => handleSync('woocommerce')}>Sync Updates</button>
                </div>
              </div>
            </div>

            {syncMessage && <div className={styles.card} style={{ marginTop: 16 }}><p>{syncMessage}</p></div>}

            <h3 style={{ margin: '24px 0 12px' }}>Sync History</h3>
            <div className={styles.table}>
              <table>
                <thead>
                  <tr><th>Source</th><th>Type</th><th>Status</th><th>Created</th><th>Updated</th><th>Failed</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {syncLogs.map(log => (
                    <tr key={log._id}>
                      <td><span className={`badge ${log.source === 'shopify' ? 'badge-success' : 'badge-warning'}`}>{log.source}</span></td>
                      <td>{log.type}</td>
                      <td><span className={`badge ${log.status === 'completed' ? 'badge-success' : log.status === 'failed' ? 'badge-error' : 'badge-warning'}`}>{log.status}</span></td>
                      <td>{log.stats?.created || 0}</td>
                      <td>{log.stats?.updated || 0}</td>
                      <td>{log.stats?.failed || 0}</td>
                      <td>{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === 'settings' && settings && (
          <div>
            <h1 className={styles.pageTitle}>Settings</h1>
            {settingsMsg && <div className={styles.card} style={{ marginBottom: 16 }}><p style={{ color: settingsMsg.startsWith('Error') ? 'var(--color-error)' : 'var(--color-success)' }}>{settingsMsg}</p></div>}
            <form onSubmit={handleSaveSettings} className={styles.settingsForm}>
              <div className={styles.card}>
                <h3>General</h3>
                <div className={styles.formGrid}>
                  <div><label>Catalog Name</label><input className={styles.input} value={settings.catalogName || ''} onChange={e => setSettings({...settings, catalogName: e.target.value})} /></div>
                  <div><label>Catalog Description</label><input className={styles.input} value={settings.catalogDescription || ''} onChange={e => setSettings({...settings, catalogDescription: e.target.value})} /></div>
                </div>
              </div>
              <div className={styles.card}>
                <h3>WhatsApp</h3>
                <div className={styles.formGrid}>
                  <div><label>WhatsApp Number (with country code)</label><input className={styles.input} value={settings.whatsappNumber || ''} onChange={e => setSettings({...settings, whatsappNumber: e.target.value})} /></div>
                </div>
              </div>
              <div className={styles.card}>
                <h3>Catalog Design</h3>
                <div className={styles.designPicker}>
                  <label className={`${styles.designOption} ${settings.activeDesign === 'elegant' ? styles.designActive : ''}`}>
                    <input type="radio" name="design" value="elegant" checked={settings.activeDesign === 'elegant'} onChange={() => setSettings({...settings, activeDesign: 'elegant'})} />
                    <div className={styles.designPreview} style={{ background: 'linear-gradient(135deg, #0a0a0a, #1a1510)' }}>
                      <span style={{ color: '#c9a55a' }}>✦</span>
                    </div>
                    <span>Elegant Dark</span>
                  </label>
                  <label className={`${styles.designOption} ${settings.activeDesign === 'vibrant' ? styles.designActive : ''}`}>
                    <input type="radio" name="design" value="vibrant" checked={settings.activeDesign === 'vibrant'} onChange={() => setSettings({...settings, activeDesign: 'vibrant'})} />
                    <div className={styles.designPreview} style={{ background: 'linear-gradient(135deg, #0d0d2b, #1a0a2e)' }}>
                      <span style={{ color: '#8b5cf6' }}>✦</span>
                    </div>
                    <span>Vibrant Modern</span>
                  </label>
                </div>
              </div>
              <div className={styles.card}>
                <h3>Shopify Integration</h3>
                <div className={styles.formGrid}>
                  <div><label>Store URL</label><input className={styles.input} value={settings.shopify?.storeUrl || ''} onChange={e => setSettings({...settings, shopify: {...settings.shopify, storeUrl: e.target.value}})} placeholder="https://your-store.myshopify.com" /></div>
                  <div><label>Access Token</label><input className={styles.input} type="password" value={settings.shopify?.accessToken || ''} onChange={e => setSettings({...settings, shopify: {...settings.shopify, accessToken: e.target.value}})} /></div>
                </div>
              </div>
              <div className={styles.card}>
                <h3>WooCommerce Integration</h3>
                <div className={styles.formGrid}>
                  <div><label>Site URL</label><input className={styles.input} value={settings.woocommerce?.url || ''} onChange={e => setSettings({...settings, woocommerce: {...settings.woocommerce, url: e.target.value}})} placeholder="https://your-wordpress-site.com" /></div>
                  <div><label>Consumer Key</label><input className={styles.input} value={settings.woocommerce?.consumerKey || ''} onChange={e => setSettings({...settings, woocommerce: {...settings.woocommerce, consumerKey: e.target.value}})} /></div>
                  <div><label>Consumer Secret</label><input className={styles.input} type="password" value={settings.woocommerce?.consumerSecret || ''} onChange={e => setSettings({...settings, woocommerce: {...settings.woocommerce, consumerSecret: e.target.value}})} /></div>
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg">Save All Settings</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
