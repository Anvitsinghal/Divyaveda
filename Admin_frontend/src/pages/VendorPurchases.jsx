import { useEffect, useState } from "react";
import api from "../api/axios";
import PermissionGate from "../components/PermissionGate";

const VendorPurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [materials, setMaterials] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    vendor_id: "",
    material_id: "",
    quantity: "",
    bill_no: "",
    payment_status: "Pending" // Default
  });

  // File Handling State
  const [billFile, setBillFile] = useState(null); // For new uploads
  const [existingBillUrl, setExistingBillUrl] = useState(""); // For editing existing

  const safeExtract = (res, key) => res.data[key] || res.data || [];

  // 1. Fetch Data
  const loadData = async () => {
    try {
      const [pRes, vRes, mRes] = await Promise.all([
        api.get("/admin/vendor-purchases"),
        api.get("/admin/vendors"),
        api.get("/admin/raw-materials")
      ]);
      
      setPurchases(safeExtract(pRes, "purchases") || safeExtract(pRes, "data"));
      setVendors(safeExtract(vRes, "vendors") || safeExtract(vRes, "data"));
      setMaterials(safeExtract(mRes, "rawMaterials") || safeExtract(mRes, "data")); // Check specific key from your backend
      setError("");
    } catch (e) {
      setError("Failed to load purchase data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 2. Handle Submit (FormData for File Upload)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    const data = new FormData();
    data.append("vendor_id", formData.vendor_id);
    data.append("material_id", formData.material_id);
    data.append("quantity", formData.quantity);
    data.append("bill_no", formData.bill_no);
    data.append("payment_status", formData.payment_status);
    
    // Append File if a new one is selected
    if (billFile) {
      data.append("bill_image", billFile);
    }

    try {
      const config = { headers: { "Content-Type": "multipart/form-data" } };

      if (editingId) {
        await api.put(`/admin/vendor-purchases/${editingId}`, data, config);
        alert("Purchase Record Updated!");
      } else {
        await api.post("/admin/vendor-purchases", data, config);
        alert("Purchase Recorded Successfully!");
      }

      setIsModalOpen(false);
      resetForm();
      loadData();
    } catch (e) {
      setError(e.response?.data?.message || "Operation failed");
    }
  };

  // 3. Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this purchase record?")) return;
    try {
      await api.delete(`/admin/vendor-purchases/${id}`);
      loadData();
    } catch (e) {
      alert("Failed to delete record");
    }
  };

  // Helpers
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setBillFile(e.target.files[0]);
    }
  };

  const openEditModal = (item) => {
    setEditingId(item._id);
    setFormData({
      vendor_id: item.vendor_id?._id || item.vendor_id || "",
      material_id: item.material_id?._id || item.material_id || "",
      quantity: item.quantity,
      bill_no: item.bill_no || "",
      payment_status: item.payment_status || "Pending"
    });
    setExistingBillUrl(item.bill_image || "");
    setBillFile(null);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      vendor_id: "", material_id: "", quantity: "", bill_no: "", payment_status: "Pending"
    });
    setBillFile(null);
    setExistingBillUrl("");
    setError("");
  };

  if (loading) return <div className="p-6 text-slate-400">Loading Records...</div>;

  return (
    <PermissionGate routeName="VENDOR_PURCHASE_VIEW">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Vendor Purchases</h1>
          <PermissionGate routeName="VENDOR_PURCHASE_CREATE">
            <button 
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium"
            >
              + Record Purchase
            </button>
          </PermissionGate>
        </div>

        {error && <div className="text-red-400 text-sm">{error}</div>}

        {/* DATA TABLE */}
        <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-slate-200 uppercase font-medium">
              <tr>
                <th className="p-4">Date / Bill</th>
                <th className="p-4">Vendor</th>
                <th className="p-4">Material</th>
                <th className="p-4">Qty</th>
                <th className="p-4">Bill Img</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchases.length === 0 ? (
                <tr><td colSpan="7" className="p-6 text-center text-slate-500">No purchases found.</td></tr>
              ) : purchases.map((p) => (
                <tr key={p._id} className="border-t border-slate-800 hover:bg-slate-800/50">
                  <td className="p-4">
                    <div className="text-white font-medium">{p.bill_no || "N/A"}</div>
                    <div className="text-xs text-slate-500">
                      {new Date(p.createdAt || Date.now()).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4">{p.vendor_id?.name || "Unknown Vendor"}</td>
                  <td className="p-4 text-blue-300">{p.material_id?.name || "Unknown Material"}</td>
                  <td className="p-4 font-bold">{p.quantity} <span className="text-xs font-normal text-slate-500">{p.material_id?.unit}</span></td>
                  <td className="p-4">
                    {p.bill_image ? (
                      <a href={p.bill_image} target="_blank" rel="noreferrer" className="block w-10 h-10 rounded overflow-hidden border border-slate-700 hover:border-blue-500">
                        <img src={p.bill_image} alt="Bill" className="w-full h-full object-cover" />
                      </a>
                    ) : <span className="text-xs text-slate-600">No Img</span>}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs border ${
                      p.payment_status === "Paid" 
                        ? "bg-green-900/30 text-green-400 border-green-800" 
                        : "bg-yellow-900/30 text-yellow-400 border-yellow-800"
                    }`}>
                      {p.payment_status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-3">
                    <PermissionGate routeName="VENDOR_PURCHASE_UPDATE">
                      <button onClick={() => openEditModal(p)} className="text-blue-400 hover:text-blue-300">Edit</button>
                    </PermissionGate>
                    <PermissionGate routeName="VENDOR_PURCHASE_DELETE">
                      <button onClick={() => handleDelete(p._id)} className="text-red-400 hover:text-red-300">Delete</button>
                    </PermissionGate>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-6">
                {editingId ? "Edit Purchase Record" : "New Vendor Purchase"}
              </h2>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Select Vendor</label>
                    <select
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                      value={formData.vendor_id}
                      onChange={e => setFormData({ ...formData, vendor_id: e.target.value })}
                      required
                    >
                      <option value="">-- Choose Vendor --</option>
                      {vendors.map(v => (
                        <option key={v._id} value={v._id}>{v.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Select Material</label>
                    <select
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                      value={formData.material_id}
                      onChange={e => setFormData({ ...formData, material_id: e.target.value })}
                      required
                    >
                      <option value="">-- Choose Material --</option>
                      {materials.map(m => (
                        <option key={m._id} value={m._id}>{m.name} ({m.unit})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Quantity</label>
                      <input
                        type="number"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                        value={formData.quantity}
                        onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Bill No</label>
                      <input
                        type="text"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                        value={formData.bill_no}
                        onChange={e => setFormData({ ...formData, bill_no: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Payment Status</label>
                    <select
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                      value={formData.payment_status}
                      onChange={e => setFormData({ ...formData, payment_status: e.target.value })}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Partial">Partial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Bill Image</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                    />
                    
                    {/* Preview Area */}
                    <div className="mt-2 h-32 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
                       {billFile ? (
                         <img src={URL.createObjectURL(billFile)} alt="Preview" className="h-full object-contain" />
                       ) : existingBillUrl ? (
                         <img src={existingBillUrl} alt="Existing" className="h-full object-contain opacity-70" />
                       ) : (
                         <span className="text-xs text-slate-600">No image selected</span>
                       )}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 flex gap-3 pt-4 border-t border-slate-800">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500"
                  >
                    {editingId ? "Update Record" : "Save Record"}
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

export default VendorPurchases;