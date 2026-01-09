import { useCart } from "../context/CartContext";

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const total = Array.isArray(cart)
    ? cart.reduce((sum, item) => sum + (item.product_id?.price || 0) * item.quantity, 0)
    : 0;

  const handlePlaceOrder = async () => {
    alert("Checkout flow not yet enabled on backend. Cart will be cleared.");
    await clearCart();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <div className="text-slate-300">Review your items before placing the order.</div>
        <div className="bg-slate-800 rounded-xl p-4 space-y-2">
          {Array.isArray(cart) && cart.length > 0 ? (
            cart.map(item => (
              <div key={item._id} className="flex justify-between text-sm text-slate-200">
                <span>{item.product_id?.name}</span>
                <span className="text-slate-100">
                  {item.quantity} x ${item.product_id?.price}
                </span>
              </div>
            ))
          ) : (
            <div className="text-slate-500 text-sm">Cart is empty</div>
          )}
        </div>
        <div className="flex items-center justify-between text-lg font-semibold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <button
          onClick={handlePlaceOrder}
          className="w-full py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-500"
        >
          Place Order
        </button>
      </div>
    </div>
  );
};

export default Checkout;





