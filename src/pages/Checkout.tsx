import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getProductImage } from "@/lib/product-images";
import paymentQr from "@/assets/payment-qr.jpeg";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

const addressSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(100),
  age: z.string().trim().min(1, "Age is required").regex(/^\d+$/, "Must be a valid number"),
  phone: z.string().trim().min(10, "Valid phone required").max(15),
  address_line1: z.string().trim().min(1, "Address is required").max(200),
  address_line2: z.string().max(200).optional(),
  city: z.string().trim().min(1, "City is required").max(100),
  state: z.string().trim().min(1, "State is required").max(100),
  pincode: z.string().trim().min(6, "Valid pincode required").max(10),
});

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<"address" | "payment" | "done">("address");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "cod">("upi");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: "", age: "", phone: "", address_line1: "", address_line2: "", city: "", state: "", pincode: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (cart.length === 0 && step !== "done") {
    navigate("/cart");
    return null;
  }

  const finalTotal = cartTotal - discount;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    const { data } = await supabase.from("coupons").select("*").eq("code", couponCode.trim().toUpperCase()).eq("is_active", true).maybeSingle();
    if (data && cartTotal >= (data.min_order || 0)) {
      const disc = Math.round(cartTotal * (data.discount_percent as number) / 100);
      setDiscount(disc);
      toast({ title: `Coupon applied! ₹${disc} off` });
    } else {
      toast({ title: "Invalid coupon code", variant: "destructive" });
    }
  };

  const handlePlaceOrder = async () => {
    const result = addressSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(e => { fieldErrors[e.path[0] as string] = e.message; });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 800));

      clearCart();

      if (paymentMethod === "upi") {
        setStep("payment");
      } else {
        setStep("done");
        toast({ title: "Order placed successfully! 🎉" });
      }
    } catch {
      toast({ title: "Failed to place order", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "done") {
    return (
      <div className="pt-[90px] min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>Order Placed!</h2>
        <p className="text-muted-foreground mb-6">Thank you for shopping with Urban Suit Studio</p>
        <button onClick={() => navigate("/account")} className="bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-semibold">
          View Orders
        </button>
      </div>
    );
  }

  if (step === "payment") {
    return (
      <div className="pt-[90px] min-h-screen flex items-center justify-center px-4">
        <div className="bg-card border border-border rounded-2xl max-w-md w-full p-8 text-center">
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>Complete Payment</h2>
          <p className="text-muted-foreground text-sm mb-6">Total: <span className="text-accent font-bold">₹{finalTotal.toLocaleString()}</span></p>
          <div className="bg-secondary rounded-xl p-4 mb-4">
            <img src={paymentQr} alt="Payment QR Code" className="w-56 h-56 mx-auto object-contain rounded-lg" />
          </div>
          <p className="font-semibold text-sm mb-1">UPI ID</p>
          <p className="text-accent font-medium mb-4 text-sm">ayushchauhan4848@oksbi</p>
          <p className="text-muted-foreground text-sm mb-6">Scan this QR using any UPI app to complete payment</p>
          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground mb-3">After payment, share the screenshot on WhatsApp for order confirmation.</p>
            <a href="https://wa.me/919876543210?text=Hi!%20I%20just%20made%20a%20payment%20for%20my%20order."
              target="_blank" rel="noopener noreferrer"
              className="inline-block bg-[hsl(142,70%,40%)] text-white font-semibold text-sm uppercase tracking-wider px-6 py-3 rounded-full hover:opacity-90 transition-opacity">
              Share on WhatsApp
            </a>
            <button onClick={() => { setStep("done"); toast({ title: "Order placed! 🎉" }); }}
              className="block w-full mt-3 text-accent text-sm hover:underline">
              I've completed the payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[75px] md:pt-[90px] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: "var(--font-display)" }}>Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Address form */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4">Shipping Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "full_name", label: "Full Name", span: 1 },
                  { key: "age", label: "Age", span: 1 },
                  { key: "phone", label: "Phone", span: 1 },
                  { key: "address_line1", label: "Address Line 1", span: 2 },
                  { key: "address_line2", label: "Address Line 2 (Optional)", span: 2 },
                  { key: "city", label: "City", span: 1 },
                  { key: "state", label: "State", span: 1 },
                  { key: "pincode", label: "Pincode", span: 1 },
                ].map(f => (
                  <div key={f.key} className={f.span === 2 ? "md:col-span-2" : ""}>
                    <label className="text-sm font-medium mb-1 block">{f.label}</label>
                    <input
                      type="text"
                      value={form[f.key as keyof typeof form]}
                      onChange={(e) => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    {errors[f.key] && <p className="text-xs text-destructive mt-1">{errors[f.key]}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4">Payment Method</h3>
              <div className="space-y-3">
                {[
                  { value: "upi" as const, label: "UPI / Google Pay (QR Code)" },
                  { value: "cod" as const, label: "Cash on Delivery" },
                ].map(m => (
                  <label key={m.value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${paymentMethod === m.value ? "border-primary bg-primary/5" : "border-input hover:border-accent"}`}>
                    <input type="radio" name="payment" value={m.value} checked={paymentMethod === m.value}
                      onChange={() => setPaymentMethod(m.value)} className="accent-primary" />
                    <span className="text-sm font-medium">{m.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-card border border-border rounded-xl p-6 h-fit sticky top-24">
            <h3 className="font-bold text-lg mb-4" style={{ fontFamily: "var(--font-display)" }}>Order Summary</h3>
            <div className="space-y-3 mb-4">
              {cart.map(i => (
                <div key={`${i.productId}-${i.size}`} className="flex gap-3">
                  <img src={getProductImage(i.imageUrl)} alt={i.name} className="w-12 h-14 rounded-lg object-cover bg-secondary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{i.name}</p>
                    <p className="text-xs text-muted-foreground">Size: {i.size} × {i.qty}</p>
                  </div>
                  <p className="text-sm font-semibold">₹{(i.price * i.qty).toLocaleString()}</p>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="flex gap-2 mb-4">
              <input type="text" placeholder="Coupon code" value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm" />
              <button onClick={applyCoupon} className="bg-accent text-accent-foreground px-4 rounded-lg text-sm font-medium hover:opacity-90">
                Apply
              </button>
            </div>

            <div className="space-y-2 text-sm border-t border-border pt-4">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{cartTotal.toLocaleString()}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{discount.toLocaleString()}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="text-green-600">Free</span></div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-base">
                <span>Total</span><span className="text-accent">₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            <button onClick={handlePlaceOrder} disabled={submitting}
              className="w-full bg-primary text-primary-foreground py-3 rounded-full text-sm font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors mt-6 disabled:opacity-50">
              {submitting ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
