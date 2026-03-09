import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { getProductImage } from "@/lib/product-images";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

const CartPage = () => {
  const { cart, updateQty, removeItem, cartTotal, cartCount } = useCart();

  if (cart.length === 0) {
    return (
      <div className="pt-[90px] min-h-[60vh] flex flex-col items-center justify-center px-4">
        <ShoppingBag size={48} className="text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>Your bag is empty</h2>
        <p className="text-muted-foreground mb-6">Add some beautiful pieces to your collection</p>
        <Link to="/collection" className="bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-[75px] md:pt-[90px] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: "var(--font-display)" }}>Shopping Bag ({cartCount})</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="flex gap-4 bg-card border border-border rounded-xl p-4">
                <Link to={`/product/${item.slug}`} className="w-24 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-secondary">
                  <img src={getProductImage(item.imageUrl)} alt={item.name} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.slug}`} className="font-semibold text-sm hover:text-accent transition-colors line-clamp-1">{item.name}</Link>
                  <p className="text-xs text-muted-foreground mt-1">Size: {item.size}</p>
                  <p className="font-bold text-accent mt-2">₹{item.price.toLocaleString()}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 border border-input rounded-lg">
                      <button onClick={() => updateQty(item.productId, item.size, -1)} className="p-2 hover:bg-muted transition-colors"><Minus size={14} /></button>
                      <span className="text-sm font-medium w-6 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.productId, item.size, 1)} className="p-2 hover:bg-muted transition-colors"><Plus size={14} /></button>
                    </div>
                    <button onClick={() => removeItem(item.productId, item.size)} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl p-6 h-fit sticky top-24">
            <h3 className="font-bold text-lg mb-4" style={{ fontFamily: "var(--font-display)" }}>Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{cartTotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="text-green-600">Free</span></div>
              <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold text-base">
                <span>Total</span><span className="text-accent">₹{cartTotal.toLocaleString()}</span>
              </div>
            </div>
            <Link to="/checkout" className="block w-full text-center bg-primary text-primary-foreground py-3 rounded-full text-sm font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors mt-6">
              Proceed to Checkout
            </Link>
            <Link to="/collection" className="block text-center text-accent text-sm mt-3 hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
