// Wishlist utilities - browser localStorage based, no login required

const WISHLIST_KEY = 'catalog_maker_wishlist';
const SELECTED_KEY = 'catalog_maker_selected';

export interface WishlistItem {
  _id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  sourceUrl?: string;
}

export function getWishlist(): WishlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(WISHLIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addToWishlist(item: WishlistItem): WishlistItem[] {
  const list = getWishlist();
  if (!list.find(w => w._id === item._id)) {
    list.push(item);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  }
  return list;
}

export function removeFromWishlist(id: string): WishlistItem[] {
  const list = getWishlist().filter(w => w._id !== id);
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  return list;
}

export function isInWishlist(id: string): boolean {
  return getWishlist().some(w => w._id === id);
}

export function clearWishlist(): void {
  localStorage.removeItem(WISHLIST_KEY);
}

// ─── Selected Products (for WhatsApp enquiry) ───

export function getSelected(): WishlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(SELECTED_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function toggleSelected(item: WishlistItem): WishlistItem[] {
  const list = getSelected();
  const idx = list.findIndex(s => s._id === item._id);
  if (idx >= 0) {
    list.splice(idx, 1);
  } else {
    list.push(item);
  }
  localStorage.setItem(SELECTED_KEY, JSON.stringify(list));
  return list;
}

export function isSelected(id: string): boolean {
  return getSelected().some(s => s._id === id);
}

export function clearSelected(): void {
  localStorage.removeItem(SELECTED_KEY);
}

export function generateWhatsAppUrl(
  phoneNumber: string,
  products: WishlistItem[],
  template?: string
): string {
  const productLines = products
    .map((p, i) => `${i + 1}. ${p.name} - ₹${p.price}`)
    .join('\n');

  const message = template
    ? template.replace('{products}', productLines)
    : `Hi, I am interested in the following products:\n\n${productLines}\n\nPlease share more details and pricing.`;

  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encoded}`;
}
