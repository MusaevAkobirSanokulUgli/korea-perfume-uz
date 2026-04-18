import Link from "next/link";
import { Phone, Send, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">
              KoreaPerfume<span className="text-accent-light">.uz</span>
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Koreya parfyumeriyasini O&apos;zbekistonga yetkazib beramiz.
              Original mahsulotlar, qulay narxlar.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Foydali havolalar</h4>
            <div className="space-y-2">
              <Link href="/" className="block text-sm text-gray-300 hover:text-white transition">
                Bosh sahifa
              </Link>
              <Link href="/products" className="block text-sm text-gray-300 hover:text-white transition">
                Mahsulotlar
              </Link>
              <Link href="/auth/register" className="block text-sm text-gray-300 hover:text-white transition">
                Ro&apos;yxatdan o&apos;tish
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Bog&apos;lanish</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Phone size={16} />
                <span>+998 90 123 45 67</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Send size={16} />
                <span>@koreaperfume_uz</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <MapPin size={16} />
                <span>Toshkent, O&apos;zbekiston</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} KoreaPerfume.uz — Barcha huquqlar himoyalangan
        </div>
      </div>
    </footer>
  );
}
