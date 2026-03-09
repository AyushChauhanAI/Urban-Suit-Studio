import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getProductImage } from "@/lib/product-images";
import { LogOut, Package, Heart, MapPin, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Order {
  id: string;
  total: number;
  order_status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
}

interface WishlistItem {
  id: string;
  product_id: string;
  products: { name: string; slug: string; price: number; image_url: string | null } | null;
}

const Account = () => {
  const { user, loading: authLoading, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"orders" | "wishlist">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const [ordersRes, wishRes] = await Promise.all([
        supabase.from("orders").select("id, total, order_status, payment_status, payment_method, created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("wishlist").select("id, product_id, products(name, slug, price, image_url)").eq("user_id", user.id),
      ]);
      setOrders(ordersRes.data || []);
      setWishlist((wishRes.data as any) || []);
      setLoading(false);
    };
    load();
  }, [user]);

  if (authLoading || !user) return null;

  const statusColor = (s: string) => {
    if (s.includes("confirmed") || s.includes("delivered")) return "text-green-600 bg-green-50";
    if (s.includes("pending")) return "text-yellow-600 bg-yellow-50";
    if (s.includes("cancelled")) return "text-destructive bg-red-50";
    return "text-muted-foreground bg-muted";
  };

  return (
    <div className="pt-[75px] md:pt-[90px] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>My Account</h1>
            <p className="text-muted-foreground text-sm mt-1">{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link to="/admin" className="text-sm bg-accent text-accent-foreground px-4 py-2 rounded-full font-medium hover:opacity-90">
                Admin Panel
              </Link>
            )}
            <button onClick={signOut} className="flex items-center gap-1 text-sm text-destructive hover:underline">
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-border mb-6">
          {[
            { key: "orders" as const, label: "My Orders", icon: Package },
            { key: "wishlist" as const, label: "Wishlist", icon: Heart },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
        ) : tab === "orders" ? (
          orders.length === 0 ? (
            <div className="text-center py-12">
              <Package size={40} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No orders yet</p>
              <Link to="/collection" className="text-accent text-sm hover:underline mt-2 inline-block">Start Shopping</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(o => (
                <div key={o.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Order #{o.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(o.created_at).toLocaleDateString()} · {o.payment_method.toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-accent">₹{o.total.toLocaleString()}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor(o.order_status)}`}>
                      {o.order_status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          wishlist.length === 0 ? (
            <div className="text-center py-12">
              <Heart size={40} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Your wishlist is empty</p>
              <Link to="/collection" className="text-accent text-sm hover:underline mt-2 inline-block">Explore Collection</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {wishlist.map(w => w.products && (
                <Link key={w.id} to={`/product/${w.products.slug}`}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-[3/4] bg-secondary">
                    <img src={getProductImage(w.products.image_url)} alt={w.products.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium line-clamp-1">{w.products.name}</p>
                    <p className="text-accent font-bold text-sm mt-1">₹{w.products.price.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Account;
