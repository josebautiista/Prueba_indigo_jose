import { useContext, useMemo, useRef, useState } from "react";
import AuthContext from "../contexts/AuthContext";
import { useAuth } from "../hooks/useAuth";
import { LogOut } from "lucide-react";

export const Navbar = () => {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials = useMemo(() => {
    if (!user?.sub) return "?";

    const parts = user.sub.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    } else {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
  }, [user]);

  return (
    <header className="flex justify-between items-center gap-4 text-white ">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
      </div>

      <div className="flex items-center gap-6">
        <span className="text-lg text-slate-100">Bienvenido, {user?.sub}</span>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="bg-linear-to-br from-indigo-600 cursor-pointer to-cyan-500 w-10 h-10 rounded-xl grid place-items-center font-bold text-white shadow-md shadow-indigo-600/40 focus:outline-none"
          >
            {initials}
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 text-white rounded-lg shadow-lg py-2 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-gray-200 text-sm text-white font-bold">
                {user?.sub}
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="flex items-center w-full px-4 py-2 text-left text-sm hover:bg-gray-800 cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2 text-red-600" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
