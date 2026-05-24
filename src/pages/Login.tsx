import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Car, Lock, Mail, ArrowRight, Database } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../context/ToastContext';
import { cn } from '../lib/utils';
import { seedDatabase } from '../services/seedService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    try {
      const role = await login(email, password);
      showToast('Login successful!');
      
      // Redirect based on role
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'dealer') {
        navigate('/dealer/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (error: any) {
      console.error(error);
      const isInvalidCred = error.code === 'auth/invalid-credential' || 
                            (error.message && error.message.includes('auth/invalid-credential')) ||
                            (error.message && error.message.includes('invalid-credential'));
      
      if (isInvalidCred) {
        showToast('Invalid credentials. If you are using default accounts, please click "Seed Data" below to initialize them.', 'error');
      } else {
        showToast(error.message || 'Authentication failed', 'error');
      }
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const status = await seedDatabase();
      showToast('Database seeded successfully!', 'success');
      console.log('Seed Status:', status);
    } catch (error: any) {
      console.error(error);
      if (error.message && error.message.includes('operation-not-allowed')) {
         showToast('Email/Password auth is disabled in your Firebase console. Please enable it to seed users.', 'error');
      } else {
         showToast(error.message || 'Seeding failed', 'error');
      }
    } finally {
      setIsSeeding(false);
    }
  };

  const handleDefaultAccountClick = (emailAddress: string, role: string) => {
    setEmail(emailAddress);
    // Determine default password
    if (role.toLowerCase().includes('admin')) {
      setPassword('admin123');
    } else if (role.toLowerCase().includes('dealer')) {
      setPassword('dealer123');
    } else {
      setPassword('user123');
    }
    showToast(`Pre-filled credentials for ${role}`, 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-blue-100"
          >
            <Car className="text-white" size={24} />
          </motion.div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold text-slate-900 tracking-tight">
          QuotaLo
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-medium tracking-wide">
          Enterprise Auto Quoting System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="card py-8 px-4 sm:px-10 mx-4 sm:mx-0 shadow-xl shadow-slate-200/50 bg-white border border-slate-100 rounded-2xl"
        >
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Email Identity
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg text-sm bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm font-medium"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Secure Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg text-sm bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                className="btn-primary w-full flex justify-center items-center gap-2 py-3 !rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg shadow-blue-100"
              >
                Enter System
                <ArrowRight size={16} />
              </motion.button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/register"
              className="text-xs font-bold text-primary hover:underline uppercase tracking-wider"
            >
              Access for new users
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
                <span className="text-slate-300">Authorized Access</span>
              </div>
              
              <button
                onClick={handleSeed}
                disabled={isSeeding}
                className="flex items-center gap-1.5 text-[10px] font-bold text-primary hover:text-primary/80 uppercase tracking-widest transition-colors disabled:opacity-50"
              >
                <Database size={12} />
                {isSeeding ? 'Seeding...' : 'Seed Data'}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {[
                { role: 'Admin', email: 'yashkamble200325@gmail.com', color: 'text-blue-600' },
                { role: 'Dealer (Toyota)', email: 'toyota@quotalo.com', color: 'text-indigo-600' },
                { role: 'Dealer (Onkar)', email: 'onkarmotors@quotalo.com', color: 'text-purple-600' },
                { role: 'Retail User', email: 'rahul.sharma@example.com', color: 'text-emerald-600' }
              ].map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleDefaultAccountClick(acc.email, acc.role)}
                  className="flex justify-between items-center px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 rounded-lg text-left transition-all cursor-pointer"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{acc.role}</span>
                  <code className={cn("text-[10px] font-bold font-mono", acc.color)}>{acc.email}</code>
                </button>
              ))}
            </div>

            <p className="mt-4 text-[10px] text-slate-400 text-center leading-relaxed">
              <strong>Shared Project Tip:</strong> If any default account returns "invalid credentials" even after clicking <strong>Seed Data</strong>, another user may have registered it with a different password. You can click <strong>"Access for new users"</strong> above to register a brand-new email (e.g., <code>yourdealership@quotalo.com</code>) to instantly get a dedicated Dealer account!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
