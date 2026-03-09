import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingBag, User, Search } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavbarScroll } from "@/hooks/useScrollReveal";
import logo from "@/assets/logo.png";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Collection", to: "/collection" },
  { label: "About", to: "/#about" },
  { label: "Contact", to: "/#contact" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { cartCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const scrolled = useNavbarScroll();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/collection?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? "bg-background/80 navbar-blur shadow-[0_1px_20px_-6px_hsl(var(--foreground)/0.08)] border-b border-border/50"
        : "bg-background/95 backdrop-blur-md border-b border-border"
    }`} style={{ transitionTimingFunction: 'var(--ease-premium)' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between" style={{ height: scrolled ? '70px' : '80px', transition: 'height 0.5s var(--ease-premium)' }}>
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src={logo}
            alt="Urban Suit Studio"
            className="object-contain transition-transform duration-500 group-hover:scale-105 h-[65px] sm:h-[75px] md:h-[85px] lg:h-[95px] w-auto"
            style={{
              filter: 'drop-shadow(0 2px 6px hsl(var(--foreground) / 0.12))',
              transitionTimingFunction: 'var(--ease-premium)',
            }}
          />
        </Link>

        <ul className="hidden md:flex gap-7 items-center">
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className="nav-link text-sm font-medium tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-300 uppercase"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          <button onClick={() => setSearchOpen(!searchOpen)} className="text-foreground hover:text-accent transition-colors duration-300" aria-label="Search">
            <Search size={20} />
          </button>
          <Link to={user ? "/account" : "/auth"} className="text-foreground hover:text-accent transition-colors duration-300" aria-label="Account">
            <User size={20} />
          </Link>
          <Link to="/cart" className="relative text-foreground hover:text-accent transition-colors duration-300" aria-label="Cart">
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold animate-scale-in">
                {cartCount}
              </span>
            )}
          </Link>
          <button className="md:hidden text-foreground" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-border/50 px-4 py-3 bg-background/90 navbar-blur dropdown-smooth">
          <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 h-10 rounded-full border border-input bg-secondary px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-300"
              autoFocus
            />
            <button type="submit" className="bg-primary text-primary-foreground px-5 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors duration-300">
              Search
            </button>
          </form>
        </div>
      )}

      {menuOpen && (
        <div className="md:hidden bg-background/95 navbar-blur border-t border-border/50 px-6 pb-4 dropdown-smooth">
          <ul className="flex flex-col gap-4 pt-3">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-sm font-medium tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-300 uppercase" onClick={() => setMenuOpen(false)}>
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to={user ? "/account" : "/auth"} className="text-sm font-medium tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-300 uppercase" onClick={() => setMenuOpen(false)}>
                {user ? "My Account" : "Login"}
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
