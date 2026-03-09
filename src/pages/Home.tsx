import { Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getProductImage } from "@/lib/product-images";
import { Star, ArrowRight, ChevronRight, ChevronLeft, MapPin, Heart, Phone, Instagram, Send, ShoppingBag, X, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";
import heroBg from "@/assets/hero-women.jpg";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string | null;
  images: string[] | null;
  tag: string | null;
  category: string;
  stock_quantity: number;
}

/* ── Animation Variants ── */
const fadeInUp = {
  hidden: { opacity: 0, y: 60, filter: "blur(8px)" },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }
  })
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85, rotateX: 15 },
  visible: (i: number = 0) => ({
    opacity: 1, scale: 1, rotateX: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }
  })
};

const slideInLeft = {
  hidden: { opacity: 0, x: -80, filter: "blur(6px)" },
  visible: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const slideInRight = {
  hidden: { opacity: 0, x: 80, filter: "blur(6px)" },
  visible: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } }
};

const letterReveal = {
  hidden: { opacity: 0, y: 40, rotateX: -90 },
  visible: (i: number) => ({
    opacity: 1, y: 0, rotateX: 0,
    transition: { duration: 0.6, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }
  })
};

const glowPulse = {
  animate: {
    boxShadow: [
      "0 0 20px 0 hsl(15 50% 72% / 0.2)",
      "0 0 40px 8px hsl(15 50% 72% / 0.4)",
      "0 0 20px 0 hsl(15 50% 72% / 0.2)",
    ],
    transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
  }
};

/* ── Animated Section Wrapper ── */
const AnimatedSection = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial="hidden" animate={isInView ? "visible" : "hidden"} variants={staggerContainer} className={className}>
      {children}
    </motion.div>
  );
};

/* ── Stock Status ── */
const StockStatus = ({ quantity }: { quantity: number }) => {
  if (quantity === 0) return <p className="text-xs text-destructive/80 font-medium mt-1">Out of Stock</p>;
  if (quantity <= 5) return (
    <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
      className="text-xs mt-1 font-medium" style={{ color: 'hsl(var(--accent))' }}>
      Only {quantity} pieces left
    </motion.p>
  );
  return <p className="text-xs text-muted-foreground/70 mt-1">In Stock</p>;
};

/* ── Hero ── */
const HeroSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const title = "Indo-Western";
  const subtitle = "Suits for the Modern Woman";

  return (
    <section ref={ref} id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y, scale }}>
        <img src={heroBg} alt="Indo-Western Fashion" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/50 to-transparent" />
        <motion.div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent"
          animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
      </motion.div>
      <motion.div style={{ opacity }} className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        <motion.p variants={fadeInUp} initial="hidden" animate="visible" custom={0}
          className="text-accent text-sm md:text-base tracking-[0.3em] uppercase mb-4 flex items-center justify-center gap-2">
          <Sparkles size={16} className="animate-spin" style={{ animationDuration: '3s' }} />
          Elegance Redefined for Modern Women
          <Sparkles size={16} className="animate-spin" style={{ animationDuration: '3s' }} />
        </motion.p>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight mb-6" style={{ perspective: "800px" }}>
          <span className="block overflow-hidden">
            {title.split("").map((char, i) => (
              <motion.span key={i} custom={i} variants={letterReveal} initial="hidden" animate="visible"
                className="inline-block" style={{ display: char === " " ? "inline" : "inline-block" }}>
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </span>
          <motion.span variants={fadeInUp} initial="hidden" animate="visible" custom={6}
            className="block text-accent italic mt-2">
            {subtitle}
          </motion.span>
        </h1>

        <motion.p variants={fadeInUp} initial="hidden" animate="visible" custom={8}
          className="text-primary-foreground/80 text-base md:text-lg mb-8 max-w-lg mx-auto">
          Premium handcrafted fusion suits blending Indian heritage with contemporary silhouettes.
          Exclusively for women in Chandigarh, Panchkula & Mohali.
        </motion.p>

        <motion.div variants={fadeInUp} initial="hidden" animate="visible" custom={10}>
          <motion.div whileHover={{ scale: 1.08, y: -4 }} whileTap={{ scale: 0.95 }} {...glowPulse}>
            <Link to="/collection"
              className="inline-block bg-accent text-accent-foreground font-semibold text-sm tracking-wider uppercase px-10 py-4 rounded-full btn-premium">
              Shop Collection
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div key={i} className="absolute w-1.5 h-1.5 rounded-full bg-accent/40"
            style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
            animate={{ y: [-20, 20, -20], x: [-10, 10, -10], opacity: [0.2, 0.8, 0.2], scale: [0.5, 1.2, 0.5] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }} />
        ))}
      </motion.div>

      {/* Scroll indicator */}
      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 12, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
        <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/40 flex items-start justify-center p-1.5">
          <motion.div className="w-1.5 h-2.5 rounded-full bg-accent"
            animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
        </div>
      </motion.div>
    </section>
  );
};

/* ── About ── */
const AboutSection = () => (
  <AnimatedSection>
    <section id="about" className="py-20 md:py-28 px-6 bg-secondary overflow-hidden">
      <div className="max-w-4xl mx-auto text-center">
        <motion.p variants={fadeInUp} custom={0} className="text-accent text-sm tracking-[0.2em] uppercase mb-2">About Us</motion.p>
        <motion.h2 variants={fadeInUp} custom={1} className="text-3xl md:text-5xl font-bold mb-6" style={{ fontFamily: "var(--font-display)" }}>
          Crafted for the Modern Woman
        </motion.h2>
        <motion.p variants={fadeInUp} custom={2} className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
          Urban Suit Studio is the Tricity's premier destination for women's Indo-Western fashion.
          We blend traditional Indian craftsmanship — intricate embroidery, rich fabrics,
          and timeless silhouettes — with contemporary Western tailoring.
        </motion.p>
        <motion.div variants={staggerContainer} className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
          {[
            { icon: Star, text: "500+ Happy Customers" },
            { icon: MapPin, text: "Chandigarh · Panchkula · Mohali" },
            { icon: Heart, text: "Women-Only Collection" },
          ].map((item, i) => (
            <motion.div key={i} variants={scaleIn} custom={i} whileHover={{ scale: 1.1, y: -4 }}
              className="flex items-center gap-2 bg-card px-5 py-3 rounded-full border border-border shadow-sm transition-shadow">
              <item.icon size={18} className="text-accent" /><span>{item.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  </AnimatedSection>
);

/* ── Contact ── */
const ContactSection = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setSending(true);
    try {
      const { error } = await supabase.from("contact_messages").insert({
        name: form.name.trim().slice(0, 100),
        email: form.email.trim().slice(0, 255),
        message: form.message.trim().slice(0, 1000),
      });
      if (error) throw error;
      toast({ title: "Message Sent!", description: "We'll get back to you soon." });
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.error("Contact form error:", err);
      toast({ title: "Failed to send", description: "Please try again or reach us on WhatsApp.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatedSection>
      <section id="contact" className="py-20 md:py-28 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <motion.p variants={fadeInUp} custom={0} className="text-accent text-sm tracking-[0.2em] uppercase mb-2">Get in Touch</motion.p>
            <motion.h2 variants={fadeInUp} custom={1} className="text-3xl md:text-5xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              We'd Love to Hear From You
            </motion.h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <motion.form variants={slideInLeft} onSubmit={handleSubmit} className="space-y-5">
              {[
                { type: "text", placeholder: "Your Name", key: "name" as const },
                { type: "email", placeholder: "Your Email", key: "email" as const },
              ].map((field) => (
                <motion.input key={field.key} type={field.type} placeholder={field.placeholder}
                  value={form[field.key]} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} required
                  whileFocus={{ scale: 1.02, boxShadow: "0 0 20px hsl(var(--accent) / 0.2)" }}
                  className="w-full px-5 py-3 rounded-full border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300" />
              ))}
              <motion.textarea placeholder="Your Message" value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={4}
                className="w-full px-5 py-3 rounded-2xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300 resize-none" />
              <motion.button type="submit" disabled={sending}
                whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm tracking-wider uppercase px-8 py-3 rounded-full hover:bg-primary/90 transition-all duration-400 btn-premium disabled:opacity-50">
                <Send size={16} /> {sending ? "Sending..." : "Send Message"}
              </motion.button>
            </motion.form>
            <motion.div variants={slideInRight} className="flex flex-col justify-center gap-5">
              <motion.a whileHover={{ scale: 1.03, x: 8 }} whileTap={{ scale: 0.97 }}
                href="https://wa.me/917876843854" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 rounded-2xl bg-secondary hover:bg-muted transition-all duration-400 group">
                <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  className="w-12 h-12 rounded-full bg-[hsl(142,70%,40%)] flex items-center justify-center text-white">
                  <Phone size={20} />
                </motion.div>
                <div><p className="font-semibold">WhatsApp Us</p><p className="text-sm text-muted-foreground">Chat for orders & support</p></div>
              </motion.a>
              <motion.a whileHover={{ scale: 1.03, x: 8 }} whileTap={{ scale: 0.97 }}
                href="https://instagram.com/urbansuit.studio" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 rounded-2xl bg-secondary hover:bg-muted transition-all duration-400 group">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(330,70%,55%)] to-[hsl(30,90%,55%)] flex items-center justify-center text-white"><Instagram size={20} /></div>
                <div><p className="font-semibold">Follow on Instagram</p><p className="text-sm text-muted-foreground">@urbansuit.studio</p></div>
              </motion.a>
            </motion.div>
          </div>
        </div>
      </section>
    </AnimatedSection>
  );
};

/* ── Product Card ── */
const ProductCard = ({ p, index }: { p: Product; index: number }) => {
  const [showAlt, setShowAlt] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();

  const handleImageToggle = useCallback((e: React.MouseEvent) => {
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
    <motion.div variants={scaleIn} custom={index}
      onHoverStart={() => setIsHovered(true)} onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -10, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}>
      <Link to={`/product/${p.slug}`}
        className="block bg-card rounded-xl overflow-hidden border border-border group relative">
        <div className="relative aspect-[3/4] overflow-hidden cursor-pointer" onClick={handleImageToggle}>
          <motion.img src={primaryImg} alt={p.name}
            animate={{ opacity: showAlt ? 0 : 1, scale: isHovered ? 1.08 : 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full object-cover absolute inset-0" />
          <motion.img src={altImg} alt={`${p.name} alternate`}
            animate={{ opacity: showAlt ? 1 : 0, scale: showAlt ? 1 : 0.95 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full object-cover absolute inset-0" />
          
          {/* Hover overlay with shimmer */}
          <motion.div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.4 }} />
          
          {/* Floating "View" indicator */}
          <motion.div className="absolute inset-0 flex items-center justify-center"
            animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.5 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
            <span className="bg-card/90 backdrop-blur-md text-foreground text-xs font-bold tracking-widest uppercase px-5 py-2.5 rounded-full border border-border">
              View Details
            </span>
          </motion.div>

          {p.tag && p.tag.toLowerCase() === 'bestseller' && (
            <motion.span animate={{ boxShadow: ["0 0 8px hsl(var(--accent) / 0.3)", "0 0 20px hsl(var(--accent) / 0.5)", "0 0 8px hsl(var(--accent) / 0.3)"] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider z-10">
              {p.tag}
            </motion.span>
          )}
        </div>
        <div className="p-3 md:p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{p.category}</p>
          <h3 className="font-semibold text-sm mb-1.5 line-clamp-1">{p.name}</h3>
          <p className="font-bold text-base text-foreground">₹{p.price.toLocaleString()}</p>
          <StockStatus quantity={p.stock_quantity} />
          <motion.button onClick={handleAddToCart} disabled={p.stock_quantity === 0}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}
            className="mt-3 w-full flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-xs font-medium tracking-wider uppercase py-2.5 rounded-lg transition-all duration-400 hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed">
            <ShoppingBag size={14} />
            {p.stock_quantity === 0 ? "Sold Out" : "Add to Cart"}
          </motion.button>
        </div>
      </Link>
    </motion.div>
  );
};

/* ── Magnetic Button (for arrows) ── */
const MagneticButton = ({ children, onClick, disabled, className }: { children: React.ReactNode; onClick: () => void; disabled: boolean; className?: string }) => (
  <motion.button onClick={onClick} disabled={disabled}
    whileHover={{ scale: 1.2, rotate: disabled ? 0 : 5 }}
    whileTap={{ scale: 0.85 }}
    className={className}>
    {children}
  </motion.button>
);

/* ── Home Page ── */
const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<{ rating: number; comment: string | null; name: string; productName: string; productImage: string; productSlug: string }[]>([]);
  const [selectedReview, setSelectedReview] = useState<typeof reviews[0] | null>(null);
  const [reviewPage, setReviewPage] = useState(0);

  useEffect(() => {
    supabase.from("products").select("id, name, slug, price, image_url, images, tag, category, stock_quantity").eq("is_active", true).limit(6)
      .then(({ data }) => { setProducts(data || []); setLoading(false); });

    supabase.from("reviews").select("rating, comment, user_id, product_id").order("created_at", { ascending: false }).limit(12)
      .then(async ({ data: reviewsData }) => {
        if (!reviewsData || reviewsData.length === 0) return;
        const userIds = [...new Set(reviewsData.map(r => r.user_id))];
        const productIds = [...new Set(reviewsData.map(r => r.product_id))];
        const [{ data: profilesData }, { data: productsData }] = await Promise.all([
          supabase.from("profiles").select("user_id, full_name").in("user_id", userIds),
          supabase.from("products").select("id, name, slug, image_url").in("id", productIds),
        ]);
        const profileMap = new Map((profilesData || []).map(p => [p.user_id, p.full_name]));
        const productMap = new Map((productsData || []).map(p => [p.id, p]));
        setReviews(reviewsData.map(r => {
          const prod = productMap.get(r.product_id);
          return { rating: r.rating, comment: r.comment, name: profileMap.get(r.user_id) || "Customer", productName: prod?.name || "Product", productImage: getProductImage(prod?.image_url || null), productSlug: prod?.slug || "" };
        }));
      });
  }, []);

  const categories = ["Anarkali", "Kurta Set", "Blazer Set", "Bridal", "Kurta", "Blazer Suit"];
  const fallbackReviews = [
    { rating: 5, comment: "Absolutely love the quality! The anarkali set was perfect for my sister's wedding.", name: "Priya Sharma", productName: "Anarkali Set", productImage: getProductImage(null), productSlug: "" },
    { rating: 5, comment: "The blazer set is so chic and comfortable. Got so many compliments!", name: "Sneha Reddy", productName: "Blazer Set", productImage: getProductImage(null), productSlug: "" },
    { rating: 4, comment: "Premium fabric and beautiful stitching. Will definitely order again!", name: "Ananya Gupta", productName: "Kurta Set", productImage: getProductImage(null), productSlug: "" },
  ];

  const displayReviews = reviews.length > 0 ? reviews : fallbackReviews;
  const perPage = 3;
  const maxPage = Math.max(0, Math.ceil(displayReviews.length / perPage) - 1);
  const visible = displayReviews.slice(reviewPage * perPage, reviewPage * perPage + perPage);
  const avg = displayReviews.reduce((s, r) => s + r.rating, 0) / displayReviews.length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div style={{ paddingTop: '80px' }}>
        <HeroSection />

        {/* Categories */}
        <section className="py-16 px-4 max-w-7xl mx-auto overflow-hidden">
          <AnimatedSection>
            <motion.h2 variants={fadeInUp} custom={0} className="text-3xl md:text-4xl font-bold text-center mb-2" style={{ fontFamily: "var(--font-display)" }}>Shop by Category</motion.h2>
            <motion.p variants={fadeInUp} custom={1} className="text-center text-muted-foreground mb-10">Find your perfect Indo-Western ensemble</motion.p>
          </AnimatedSection>
          <AnimatedSection className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <motion.div key={cat} variants={scaleIn} custom={i}
                whileHover={{ scale: 1.08, y: -6, boxShadow: "0 15px 30px -10px hsl(var(--foreground) / 0.1)" }}
                whileTap={{ scale: 0.95 }}>
                <Link to={`/collection?category=${encodeURIComponent(cat)}`}
                  className="block bg-secondary rounded-xl p-6 text-center group border border-transparent hover:border-accent/30 transition-colors duration-300">
                  <p className="font-semibold text-sm tracking-wide group-hover:text-accent transition-colors duration-300">{cat}</p>
                </Link>
              </motion.div>
            ))}
          </AnimatedSection>
        </section>

        {/* Trending Products */}
        <section className="py-16 px-4 max-w-7xl mx-auto bg-secondary/30 overflow-hidden">
          <AnimatedSection>
            <motion.div variants={fadeInUp} className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Trending Now</h2>
                <p className="text-muted-foreground mt-1">Our most loved pieces this season</p>
              </div>
              <motion.div whileHover={{ x: 6 }}>
                <Link to="/collection" className="hidden md:flex items-center gap-1 text-accent font-medium hover:underline text-sm">
                  View All <ArrowRight size={16} />
                </Link>
              </motion.div>
            </motion.div>
          </AnimatedSection>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <AnimatedSection className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((p, i) => (
                <ProductCard key={p.id} p={p} index={i} />
              ))}
            </AnimatedSection>
          )}

          <div className="text-center mt-8 md:hidden">
            <Link to="/collection" className="inline-flex items-center gap-1 text-accent font-medium hover:underline">
              View All Products <ChevronRight size={16} />
            </Link>
          </div>
        </section>

        {/* Reviews */}
        <section className="py-16 px-4 max-w-7xl mx-auto bg-secondary/30 overflow-hidden">
          <AnimatedSection>
            <div className="text-center mb-10">
              <motion.h2 variants={fadeInUp} custom={0} className="text-2xl md:text-3xl font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>
                Let customers speak for us
              </motion.h2>
              <motion.div variants={fadeInUp} custom={1} className="flex items-center justify-center gap-2">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <motion.div key={s} initial={{ opacity: 0, scale: 0, rotate: -180 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3 + s * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
                      <Star size={18} className={s <= Math.round(avg) ? "fill-accent text-accent" : "text-muted"} />
                    </motion.div>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">from {displayReviews.length} reviews</span>
              </motion.div>
            </div>
          </AnimatedSection>

          <AnimatePresence mode="wait">
            <motion.div key={reviewPage}
              initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="grid md:grid-cols-3 gap-6">
              {visible.map((r, i) => (
                <motion.button key={`${reviewPage}-${i}`}
                  initial={{ opacity: 0, y: 30, rotateY: -15 }}
                  animate={{ opacity: 1, y: 0, rotateY: 0 }}
                  transition={{ delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -8, boxShadow: "0 20px 40px -12px hsl(var(--foreground) / 0.12)" }}
                  onClick={() => setSelectedReview(r)}
                  className="bg-card border border-border rounded-xl p-6 text-left cursor-pointer transition-colors duration-300 hover:border-accent/30">
                  <div className="flex gap-0.5 mb-3">
                    {[1,2,3,4,5].map(s => <Star key={s} size={16} className={s <= r.rating ? "fill-accent text-accent" : "text-muted"} />)}
                  </div>
                  <p className="text-sm text-foreground mb-4 line-clamp-2">{r.comment}</p>
                  <div className="flex items-center gap-3 mt-auto">
                    <motion.img whileHover={{ scale: 1.15 }} src={r.productImage} alt={r.productName}
                      className="w-10 h-10 rounded-lg object-cover border border-border" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">{r.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{r.productName}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </AnimatePresence>

          {displayReviews.length > perPage && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <MagneticButton onClick={() => setReviewPage(p => Math.max(0, p - 1))} disabled={reviewPage === 0}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-accent transition-all duration-300 disabled:opacity-30">
                <ChevronLeft size={18} />
              </MagneticButton>
              {/* Page dots */}
              <div className="flex gap-2">
                {Array.from({ length: maxPage + 1 }).map((_, i) => (
                  <motion.button key={i} onClick={() => setReviewPage(i)}
                    animate={{ scale: reviewPage === i ? 1.3 : 1, backgroundColor: reviewPage === i ? "hsl(var(--accent))" : "hsl(var(--border))" }}
                    className="w-2 h-2 rounded-full transition-colors" />
                ))}
              </div>
              <MagneticButton onClick={() => setReviewPage(p => Math.min(maxPage, p + 1))} disabled={reviewPage >= maxPage}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-accent transition-all duration-300 disabled:opacity-30">
                <ChevronRight size={18} />
              </MagneticButton>
            </div>
          )}
        </section>

        {/* Review Detail Modal */}
        <AnimatePresence>
          {selectedReview && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm"
              onClick={() => setSelectedReview(null)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.7, rotateX: 20, y: 60 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotateX: -10, y: 40 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="bg-card border border-border rounded-2xl max-w-md w-full p-6 relative"
                onClick={e => e.stopPropagation()}>
                <motion.button whileHover={{ rotate: 90, scale: 1.2 }} whileTap={{ scale: 0.8 }}
                  onClick={() => setSelectedReview(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
                  <X size={18} />
                </motion.button>
                <div className="flex gap-0.5 mb-4">
                  {[1,2,3,4,5].map((s, i) => (
                    <motion.div key={s} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.08, type: "spring", stiffness: 400 }}>
                      <Star size={20} className={s <= selectedReview.rating ? "fill-accent text-accent" : "text-muted"} />
                    </motion.div>
                  ))}
                </div>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="text-sm text-foreground mb-6 leading-relaxed">{selectedReview.comment}</motion.p>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}>
                  <Link to={`/product/${selectedReview.productSlug}`} onClick={() => setSelectedReview(null)}
                    className="flex items-center gap-4 p-3 rounded-xl bg-secondary hover:bg-muted transition-all duration-300">
                    <img src={selectedReview.productImage} alt={selectedReview.productName} className="w-16 h-16 rounded-lg object-cover border border-border" />
                    <div>
                      <p className="font-semibold text-sm">{selectedReview.productName}</p>
                      <p className="text-xs text-accent mt-1">View Product →</p>
                    </div>
                  </Link>
                </motion.div>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                  className="text-sm font-semibold mt-4 text-muted-foreground">— {selectedReview.name}</motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AboutSection />
        <ContactSection />
      </div>
    </motion.div>
  );
};

export default Home;
