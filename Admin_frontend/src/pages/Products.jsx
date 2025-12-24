import { useEffect, useState } from "react";
import api from "../api/axios";
import PermissionGate from "../components/PermissionGate";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  // State for text fields
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    subcategory_id: "",
    description: "",
    price: "",
    stock_quantity: 0,
    volume: "",
    is_new_launch: false,
    isActive: true,
    advantages: [] 
  });

  // State for Images
  const [existingMainImage, setExistingMainImage] = useState(""); // URL string (for editing)
  const [newMainImage, setNewMainImage] = useState(null); // File Object (for upload)
  
  const [existingGallery, setExistingGallery] = useState([]); // Array of URL strings
  const [newGalleryFiles, setNewGalleryFiles] = useState([]); // Array of File Objects

  const safeExtract = (res, key) => res.data[key] || res.data || [];

  const loadData = async () => {
    try {
      const [prodRes, catRes, subRes] = await Promise.all([
        api.get("/admin/products"),
        api.get("/admin/categories"),
        api.get("/admin/subcategories")
      ]);
      
      setProducts(safeExtract(prodRes, "products"));
      setCategories(safeExtract(catRes, "categories") || safeExtract(catRes, "data"));
      setSubcategories(safeExtract(subRes, "subCategories") || safeExtract(subRes, "data"));
      setError("");
    } catch (e) {
      setError("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // --- HANDLE SUBMIT WITH FORM DATA (FILES) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Create FormData object
    const data = new FormData();

    // 2. Append Text Fields
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("stock_quantity", formData.stock_quantity);
    data.append("volume", formData.volume);
    data.append("category_id", formData.category_id);
    data.append("subcategory_id", formData.subcategory_id);
    data.append("is_new_launch", formData.is_new_launch);
    data.append("isActive", formData.isActive);

    // 3. Append Arrays (Advantages)
    formData.advantages.forEach((adv) => {
      data.append("advantages[]", adv); // Check how your backend expects arrays
    });

    // 4. Append Main Image
    if (newMainImage) {
      // If user selected a new file from PC
      data.append("main_image", newMainImage); 
    } else if (existingMainImage) {
      // If editing and keeping old URL
      data.append("existing_main_image", existingMainImage);
    }

    // 5. Append Gallery Images
    // A. New Files from PC
    newGalleryFiles.forEach((file) => {
      data.append("images", file); // Field name 'images' must match Multer backend
    });
    // B. Existing URLs (to keep them)
    existingGallery.forEach((url) => {
      data.append("existing_images[]", url);
    });

    try {
      const config = { headers: { "Content-Type": "multipart/form-data" } };

      if (editingId) {
        await api.put(`/admin/products/${editingId}`, data, config);
        alert("Product Updated Successfully!");
      } else {
        await api.post("/admin/products", data, config);
        alert("Product Created Successfully!");
      }
      
      setIsModalOpen(false);
      resetForm();
      loadData();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product permanently?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      loadData();
    } catch (e) {
      alert("Failed to delete product");
    }
  };

  // --- Helpers ---
  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setNewMainImage(file);
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setNewGalleryFiles([...newGalleryFiles, ...files]);
  };

  const removeNewGalleryImage = (index) => {
    setNewGalleryFiles(newGalleryFiles.filter((_, i) => i !== index));
  };

  const removeExistingGalleryImage = (index) => {
    setExistingGallery(existingGallery.filter((_, i) => i !== index));
  };

  // Advantages Helpers
  const addAdvantage = () => setFormData({ ...formData, advantages: [...formData.advantages, ""] });
  const updateAdvantage = (index, val) => {
    const newAdv = [...formData.advantages];
    newAdv[index] = val;
    setFormData({ ...formData, advantages: newAdv });
  };
  const removeAdvantage = (index) => {
    const newAdv = formData.advantages.filter((_, i) => i !== index);
    setFormData({ ...formData, advantages: newAdv });
  };

  const openEditModal = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      category_id: product.category_id?._id || product.category_id || "",
      subcategory_id: product.subcategory_id?._id || product.subcategory_id || "",
      description: product.description || "",
      price: product.price,
      stock_quantity: product.stock_quantity || 0,
      volume: product.volume || "",
      is_new_launch: product.is_new_launch,
      isActive: product.isActive,
      advantages: product.advantages || []
    });
    // Handle Images Separation
    setExistingMainImage(product.main_image || "");
    setExistingGallery(product.images || []);
    setNewMainImage(null);
    setNewGalleryFiles([]);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "", category_id: "", subcategory_id: "", description: "",
      price: "", stock_quantity: 0, volume: "", is_new_launch: false,
      isActive: true, advantages: []
    });
    setExistingMainImage("");
    setExistingGallery([]);
    setNewMainImage(null);
    setNewGalleryFiles([]);
  };

  if (loading) return <div className="p-6 text-slate-400">Loading Inventory...</div>;

  return (
    <PermissionGate routeName="PRODUCT_VIEW">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Product Inventory</h1>
          <PermissionGate routeName="PRODUCT_CREATE">
            <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium">
              + Add Product
            </button>
          </PermissionGate>
        </div>

        {error && <div className="text-red-400 text-sm">{error}</div>}

        {/* PRODUCTS TABLE */}
        <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-slate-200 uppercase font-medium">
              <tr>
                <th className="p-4">Image</th>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan="7" className="p-6 text-center text-slate-500">No products found.</td></tr>
              ) : products.map((p) => (
                <tr key={p._id} className="border-t border-slate-800 hover:bg-slate-800/50">
                   <td className="p-4">
                    {/* Small Thumbnail in Table */}
                    {p.main_image ? (
                        <img src={p.main_image} alt="" className="w-10 h-10 object-cover rounded bg-slate-800" />
                    ) : <div className="w-10 h-10 bg-slate-800 rounded"></div>}
                   </td>
                  <td className="p-4">
                    <div className="font-medium text-white">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.volume}</div>
                  </td>
                  <td className="p-4">
                    {p.category_id?.name || "Uncategorized"} 
                    <span className="text-slate-600"> / </span>
                    {p.subcategory_id?.name}
                  </td>
                  <td className="p-4 text-green-400 font-bold">${p.price}</td>
                  <td className="p-4">
                    <span className={p.stock_quantity < 10 ? "text-red-400 font-bold" : "text-slate-300"}>
                      {p.stock_quantity}
                    </span>
                  </td>
                  <td className="p-4">
                    {p.is_new_launch && <span className="text-xs bg-purple-900 text-purple-300 px-2 py-0.5 rounded mr-2">New</span>}
                    <span className={`text-xs px-2 py-0.5 rounded ${p.isActive ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-3">
                    <PermissionGate routeName="PRODUCT_UPDATE">
                      <button onClick={() => openEditModal(p)} className="text-blue-400 hover:text-blue-300">Edit</button>
                    </PermissionGate>
                    <PermissionGate routeName="PRODUCT_DELETE">
                      <button onClick={() => handleDelete(p._id)} className="text-red-400 hover:text-red-300">Delete</button>
                    </PermissionGate>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL (Create/Edit) */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-6 border-b border-slate-800 pb-2">
                {editingId ? "Edit Product" : "New Product"}
              </h2>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* --- LEFT COLUMN: Basic Info --- */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Product Name</label>
                    <input className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Category</label>
                      <select className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                        value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} required>
                        <option value="">Select...</option>
                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Subcategory</label>
                      <select className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                        value={formData.subcategory_id} onChange={e => setFormData({...formData, subcategory_id: e.target.value})} required>
                        <option value="">Select...</option>
                        {subcategories
                          .filter(s => !formData.category_id || s.category_id === formData.category_id || s.category_id?._id === formData.category_id)
                          .map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Description</label>
                    <textarea className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white" rows="3"
                      value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Price ($)</label>
                      <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                        value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Stock Qty</label>
                      <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                        value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Volume</label>
                      <input type="text" placeholder="e.g. 500ml" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                        value={formData.volume} onChange={e => setFormData({...formData, volume: e.target.value})} />
                    </div>
                  </div>

                  <div className="flex gap-6 pt-2">
                    <label className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer">
                      <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="rounded bg-slate-800" />
                      Active
                    </label>
                    <label className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer">
                      <input type="checkbox" checked={formData.is_new_launch} onChange={e => setFormData({...formData, is_new_launch: e.target.checked})} className="rounded bg-slate-800" />
                      New Launch
                    </label>
                  </div>
                </div>

                {/* --- RIGHT COLUMN: Image Uploads --- */}
                <div className="space-y-4">
                  
                  {/* MAIN IMAGE UPLOAD */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Main Image</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleMainImageChange}
                      className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-600 file:text-white
                        hover:file:bg-blue-500
                        cursor-pointer"
                    />
                    {/* Preview Area */}
                    <div className="mt-2">
                        {newMainImage ? (
                            <img src={URL.createObjectURL(newMainImage)} alt="Preview" className="h-32 w-full object-cover rounded border border-blue-500" />
                        ) : existingMainImage ? (
                            <img src={existingMainImage} alt="Existing" className="h-32 w-full object-cover rounded border border-slate-700 opacity-70" />
                        ) : null}
                    </div>
                  </div>

                  {/* GALLERY UPLOAD */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Gallery Images</label>
                    <input 
                      type="file" 
                      multiple
                      accept="image/*"
                      onChange={handleGalleryChange}
                      className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-slate-700 file:text-white
                        hover:file:bg-slate-600
                        cursor-pointer"
                    />
                    
                    {/* Previews Grid */}
                    <div className="mt-2 grid grid-cols-3 gap-2">
                        {/* 1. Existing URLs */}
                        {existingGallery.map((url, idx) => (
                            <div key={`exist-${idx}`} className="relative group">
                                <img src={url} alt="" className="h-20 w-full object-cover rounded border border-slate-700" />
                                <button type="button" onClick={() => removeExistingGalleryImage(idx)} 
                                    className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">×</button>
                            </div>
                        ))}
                        {/* 2. New Files */}
                        {newGalleryFiles.map((file, idx) => (
                            <div key={`new-${idx}`} className="relative group">
                                <img src={URL.createObjectURL(file)} alt="" className="h-20 w-full object-cover rounded border border-blue-500" />
                                <button type="button" onClick={() => removeNewGalleryImage(idx)} 
                                    className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                            </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Product Advantages</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                      {formData.advantages.map((adv, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input type="text" value={adv} onChange={e => updateAdvantage(idx, e.target.value)}
                            className="flex-1 bg-slate-950 border border-slate-700 rounded p-1.5 text-white text-xs" placeholder="e.g. Organic, Sugar-free" />
                          <button type="button" onClick={() => removeAdvantage(idx)} className="text-red-400 px-2 hover:bg-red-900/20 rounded">×</button>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={addAdvantage} className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                      + Add Advantage
                    </button>
                  </div>
                </div>

                {/* --- FOOTER BUTTONS --- */}
                <div className="md:col-span-2 border-t border-slate-800 pt-6 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 rounded bg-slate-800 text-slate-300 hover:bg-slate-700">Cancel</button>
                  <button type="submit" className="flex-1 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-500 shadow-lg">
                    {editingId ? "Update Product" : "Create Product"}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}
      </div>
    </PermissionGate>
  );
};

export default Products;