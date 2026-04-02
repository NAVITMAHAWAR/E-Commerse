import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(
    JSON.parse(localStorage.getItem("cartItems")) || [],
  );
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, qty) => {
    const existItem = cartItems.find((x) => x.product === product._id);
    if (existItem) {
      setCartItems(
        cartItems.map((x) =>
          x.product === existItem.product ? { ...x, qty } : x,
        ),
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          product: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          countInStock: product.countInStock,
          qty,
        },
      ]);
    }
  };

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter((x) => x.product !== id));
  };

  const increaseQty = (id) => {
    setCartItems(
      cartItems.map((item) =>
        item.product === id ? { ...item, qty: item.qty + 1 } : item,
      ),
    );
  };

  const decreaseQty = (id) => {
    setCartItems(
      cartItems.map((item) =>
        item.product === id && item.qty > 1
          ? { ...item, qty: item.qty - 1 }
          : item,
      ),
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setDiscount(0);
  };

  const applyPromoCode = (code) => {
    if (code === "DISCOUNT10") {
      setDiscount(0.1);
      return { success: true, message: "10% discount apply ho gaya!" };
    }
    setDiscount(0);
    return { success: false, message: "Invalid promo code." };
  };

  const calculateShipping = (totalPrice) => (totalPrice > 500 ? 0 : 50);

  const clearCarts = () => {
    setCartItems([]);
    localStorage.removeItem("cartItems");
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        discount,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        clearCart,
        applyPromoCode,
        calculateShipping,
        clearCarts,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
// export default useCart;
