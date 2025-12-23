import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cart, removeFromCart } = useCart();
  const navigate = useNavigate();

  // 1. Calculate Total (Defensive coding in case backend doesn't send it)
  // We assume cart.items is the array. Adjust if your backend uses cart.products
  const cartItems = cart?.items || []; 
  
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
        // item.product might be populated, or it might be item.productId
        const price = item.product?.price || 0; 
        return total + (price * item.quantity);
    }, 0);
  };

  if (!cart) return <div className="p-10 text-center">Loading Cart...</div>;
  if (cartItems.length === 0) return (
    <div className="p-10 text-center">
        <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
        <button 
           onClick={() => navigate('/')}
           className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
        >
           Start Shopping
        </button>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* LEFT: Cart Items List */}
        <div className="flex-1">
           {cartItems.map((item) => (
             <div key={item._id} className="flex gap-4 border-b py-4">
                {/* Image Placeholder */}
                <div className="w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">
                    [Image]
                </div>
                
                {/* Details */}
                <div className="flex-1">
                   <h3 className="font-bold text-lg">{item.product?.name || 'Unknown Product'}</h3>
                   <p className="text-gray-600">Qty: {item.quantity}</p>
                   <p className="text-blue-600 font-semibold">${item.product?.price}</p>
                </div>

                {/* Remove Button */}
                <button 
                  onClick={() => removeFromCart(item.product._id)} // OR item._id depending on backend logic
                  className="text-red-500 hover:text-red-700 self-start"
                >
                  Remove
                </button>
             </div>
           ))}
        </div>

        {/* RIGHT: Summary */}
        <div className="w-full md:w-80 h-fit bg-gray-50 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">Summary</h2>
            
            <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${calculateTotal().toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between mb-6 font-bold text-lg border-t pt-2">
                <span>Total</span>
                <span>${calculateTotal().toFixed(2)}</span>
            </div>

            <button 
               onClick={() => navigate('/checkout')}
               className="w-full bg-black text-white py-3 rounded font-bold hover:bg-gray-800"
            >
               Proceed to Checkout
            </button>
        </div>

      </div>
    </div>
  );
};

export default Cart;