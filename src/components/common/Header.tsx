import { Heart, Settings, LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useState } from 'react';

export function Header() {
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-dark text-white border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">SwipeOffers</h1>

        <nav className="hidden md:flex gap-6">
          <a href="/" className="hover:text-primary transition">
            Dashboard
          </a>
          <a href="/offers" className="hover:text-primary transition">
            Ofertas
          </a>
          <a href="/reports" className="hover:text-primary transition">
            Relatórios
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <a href="/favorites" className="hover:text-primary">
            <Heart size={20} />
          </a>
          <a href="/settings" className="hover:text-primary">
            <Settings size={20} />
          </a>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
            <Menu size={20} />
          </button>

          {user && (
            <button
              onClick={() => {
                logout();
                window.location.href = '/';
              }}
              className="hover:text-primary"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </div>

      {menuOpen && (
        <nav className="md:hidden bg-slate-800 border-t border-slate-700 p-4 flex flex-col gap-4">
          <a href="/">Dashboard</a>
          <a href="/offers">Ofertas</a>
          <a href="/reports">Relatórios</a>
        </nav>
      )}
    </header>
  );
}
