import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Package, ShoppingBag, Plus, Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  stock_quantity: number;
  is_active: boolean;
  tag: string | null;
}

interface Order {
  id: string;
  total: number;
  order_status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
}

const Admin = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"products" | "orders">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", slug: "", price: "", category: "Kurta", description: "", fabric: "", tag: "", stock_quantity: "10", image_url: "", is_active: true
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate("/");
  }, [user, isAdmin, authLoading]);

  useEffect(() => {
    if (!isAdmin) return;
    loadData();
  }, [isAdmin, tab]);

  const loadData = async () => {
    setLoading(true);
    if (tab === "products") {
      const { data } = await supabase.from("products").select("id, name, slug, price, category, stock_quantity, is_active, tag").order("created_at", { ascending: false });
      setProducts(data || []);
    } else {
      const { data } = await supabase.from("orders").select("id, total, order_status, payment_status, payment_method, created_at").order("created_at", { ascending: false });
      setOrders(data || []);
    }
    setLoading(false);
  };

  const handleSaveProduct = async () => {
    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const productData = {
      name: form.name,
      slug,
      price: parseFloat(form.price),
      category: form.category,
      description: form.description || null,
      fabric: form.fabric || null,
      tag: form.tag || null,
      stock_quantity: parseInt(form.stock_quantity),
      image_url: form.image_url || null,
      is_active: form.is_active,
    };

    if (editingProduct) {
      await supabase.from("products").update(productData).eq("id", editingProduct.id);
      toast({ title: "Product updated!" });
    } else {
      await supabase.from("products").insert(productData);
      toast({ title: "Product added!" });
    }
    setShowForm(false);
    setEditingProduct(null);
    resetForm();
    loadData();
  };

  const resetForm = () => setForm({ name: "", slug: "", price: "", category: "Kurta", description: "", fabric: "", tag: "", stock_quantity: "10", image_url: "", is_active: true });

  const deleteProduct = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    toast({ title: "Product deleted" });
    loadData();
  };

  const toggleActive = async (p: Product) => {
    await supabase.from("products").update({ is_active: !p.is_active }).eq("id", p.id);
    toast({ title: p.is_active ? "Product disabled" : "Product enabled" });
    loadData();
  };

  const toggleBestseller = async (p: Product) => {
    const newTag = p.tag === "Bestseller" ? null : "Bestseller";
    await supabase.from("products").update({ tag: newTag }).eq("id", p.id);
    toast({ title: newTag ? "Marked as Bestseller" : "Bestseller removed" });
    loadData();
  };

  const updateOrderStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ order_status: status }).eq("id", id);
    toast({ title: `Order ${status.replace(/_/g, " ")}` });
    loadData();
  };

  if (authLoading || !isAdmin) return null;

  return (
    <div className="pt-[75px] md:pt-[90px] min-h-screen bg-secondary/20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: "var(--font-display)" }}>Admin Dashboard</h1>

        <div className="flex gap-4 border-b border-border mb-6">
          {[
            { key: "products" as const, label: "Products", icon: ShoppingBag },
            { key: "orders" as const, label: "Orders", icon: Package },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {tab === "products" && (
          <>
            <div className="flex justify-end mb-4">
              <button onClick={() => { setShowForm(true); setEditingProduct(null); resetForm(); }}
                className="flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">
                <Plus size={16} /> Add Product
              </button>
            </div>

            {showForm && (
              <div className="bg-card border border-border rounded-xl p-6 mb-6">
                <h3 className="font-bold text-lg mb-4">{editingProduct ? "Edit Product" : "Add Product"}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: "name", label: "Name" },
                    { key: "slug", label: "Slug (auto-generated)" },
                    { key: "price", label: "Price (₹)", type: "number" },
                    { key: "category", label: "Category" },
                    { key: "fabric", label: "Fabric" },
                    { key: "stock_quantity", label: "Stock Quantity", type: "number" },
                    { key: "image_url", label: "Image URL" },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-sm font-medium mb-1 block">{f.label}</label>
                      <input type={f.type || "text"} value={form[f.key as keyof typeof form] as string}
                        onChange={(e) => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                  ))}
                  <div>
                    <label className="text-sm font-medium mb-1 block">Tag</label>
                    <select value={form.tag} onChange={(e) => setForm(p => ({ ...p, tag: e.target.value }))}
                      className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="">None</option>
                      <option value="Bestseller">Bestseller</option>
                      <option value="New">New</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-1 block">Description</label>
                    <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px]" />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium">Active (visible on site)</label>
                    <button onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
                      className={`w-10 h-6 rounded-full transition-colors duration-300 ${form.is_active ? 'bg-accent' : 'bg-muted'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${form.is_active ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={handleSaveProduct} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium">Save</button>
                  <button onClick={() => { setShowForm(false); setEditingProduct(null); }} className="bg-secondary text-foreground px-6 py-2 rounded-lg text-sm font-medium">Cancel</button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="text-left p-3 font-medium">Product</th>
                      <th className="text-left p-3 font-medium hidden md:table-cell">Category</th>
                      <th className="text-left p-3 font-medium">Price</th>
                      <th className="text-left p-3 font-medium hidden md:table-cell">Stock</th>
                      <th className="text-left p-3 font-medium hidden md:table-cell">Status</th>
                      <th className="text-right p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className={`border-t border-border ${!p.is_active ? 'opacity-50' : ''}`}>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{p.name}</span>
                            {p.tag === "Bestseller" && <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">★</span>}
                          </div>
                        </td>
                        <td className="p-3 hidden md:table-cell text-muted-foreground">{p.category}</td>
                        <td className="p-3">₹{p.price.toLocaleString()}</td>
                        <td className="p-3 hidden md:table-cell">
                          <span className={p.stock_quantity <= 5 ? 'text-accent font-medium' : ''}>{p.stock_quantity}</span>
                        </td>
                        <td className="p-3 hidden md:table-cell">
                          <button onClick={() => toggleActive(p)}
                            className={`text-xs px-2 py-1 rounded-full ${p.is_active ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'}`}>
                            {p.is_active ? "Active" : "Hidden"}
                          </button>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button onClick={() => toggleBestseller(p)} className="text-accent hover:underline text-xs" title="Toggle Bestseller">★</button>
                          <button onClick={() => {
                            setEditingProduct(p);
                            setForm({ name: p.name, slug: p.slug, price: String(p.price), category: p.category, description: "", fabric: "", tag: p.tag || "", stock_quantity: String(p.stock_quantity), image_url: "", is_active: p.is_active });
                            setShowForm(true);
                          }} className="text-accent hover:underline"><Pencil size={14} /></button>
                          <button onClick={() => deleteProduct(p.id)} className="text-destructive hover:underline"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {tab === "orders" && (
          loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
          ) : orders.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {orders.map(o => (
                <div key={o.id} className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Order #{o.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()} · ₹{o.total.toLocaleString()} · {o.payment_method}</p>
                  </div>
                  <select value={o.order_status} onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                    className="text-xs border border-input rounded-lg px-2 py-1 bg-background">
                    <option value="pending_verification">Pending Verification</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Admin;
