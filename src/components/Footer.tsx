import { Instagram, Phone } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-14 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <img src={logo} alt="Urban Suit Studio" className="h-16 object-contain mb-3 brightness-0 invert" />
            <p className="text-sm italic text-primary-foreground/70 mb-2">Elegance Redefined for Modern Women</p>
            <p className="text-primary-foreground/60 text-sm leading-relaxed">
              Premium Indo-Western fashion for women in Chandigarh, Panchkula & Mohali.
            </p>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Policies</h4>
            <ul className="space-y-2 text-primary-foreground/60 text-sm">
              <li className="hover:text-primary-foreground cursor-pointer transition-colors">Return & Exchange</li>
              <li className="hover:text-primary-foreground cursor-pointer transition-colors">Shipping Policy</li>
              <li className="hover:text-primary-foreground cursor-pointer transition-colors">Privacy Policy</li>
              <li className="hover:text-primary-foreground cursor-pointer transition-colors">Terms & Conditions</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Connect</h4>
            <div className="flex items-center gap-4">
              <a href="https://instagram.com/urbansuit.studio" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-primary-foreground/30 flex items-center justify-center text-primary-foreground/60 hover:text-accent hover:border-accent transition-colors">
                <Instagram size={18} />
              </a>
              <a href="https://wa.me/917876843854" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-primary-foreground/30 flex items-center justify-center text-primary-foreground/60 hover:text-accent hover:border-accent transition-colors">
                <Phone size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/15 pt-6 text-center">
          <p className="text-primary-foreground/50 text-sm">
            © 2026 Urban Suit Studio. All rights reserved. Made with ♥ for women.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
