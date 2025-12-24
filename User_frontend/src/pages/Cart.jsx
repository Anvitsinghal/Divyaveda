import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.product_id?.price || 0;
      return total + price * item.quantity;
    }, 0);
  };

  if (!cart) return <div className="p-10 text-center">Loading Cart...</div>;
  if (cart.length === 0)
    return (
      <div className="p-10 text-center space-y-4">
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-500"
        >
          Start shopping
        </button>
      </div>
    );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Shopping cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {cart.map(item => (
            <div
              key={item._id}
              className="flex flex-col sm:flex-row gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4"
            >
              <div className="w-full sm:w-28 h-28 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 text-xs">
                {item.product_id?.main_image ? (
                  <img
                    src={item.product_id.main_image}
                    alt={item.product_id.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  "Image"
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-white">{item.product_id?.name}</div>
                    <div className="text-slate-400 text-sm">
                      ${item.product_id?.price} • Qty {item.quantity}
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-red-400 text-sm hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-full border border-slate-700 bg-slate-800">
                    <button
                      className="px-3 py-1 text-white"
                      onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                    >
                      -
                    </button>
                    <span className="px-4 text-white">{item.quantity}</span>
                    <button
                      className="px-3 py-1 text-white"
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <div className="text-sm text-slate-400">
                    Subtotal ${(item.product_id?.price || 0) * item.quantity}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit">
          <h2 className="text-xl font-bold mb-4 text-white">Summary</h2>
          <div className="flex justify-between text-sm text-slate-300 mb-2">
            <span>Subtotal</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold text-white border-t border-slate-800 pt-3">
            <span>Total</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
          <button
            onClick={() => navigate("/checkout")}
            className="w-full mt-4 bg-blue-600 text-white py-3 rounded-full font-semibold hover:bg-blue-500"
          >
            Proceed to checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;