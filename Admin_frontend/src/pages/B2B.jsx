import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import PermissionGate from "../components/PermissionGate";

const B2B = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchParams] = useSearchParams();

  /* ================= CREATE FORM ================= */
  const leadFromURL = searchParams.get("lead") || "";

  const [createForm, setCreateForm] = useState({
    order_date: "",
    order_details: "",
    total_order_value: "",
    amount_received: "",
    last_receipt_date: "",
    order_status: "OPEN",
    additional_remarks: "",
  });

  /* ================= EDIT FORM ================= */
  const [formData, setFormData] = useState({
    order_date: "",
    order_details: "",
    total_order_value: 0,
    amount_received: 0,
    last_receipt_date: "",
    order_status: "OPEN",
    additional_remarks: "",
  });

  /* ================= LOAD DATA ================= */
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/b2b");
      const leadId = searchParams.get("lead");
      let data = res.data?.data || [];
      if (leadId) data = data.filter((r) => r.lead_id?._id === leadId);
      setRecords(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchParams]);

  /* ================= CREATE ================= */
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/b2b", {
        lead_id: leadFromURL,
        ...createForm,
      });

      setCreateForm({
        order_date: "",
        order_details: "",
        total_order_value: "",
        amount_received: "",
        last_receipt_date: "",
        order_status: "OPEN",
        additional_remarks: "",
      });

      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Create failed");
    }
  };

  /* ================= EDIT ================= */
  const openEdit = (rec) => {
    setEditing(rec);
    setFormData({
      order_date: rec.order_date ? rec.order_date.substring(0, 10) : "",
      order_details: rec.order_details || "",
      total_order_value: rec.total_order_value || 0,
      amount_received: rec.amount_received || 0,
      last_receipt_date: rec.last_receipt_date
        ? rec.last_receipt_date.substring(0, 10)
        : "",
      order_status: rec.order_status || "OPEN",
      additional_remarks: rec.additional_remarks || "",
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/b2b/${editing._id}`, formData);
      setIsModalOpen(false);
      setEditing(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">B2B Orders</h1>

      {/* ================= CREATE FORM ================= */}
      {leadFromURL && (
        <PermissionGate routeName="B2B_CREATE">
          <form
            onSubmit={handleCreate}
            className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3"
          >
            <div className="text-sm text-slate-400">
              Creating B2B for Lead:{" "}
              <span className="text-blue-400">{leadFromURL}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="date"
                value={createForm.order_date}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, order_date: e.target.value }))
                }
                placeholder="Order Date"
                className="bg-slate-950 text-white p-2 rounded border border-slate-700"
              />

              <input
                type="date"
                value={createForm.last_receipt_date}
                onChange={(e) =>
                  setCreateForm((p) => ({
                    ...p,
                    last_receipt_date: e.target.value,
                  }))
                }
                placeholder="Last Receipt Date"
                className="bg-slate-950 text-white p-2 rounded border border-slate-700"
              />

              <input
                type="number"
                placeholder="Total Order Value (₹)"
                value={createForm.total_order_value}
                onChange={(e) =>
                  setCreateForm((p) => ({
                    ...p,
                    total_order_value: e.target.value,
                  }))
                }
                className="bg-slate-950 text-white p-2 rounded border border-slate-700"
              />

              <input
                type="number"
                placeholder="Amount Received (₹)"
                value={createForm.amount_received}
                onChange={(e) =>
                  setCreateForm((p) => ({
                    ...p,
                    amount_received: e.target.value,
                  }))
                }
                className="bg-slate-950 text-white p-2 rounded border border-slate-700"
              />

              <input
                placeholder="Order Status (OPEN / CLOSED)"
                value={createForm.order_status}
                onChange={(e) =>
                  setCreateForm((p) => ({
                    ...p,
                    order_status: e.target.value,
                  }))
                }
                className="bg-slate-950 text-white p-2 rounded border border-slate-700"
              />
            </div>

            <textarea
              placeholder="Order details (products, quantity, notes)"
              value={createForm.order_details}
              onChange={(e) =>
                setCreateForm((p) => ({
                  ...p,
                  order_details: e.target.value,
                }))
              }
              className="w-full bg-slate-950 text-white p-2 rounded border border-slate-700"
            />

            <textarea
              placeholder="Additional remarks (optional)"
              value={createForm.additional_remarks}
              onChange={(e) =>
                setCreateForm((p) => ({
                  ...p,
                  additional_remarks: e.target.value,
                }))
              }
              className="w-full bg-slate-950 text-white p-2 rounded border border-slate-700"
            />

            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
            >
              ➕ Create B2B
            </button>
          </form>
        </PermissionGate>
      )}

      {/* ================= TABLE ================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto">
        {loading ? (
          <div className="p-6 text-center text-slate-500">Loading…</div>
        ) : (
          <table className="w-full text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-100">
              <tr>
                <th className="p-3">Sr</th>
                <th className="p-3">Client</th>
                <th className="p-3">Mobile</th>
                <th className="p-3">Email</th>
                <th className="p-3">Company</th>
                <th className="p-3">Total</th>
                <th className="p-3">Received</th>
                <th className="p-3">Pending</th>
                <th className="p-3">Status</th>
                <th className="p-3">Converted By</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id} className="border-t border-slate-800">
                  <td className="p-3">{r.sr_no}</td>
                  <td className="p-3 text-white">{r.client_name}</td>
                  <td className="p-3">{r.mobile}</td>
                  <td className="p-3">{r.email || "-"}</td>
                  <td className="p-3">{r.company || "-"}</td>
                  <td className="p-3">{r.total_order_value}</td>
                  <td className="p-3 text-green-400">{r.amount_received}</td>
                  <td className="p-3 text-yellow-300">{r.amount_pending}</td>
                  <td className="p-3">{r.order_status}</td>
                  <td className="p-3">
                    {r.converted_by?.name || r.converted_by?.email || "-"}
                  </td>
                  <td className="p-3">
                    <PermissionGate routeName="B2B_UPDATE">
                      <button
                        onClick={() => openEdit(r)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Edit
                      </button>
                    </PermissionGate>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ================= EDIT MODAL ================= */}
      {isModalOpen && editing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Edit B2B – {editing.client_name}
            </h2>

            <form onSubmit={handleUpdate} className="space-y-3">
              <textarea
                placeholder="Order details"
                value={formData.order_details}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    order_details: e.target.value,
                  }))
                }
                className="w-full bg-slate-950 p-2 rounded border border-slate-700 text-white"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Total Order Value"
                  value={formData.total_order_value}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      total_order_value: Number(e.target.value),
                    }))
                  }
                  className="bg-slate-950 p-2 rounded border border-slate-700 text-white"
                />
                <input
                  type="number"
                  placeholder="Amount Received"
                  value={formData.amount_received}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      amount_received: Number(e.target.value),
                    }))
                  }
                  className="bg-slate-950 p-2 rounded border border-slate-700 text-white"
                />
              </div>

              <textarea
                placeholder="Additional remarks"
                value={formData.additional_remarks}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    additional_remarks: e.target.value,
                  }))
                }
                className="w-full bg-slate-950 p-2 rounded border border-slate-700 text-white"
              />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 bg-slate-800 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 rounded text-white"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default B2B;
