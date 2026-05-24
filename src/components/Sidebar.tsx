import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  CalendarCheck, 
  Store, 
  MapPin, 
  UserCircle,
  FileText,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

interface SidebarProps {
  onClose?: () => void;
  className?: string;
}

export default function Sidebar({ onClose, className }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Dealers', path: '/admin/dealers', icon: Store },
    { name: 'Cars', path: '/admin/cars', icon: Car },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Bookings', path: '/admin/bookings', icon: CalendarCheck },
  ];

  const dealerLinks = [
    { name: 'Dashboard', path: '/dealer/dashboard', icon: LayoutDashboard },
    { name: 'My Inventory', path: '/dealer/my-cars', icon: Car },
    { name: 'Bookings', path: '/dealer/bookings', icon: CalendarCheck },
    { name: 'Quotations', path: '/dealer/quotations', icon: FileText },
    { name: 'Profile', path: '/dealer/profile', icon: UserCircle },
  ];

  const userLinks = [
    { name: 'Find Cars', path: '/user/dashboard', icon: Car },
    { name: 'My Bookings', path: '/user/my-bookings', icon: CalendarCheck },
    { name: 'My Quotations', path: '/user/my-quotations', icon: FileText },
  ];

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'dealer' ? dealerLinks : userLinks;

  return (
    <aside className={cn("w-64 bg-sidebar text-slate-50 h-full flex flex-col", className)}>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Car className="text-white" size={18} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">QuotaLo</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            onClick={onClose}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
              isActive 
                ? "bg-primary text-white" 
                : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
            )}
          >
            <link.icon size={18} />
            {link.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="p-4 bg-white/5 rounded-xl mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-500 rounded-full flex items-center justify-center text-white font-bold">
              {user?.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-widest text-slate-400 hover:text-white transition-all"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
