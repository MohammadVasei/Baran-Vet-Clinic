"use client";

import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";

export interface CartItem {
  productId: string;
  name: string;
  price_rial: number;
  quantity: number;
  image?: string;
  category?: string;
}

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  // True once stored cart has been hydrated (or a user action changed items).
  // Guards the persist effect from overwriting sessionStorage with the empty
  // initial state before hydration completes on mount.
  hydrated: boolean;
};

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { productId: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" }
  | { type: "HYDRATE"; payload: CartItem[] };

const CART_STORAGE_KEY = "baran-cart";

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingIndex = state.items.findIndex((i) => i.productId === action.payload.productId);
      let newItems: CartItem[];
      if (existingIndex >= 0) {
        newItems = state.items.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        newItems = [...state.items, action.payload];
      }
      return { ...state, items: newItems, isOpen: true, hydrated: true };
    }
    case "REMOVE_ITEM": {
      return { ...state, items: state.items.filter((i) => i.productId !== action.payload), hydrated: true };
    }
    case "UPDATE_QUANTITY": {
      if (action.payload.quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.productId !== action.payload.productId), hydrated: true };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.productId === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
        hydrated: true,
      };
    }
    case "CLEAR_CART":
      return { ...state, items: [], hydrated: true };
    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };
    case "OPEN_CART":
      return { ...state, isOpen: true };
    case "CLOSE_CART":
      return { ...state, isOpen: false };
    case "HYDRATE":
      return { ...state, items: action.payload, hydrated: true };
    default:
      return state;
  }
}

const CartContext = createContext<{
  state: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
} | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
    hydrated: false,
  });

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        dispatch({ type: "HYDRATE", payload: JSON.parse(stored) });
      }
    } catch {
      // ignore corrupt storage
    }
  }, []);

  useEffect(() => {
    // Never write the pristine (pre-hydration) empty state over stored cart —
    // that was the bug where the cart lost its memory on every page load.
    if (!state.hydrated) return;
    sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items, state.hydrated]);

  const addItem = (item: CartItem) => dispatch({ type: "ADD_ITEM", payload: item });
  const removeItem = (productId: string) => dispatch({ type: "REMOVE_ITEM", payload: productId });
  const updateQuantity = (productId: string, quantity: number) =>
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } });
  const clearCart = () => dispatch({ type: "CLEAR_CART" });
  const toggleCart = () => dispatch({ type: "TOGGLE_CART" });
  const openCart = () => dispatch({ type: "OPEN_CART" });
  const closeCart = () => dispatch({ type: "CLOSE_CART" });

  const getSubtotal = () =>
    state.items.reduce((sum, item) => sum + item.price_rial * item.quantity, 0);

  const getItemCount = () => state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
        getSubtotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}