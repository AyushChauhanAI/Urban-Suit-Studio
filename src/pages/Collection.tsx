import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getProductImage } from "@/lib/product-images";
import { SlidersHorizontal, X, ShoppingBag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string | null;
  images: string[] | null;
  tag: string | null;
  category: string;
  colors: string[] | null;
  sizes: string[] | null;
  stock_quantity: number;
}

const categories = ["All", "Anarkali", "Kurta Set", "Blazer Set", "Bridal", "Kurta", "Blazer Suit"];
const sizeOptions = ["S", "M", "L", "XL"];
const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

/* ── Stock Status ── */
const StockStatus = ({ quantity }: { quantity: number }) => {
  if (quantity === 0) return <p className="text-xs text-destructive/80 font-medium mt-1">Out of Stock</p>;
  if (quantity <= 5) return <p className="text-xs mt-1 animate-fade-in-up" style={{ color: 'hsl(var(--accent))' }}>Only {quantity} pieces left</p>;
  return <p className="text-xs text-muted-foreground/70 mt-1">In Stock</p>;
};

/* ── Product Card ── */
const CollectionCard = ({ p, index }: { p: Product; index: number }) => {
  const [showAlt, setShowAlt] = useState(false);
  const { addToCart } = useCart();

  const handleImageClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAlt(prev => !prev);
  }, []);

  const primaryImg = getProductImage(p.image_url);
  const altImg = p.images && p.images.length > 0 ? getProductImage(p.images[0]) : primaryImg;

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (p.stock_quantity === 0) return;
    addToCart({ productId: p.id, name: p.name, price: p.price, imageUrl: primaryImg, size: "M", slug: p.slug });
    toast({ title: "Added to cart", description: p.name });
  }, [p, primaryImg, addToCart]);

  return (
    <Link to={`/product/${p.slug}`}
      className="product-card group bg-card rounded-xl overflow-hidden border border-border"
      style={{ opacity: 0, animation: `reveal-up 0.6s var(--ease-premium) ${index * 0.08}s both` }}>
      <div className="relative aspect-[3/4] overflow-hidden image-toggle" onClick={handleImageClick}>
        <img src={primaryImg} alt={p.name}
          className="img-layer product-image w-full h-full object-cover absolute inset-0"
          style={{ opacity: showAlt ? 0 : 1, transform: showAlt ? 'scale(1.08)' : 'scale(1)', transition: 'all 0.45s var(--ease-smooth)' }} />
        <img src={altImg} alt={`${p.name} alternate`}
          className="img-layer w-full h-full object-cover absolute inset-0"
          style={{ opacity: showAlt ? 1 : 0, transform: showAlt ? 'scale(1)' : 'scale(0.95)', filter: showAlt ? 'brightness(1.05)' : 'none', transition: 'all 0.45s var(--ease-smooth)' }} />
        {p.tag && p.tag.toLowerCase() === 'bestseller' && (
          <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider z-10 tag-glow">
            {p.tag}
          </span>
        )}
      </div>
      <div className="p-3 md:p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{p.category}</p>
        <h3 className="font-semibold text-sm mb-1.5 line-clamp-1">{p.name}</h3>
        <p className="font-bold text-base text-foreground">₹{p.price.toLocaleString()}</p>
        <StockStatus quantity={p.stock_quantity} />
        <button
          onClick={handleAddToCart}
          disabled={p.stock_quantity === 0}
          className="mt-3 w-full flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-xs font-medium tracking-wider uppercase py-2.5 rounded-lg transition-all duration-400 hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed btn-premium"
          style={{ transitionTimingFunction: 'var(--ease-premium)' }}
        >
          <ShoppingBag size={14} />
          {p.stock_quantity === 0 ? "Sold Out" : "Add to Cart"}
        </button>
      </div>
    </Link>
  );
};

const Collection = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]);
  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let query = supabase.from("products").select("id, name, slug, price, image_url, images, tag, category, colors, sizes, stock_quantity").eq("is_active", true);
      if (selectedCategory !== "All") query = query.eq("category", selectedCategory);
      if (searchQuery) query = query.ilike("name", `%${searchQuery}%`);
      query = query.gte("price", priceRange[0]).lte("price", priceRange[1]);
      if (sortBy === "price_asc") query = query.order("price", { ascending: true });
      else if (sortBy === "price_desc") query = query.order("price", { ascending: false });
      else query = query.order("created_at", { ascending: false });
      const { data } = await query;
      let filtered = data || [];
      if (selectedSize) filtered = filtered.filter(p => p.sizes?.includes(selectedSize));
      setProducts(filtered);
      setLoading(false);
    };
    fetchProducts();
  }, [selectedCategory, selectedSize, sortBy, priceRange, searchQuery]);

  return (
    <div className="page-enter" style={{ paddingTop: '80px' }}>
      <div className="min-h-screen">
        <div className="bg-secondary/50 py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              {searchQuery ? `Results for "${searchQuery}"` : "Our Collection"}
            </h1>
            <p className="text-muted-foreground mt-1">Premium Indo-Western suits for the modern woman</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {categories.map(c => (
                <button key={c} onClick={() => setSelectedCategory(c)}
                  className={`px-4 py-2 rounded-full text-xs font-medium tracking-wider whitespace-nowrap transition-all duration-400 ${selectedCategory === c ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-muted"}`}
                  style={{ transitionTimingFunction: 'var(--ease-premium)' }}>
                  {c}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-input rounded-lg px-3 py-2 bg-background transition-all duration-300">
                {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <button onClick={() => setFiltersOpen(!filtersOpen)}
                className="flex items-center gap-1 text-sm border border-input rounded-lg px-3 py-2 hover:bg-muted transition-colors duration-300 md:hidden">
                <SlidersHorizontal size={14} /> Filters
              </button>
            </div>
          </div>

          <div className="flex gap-8">
            <aside className={`${filtersOpen ? "fixed inset-0 z-50 bg-background p-6 overflow-auto dropdown-smooth" : "hidden"} md:block md:static md:w-56 flex-shrink-0`}>
              <div className="flex items-center justify-between md:hidden mb-4">
                <h3 className="font-bold text-lg">Filters</h3>
                <button onClick={() => setFiltersOpen(false)}><X size={20} /></button>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-sm mb-3 uppercase tracking-wider">Size</h4>
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map(s => (
                      <button key={s} onClick={() => setSelectedSize(selectedSize === s ? null : s)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium border transition-all duration-300 ${selectedSize === s ? "bg-primary text-primary-foreground border-primary" : "border-input hover:border-accent"}`}
                        style={{ transitionTimingFunction: 'var(--ease-premium)' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-3 uppercase tracking-wider">Price Range</h4>
                  <input type="range" min={0} max={20000} step={500} value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full accent-accent" />
                  <p className="text-xs text-muted-foreground mt-1">Up to ₹{priceRange[1].toLocaleString()}</p>
                </div>
                {filtersOpen && (
                  <button onClick={() => setFiltersOpen(false)} className="w-full bg-primary text-primary-foreground py-2 rounded-lg text-sm font-medium mt-4 btn-premium">
                    Apply Filters
                  </button>
                )}
              </div>
            </aside>

            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-lg text-muted-foreground">No products found</p>
                  <button onClick={() => { setSelectedCategory("All"); setSelectedSize(null); setPriceRange([0, 20000]); }}
                    className="mt-4 text-accent hover:underline text-sm">Clear all filters</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {products.map((p, i) => (
                    <CollectionCard key={p.id} p={p} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collection;
