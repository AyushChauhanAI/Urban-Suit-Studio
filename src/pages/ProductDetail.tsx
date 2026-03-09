import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getProductImage } from "@/lib/product-images";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingBag, Heart, Star, ChevronLeft, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price: number | null;
  description: string | null;
  fabric: string | null;
  sizes: string[] | null;
  colors: string[] | null;
  category: string;
  tag: string | null;
  image_url: string | null;
  stock_quantity: number;
}

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [showAltImage, setShowAltImage] = useState(false);
  const [heartAnimating, setHeartAnimating] = useState(false);

  useEffect(() => {
    if (!slug) return;
    supabase.from("products").select("*").eq("slug", slug).single()
      .then(({ data }) => {
        setProduct(data);
        if (data?.sizes?.length) setSelectedSize(data.sizes[0]);
        if (data?.colors?.length) setSelectedColor(data.colors[0]);
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    if (!user || !product) return;
    supabase.from("wishlist").select("id").eq("user_id", user.id).eq("product_id", product.id).maybeSingle()
      .then(({ data }) => setWishlisted(!!data));
  }, [user, product]);

  const toggleWishlist = async () => {
    if (!user) { navigate("/auth"); return; }
    if (!product) return;
    setHeartAnimating(true);
    setTimeout(() => setHeartAnimating(false), 500);
    if (wishlisted) {
      await supabase.from("wishlist").delete().eq("user_id", user.id).eq("product_id", product.id);
      setWishlisted(false);
      toast({ title: "Removed from wishlist" });
    } else {
      await supabase.from("wishlist").insert({ user_id: user.id, product_id: product.id });
      setWishlisted(true);
      toast({ title: "Added to wishlist! ❤️" });
    }
  };

  const handleAddToCart = () => {
    if (!product || !selectedSize) return;
    addToCart({
      productId: product.id, name: product.name, price: product.price,
      originalPrice: product.original_price ?? undefined, size: selectedSize,
      imageUrl: product.image_url || "", slug: product.slug,
    });
    toast({ title: "Added to bag!", description: `${product.name} (${selectedSize})` });
  };

  const handleBuyNow = () => {
    if (!product || !selectedSize) return;
    handleAddToCart();
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="page-enter" style={{ paddingTop: '90px' }}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-[3/4] rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ paddingTop: '90px' }} className="text-center py-20 page-enter">
        <p className="text-lg text-muted-foreground">Product not found</p>
        <button onClick={() => navigate("/collection")} className="mt-4 text-accent hover:underline">Back to Collection</button>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ paddingTop: '80px' }}>
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors duration-300">
          <ChevronLeft size={16} /> Back
        </button>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image with toggle */}
          <div className="relative group">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-secondary image-toggle cursor-pointer" onClick={() => setShowAltImage(!showAltImage)}>
              <img src={getProductImage(product.image_url)} alt={product.name}
                className="w-full h-full object-cover absolute inset-0 img-layer"
                style={{
                  opacity: showAltImage ? 0 : 1,
                  transform: showAltImage ? 'scale(1.08)' : 'scale(1)',
                  transition: 'all 0.5s var(--ease-premium)',
                }} />
              <img src={getProductImage(product.image_url)} alt={`${product.name} view`}
                className="w-full h-full object-cover absolute inset-0 img-layer"
                style={{
                  opacity: showAltImage ? 1 : 0,
                  transform: showAltImage ? 'scale(1)' : 'scale(0.95)',
                  filter: showAltImage ? 'brightness(1.05)' : 'none',
                  transition: 'all 0.5s var(--ease-premium)',
                }} />
            </div>
            {product.tag && (
              <span className={`absolute top-4 left-4 bg-accent text-accent-foreground text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${product.tag.toLowerCase() === 'bestseller' ? 'tag-glow' : ''}`}>
                {product.tag}
              </span>
            )}
            <button onClick={toggleWishlist}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/80 navbar-blur flex items-center justify-center hover:scale-110 transition-transform duration-400"
              style={{ transitionTimingFunction: 'var(--ease-premium)' }}>
              <Heart size={18} className={`${wishlisted ? "fill-destructive text-destructive" : "text-foreground"} ${heartAnimating ? "heart-bounce" : ""}`} />
            </button>
          </div>

          {/* Info */}
          <div className="space-y-5">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{product.category}</p>
              <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{product.name}</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-accent">₹{product.price.toLocaleString()}</span>
              {product.original_price && product.original_price > product.price && (
                <>
                  <span className="text-muted-foreground line-through">₹{product.original_price.toLocaleString()}</span>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(s => <Star key={s} size={16} className="fill-accent text-accent" />)}
              <span className="text-sm text-muted-foreground ml-2">(24 reviews)</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            {product.fabric && (
              <div><p className="text-sm font-semibold mb-1">Fabric</p><p className="text-sm text-muted-foreground">{product.fabric}</p></div>
            )}
            {product.sizes && (
              <div>
                <p className="text-sm font-semibold mb-2">Select Size</p>
                <div className="flex gap-2">
                  {product.sizes.map(s => (
                    <button key={s} onClick={() => setSelectedSize(s)}
                      className={`w-12 h-12 rounded-lg border text-sm font-medium transition-all duration-300 ${selectedSize === s ? "bg-primary text-primary-foreground border-primary" : "border-input hover:border-accent"}`}
                      style={{ transitionTimingFunction: 'var(--ease-premium)' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {product.colors && product.colors.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">Color: {selectedColor}</p>
                <div className="flex gap-2">
                  {product.colors.map(c => (
                    <button key={c} onClick={() => setSelectedColor(c)}
                      className={`px-4 py-2 rounded-full border text-xs font-medium transition-all duration-300 ${selectedColor === c ? "bg-primary text-primary-foreground border-primary" : "border-input hover:border-accent"}`}
                      style={{ transitionTimingFunction: 'var(--ease-premium)' }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              {product.stock_quantity > 0 ? (
                <>
                  <Check size={14} className="text-green-600" /><span className="text-green-600 font-medium">In Stock</span>
                  {product.stock_quantity < 5 && <span className="text-destructive text-xs ml-1">Only {product.stock_quantity} left!</span>}
                </>
              ) : (
                <span className="text-destructive font-medium">Out of Stock</span>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleAddToCart} disabled={product.stock_quantity === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-secondary text-foreground font-semibold py-3.5 rounded-full text-sm uppercase tracking-wider hover:bg-muted transition-all duration-400 disabled:opacity-50 btn-premium"
                style={{ transitionTimingFunction: 'var(--ease-premium)' }}>
                <ShoppingBag size={16} /> Add to Bag
              </button>
              <button onClick={handleBuyNow} disabled={product.stock_quantity === 0}
                className="flex-1 bg-primary text-primary-foreground font-semibold py-3.5 rounded-full text-sm uppercase tracking-wider hover:bg-primary/90 transition-all duration-400 disabled:opacity-50 btn-premium"
                style={{ transitionTimingFunction: 'var(--ease-premium)' }}>
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
