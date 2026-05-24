import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Car, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !name) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    try {
      await register(email, password, name);
      showToast('Account created successfully!');
      
      const normalizedEmail = email.toLowerCase();
      const isAdmin = normalizedEmail === 'yashkamble200325@gmail.com';
      const isDealer = normalizedEmail.includes('dealer') || normalizedEmail.endsWith('@quotalo.com');
      
      if (isAdmin) {
        navigate('/admin/dashboard');
      } else if (isDealer) {
        navigate('/dealer/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (error: any) {
      console.error(error);
      showToast(error.message || 'Registration failed', 'error');
    }
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
          Create Account
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
          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Car size={16} />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg text-sm bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm font-medium"
                  placeholder="Your Name"
                />
              </div>
            </div>

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
              <p className="mt-1 text-[10px] text-slate-400">
                <strong>Tip:</strong> Register an email ending with <code>@quotalo.com</code> to automatically get a <strong>dealer dashboard</strong>!
              </p>
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
                Create Account
                <ArrowRight size={16} />
              </motion.button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-xs font-bold text-primary hover:underline uppercase tracking-wider"
            >
              Wait, I have an account
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
