'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
    id: string;
    productId: string;
    name: string;
    slug: string;
    image: string;
    price: number;
    salePrice?: number | null;
    quantity: number;
    size?: string;
    variantId?: string;
    inStock: boolean;
    maxQuantity: number;
}

interface CartContextType {
    items: CartItem[];
    itemCount: number;
    subtotal: number;
    addItem: (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    isInCart: (productId: string, variantId?: string) => boolean;
    // Additional properties for CartDrawer compatibility
    isCartOpen: boolean;
    cartItems: CartItem[];
    closeCart: () => void;
    openCart: () => void;
    removeFromCart: (id: string) => void;
    total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'glanzoo_cart';

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (error) {
                console.error('Failed to parse cart:', error);
            }
        }
        setIsHydrated(true);
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        }
    }, [items, isHydrated]);

    const addItem = (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => {
        setItems((current) => {
            // Check if item already exists (same product and variant)
            const existingIndex = current.findIndex(
                (i) => i.productId === item.productId && i.variantId === item.variantId
            );

            if (existingIndex > -1) {
                // Update quantity if item exists
                const updated = [...current];
                const newQuantity = updated[existingIndex].quantity + (item.quantity || 1);
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: Math.min(newQuantity, item.maxQuantity),
                };
                return updated;
            }

            // Add new item
            const newItem: CartItem = {
                ...item,
                id: `${item.productId}-${item.variantId || 'no-var'}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                quantity: item.quantity || 1,
            };
            return [...current, newItem];
        });
        setIsCartOpen(true); // Open cart when item added
    };

    const removeItem = (id: string) => {
        setItems((current) => current.filter((item) => item.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity < 1) {
            removeItem(id);
            return;
        }

        setItems((current) =>
            current.map((item) =>
                item.id === id
                    ? { ...item, quantity: Math.min(quantity, item.maxQuantity) }
                    : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const isInCart = (productId: string, variantId?: string) => {
        return items.some(
            (item) => item.productId === productId && item.variantId === variantId
        );
    };

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    const itemCount = items.reduce((total, item) => total + item.quantity, 0);

    const subtotal = items.reduce((total, item) => {
        const price = item.salePrice || item.price;
        return total + price * item.quantity;
    }, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                itemCount,
                subtotal,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                isInCart,
                // Cart Drawer compatibility
                isCartOpen,
                cartItems: items,
                closeCart,
                openCart,
                removeFromCart: removeItem,
                total: subtotal,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
