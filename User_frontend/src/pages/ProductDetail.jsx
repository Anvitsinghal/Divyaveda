import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart(); // <--- Get the function from context

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false); // <--- UI State for button

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        // Handle if backend returns { product: {...} } or just {...}
        // Also handle the structure if it's nested like response.data.data
        const data = response.data.product || response.data.data || response.data;
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (isAdding) return; // Prevent double clicks
    
    setIsAdding(true);
    // Call the context function which handles the API POST request
    await addToCart(product._id, quantity); 
    setIsAdding(false);
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!product) return <div className="p-10 text-center">Product not found</div>;

  return (
    <div className="container mx-auto p-6">
      <button 
        onClick={() => navigate(-1)}
        className="text-gray-500 mb-4 hover:underline"
      >
        &larr; Back to Products
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left: Image Placeholder */}
        <div className="bg-gray-200 h-96 rounded-lg flex items-center justify-center text-gray-500">
           {/* If you have images later: <img src={product.image} /> */}
           [Image Placeholder]
        </div>

        {/* Right: Details */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-xl text-blue-600 font-semibold mb-4">${product.price || 'N/A'}</p>
          
          <div className="bg-gray-50 p-4 rounded mb-6">
            <h3 className="font-bold mb-2">Description</h3>
            <p className="text-gray-700">{product.description}</p>
          </div>

          {/* Add to Cart Section */}
          <div className="flex items-center gap-4">
             <div className="flex border rounded">
                <button 
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                >-</button>
                <span className="px-4 py-1">{quantity}</span>
                <button 
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                  onClick={() => setQuantity(prev => prev + 1)}
                >+</button>
             </div>
             
             <button 
               onClick={handleAddToCart}
               disabled={isAdding} // Disable while sending request
               className={`px-6 py-2 rounded flex-1 text-white transition
                 ${isAdding ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'}
               `}
             >
               {isAdding ? 'Adding...' : 'Add to Cart'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;