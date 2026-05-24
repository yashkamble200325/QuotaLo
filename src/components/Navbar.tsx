import { Menu, Bell, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

interface NavbarProps {
  onMenuClick?: () => void;
  title: string;
}

export default function Navbar({ onMenuClick, title }: NavbarProps) {
  const { user } = useAuth();

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'dealer': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-border sticky top-0 z-30 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
        )}
        <div className="flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
          <span className="text-slate-400">Pages</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-600">{title}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-6 mr-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">System Live</span>
          </div>
          {user?.role === 'admin' && (
            <span className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest">
              Admin Panel
            </span>
          )}
        </div>

        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-[1px] bg-slate-200 mx-2" />

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 border border-slate-200">
            <UserIcon size={16} />
          </div>
        </div>
      </div>
    </header>
  );
}
