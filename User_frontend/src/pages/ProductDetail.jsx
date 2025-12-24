import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        const data = response.data.product || response.data.data || response.data;
        setProduct(data);
      } catch (err) {
        setError("Unable to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (isAdding) return;
    setIsAdding(true);
    await addToCart(product._id, quantity);
    setIsAdding(false);
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!product) return <div className="p-10 text-center">Product not found</div>;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white text-sm">
        Back
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-slate-900 border border-slate-800 h-96 rounded-2xl flex items-center justify-center overflow-hidden">
          {product.main_image ? (
            <img src={product.main_image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="text-slate-600 text-sm">No image</div>
          )}
        </div>
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{product.name}</h1>
            <p className="text-xl text-blue-400 font-semibold">${product.price || "N/A"}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="text-sm text-slate-300">{product.description}</div>
            {product.advantages && (
              <div className="text-sm text-slate-400">Advantages: {product.advantages}</div>
            )}
            {product.volume && <div className="text-sm text-slate-400">Volume: {product.volume}</div>}
            {product.stock_quantity !== undefined && (
              <div className="text-sm text-slate-400">Stock: {product.stock_quantity}</div>
            )}
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <div className="flex items-center gap-4">
            <div className="flex items-center rounded-full border border-slate-700 bg-slate-900">
              <button
                className="px-3 py-2 text-white"
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
              >
                -
              </button>
              <span className="px-4 text-white">{quantity}</span>
              <button className="px-3 py-2 text-white" onClick={() => setQuantity(prev => prev + 1)}>
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`px-6 py-3 rounded-full font-semibold transition ${
                isAdding ? "bg-slate-700 text-slate-300" : "bg-blue-600 text-white hover:bg-blue-500"
              }`}
            >
              {isAdding ? "Adding..." : "Add to cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;