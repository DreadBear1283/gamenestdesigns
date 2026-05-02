import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type CartProduct = {
  id: number;
  name: string;
  slug: string;
  priceCents: number;
  imageUrls: string[];
  isDigital: boolean;
  inventoryCount: number;
};

export type CartItem = {
  product: CartProduct;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  addItem: (product: CartProduct, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "gamenestdesigns-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const subtotalCents = items.reduce((sum, item) => sum + item.product.priceCents * item.quantity, 0);
    const shippingCents = items.length && items.some(item => !item.product.isDigital) ? 895 : 0;
    const totalCents = subtotalCents + shippingCents;
    return {
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotalCents,
      shippingCents,
      totalCents,
      addItem(product, quantity = 1) {
        setItems(current => {
          const existing = current.find(item => item.product.id === product.id);
          if (existing) {
            return current.map(item => item.product.id === product.id ? { ...item, quantity: Math.min(99, item.quantity + quantity) } : item);
          }
          return [...current, { product, quantity }];
        });
      },
      updateQuantity(productId, quantity) {
        setItems(current => current.map(item => item.product.id === productId ? { ...item, quantity } : item).filter(item => item.quantity > 0));
      },
      removeItem(productId) {
        setItems(current => current.filter(item => item.product.id !== productId));
      },
      clearCart() {
        setItems([]);
      },
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}
