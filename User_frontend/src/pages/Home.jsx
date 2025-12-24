import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        if (Array.isArray(response.data)) {
          setProducts(response.data);
        } else if (Array.isArray(response.data.products)) {
          setProducts(response.data.products);
        } else {
          setProducts([]);
        }
      } catch (err) {
        setError("Failed to load products.");
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="space-y-10">
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-10 shadow-2xl">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-100">New season</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white">Luxury drops, crafted for you.</h1>
          <p className="text-blue-50 text-lg">
            Discover premium products curated with care. Shop the latest arrivals and elevate your cart in one click.
          </p>
          <div className="flex gap-3">
            <Link
              to="/"
              className="px-5 py-3 bg-white text-slate-900 rounded-full font-semibold shadow hover:translate-y-0.5 transition"
            >
              Shop now
            </Link>
            <Link
              to="/cart"
              className="px-5 py-3 border border-white/60 text-white rounded-full font-semibold hover:bg-white/10"
            >
              View cart
            </Link>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Featured products</h2>
        <div className="text-sm text-slate-400">Total {products.length}</div>
      </div>

      {error && <p className="text-red-400">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.length === 0 ? (
          <p className="text-slate-400">No products found</p>
        ) : (
          products.map(product => (
            <Link
              to={`/product/${product._id}`}
              key={product._id}
              className="group bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg hover:-translate-y-1 transition"
            >
              <div className="aspect-square rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 text-sm">
                {product.main_image ? <img src={product.main_image} alt={product.name} className="w-full h-full object-cover rounded-xl" /> : "Image"}
              </div>
              <div className="mt-4 space-y-1">
                <div className="text-slate-200 font-semibold group-hover:text-white">{product.name}</div>
                <div className="text-slate-400 text-sm line-clamp-2">{product.description}</div>
                <div className="text-lg font-bold text-blue-400">${product.price || "N/A"}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;