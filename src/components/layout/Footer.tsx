import Link from 'next/link';
import { Logo } from '@/components/ui/logo';

/**
 * Footer Component
 * Minimal standard app footer
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-400 dark:text-gray-500 border-t border-gray-800 dark:border-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand & Copyright */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center space-x-2">
              <Logo className="h-6 w-6" />
              <span className="text-lg font-bold text-white">Dancely</span>
            </div>
            <p className="text-sm">© {currentYear} Dancely. All rights reserved.</p>
          </div>

          {/* Legal / Utility Links */}
          <nav className="flex flex-wrap justify-center md:justify-end gap-6 text-sm">
            <Link href="/" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/" className="hover:text-white transition-colors">Help Center</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
