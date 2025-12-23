import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
const Home = () => {
  // 1. Initialize as empty array
  const [products, setProducts] = useState([]); 
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        console.log("API Response:", response.data); // Inspect this!

        // 2. SAFETY CHECK: Check where the array actually lives
        if (Array.isArray(response.data)) {
            setProducts(response.data);
        } else if (response.data.products && Array.isArray(response.data.products)) {
            setProducts(response.data.products);
        } else {
            console.error("Unexpected data format:", response.data);
            setProducts([]); // Fallback to empty to prevent crash
        }
        
      } catch (err) {
        console.error("Fetch error:", err);
        setError('Failed to load products.');
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Latest Products</h1>
      
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 3. Safe mapping */}
        {products.length === 0 ? (
           <p>No products found</p>
        ) : (
           products.map((product) => (
             <div key={product._id} className="border p-4 rounded shadow hover:shadow-lg transition">
              <Link to={`/product/${product._id}`}>
      <h3 className="font-bold text-lg hover:text-blue-600 cursor-pointer">
        {product.name}
      </h3>
    </Link>
               <h3 className="font-bold text-lg">{product.name}</h3>
               {/* 4. Handle missing price/desc gracefully */}
               <p className="text-gray-600">${product.price || 'N/A'}</p>
               <p className="text-sm text-gray-500 mt-2">{product.description}</p>
               <button className="mt-4 bg-black text-white px-4 py-2 rounded w-full">
                 Add to Cart
               </button>
             </div>
           ))
        )}
      </div>
    </div>
  );
};

export default Home;