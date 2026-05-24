import React, { useState, useEffect } from 'react';
import { ShieldCheck, MapPin, Phone, Mail, Building2, CreditCard, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getDealers } from '../../services/carService';
import { useToast } from '../../context/ToastContext';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function Profile() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.email) return;
      try {
        const allDealers = await getDealers() as any[];
        const matched = allDealers?.find((d: any) => d.email.toLowerCase() === user.email.toLowerCase());
        if (matched) {
          setProfile(matched);
        } else {
          // fallback to user details
          setProfile({
            id: user.id || user.uid || '',
            dealershipName: user.name || 'Your Dealership',
            name: user.name || 'Owner',
            email: user.email,
            phone: user.phone || '9999999999',
            address: 'India',
            logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
            gst: '27AAAAA0000A1Z5',
            pan: 'AAAAA0000A'
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    setSaving(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const updatedData = {
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
      gst: formData.get('gst') as string,
      pan: formData.get('pan') as string,
    };

    try {
      const docRef = doc(db, 'dealers', profile.id);
      await updateDoc(docRef, updatedData);
      setProfile((prev: any) => ({ ...prev, ...updatedData }));
      showToast('Profile updated successfully!', 'success');
    } catch (error: any) {
      console.error(error);
      showToast(error.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Business Profile</h1>
          <p className="text-slate-500 mt-1">Manage your dealership information and credentials.</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-2xl border border-green-200 text-sm font-black shadow-sm">
          <ShieldCheck size={20} />
          Verified Account
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b bg-slate-50/50 flex items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-white border p-2 flex items-center justify-center shadow-lg overflow-hidden">
            <img src={profile?.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80'} alt={profile?.dealershipName || profile?.dealership} className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">{profile?.dealershipName || profile?.dealership || 'Your Dealership'}</h2>
            <p className="text-slate-500 font-medium mt-1">{profile?.name} • Registered Dealer</p>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Building2 size={20} className="text-blue-600" /> General Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Dealership Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input type="text" readOnly value={profile?.dealershipName || profile?.dealership || ''} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-slate-600 font-bold focus:bg-white focus:border-blue-200 transition-all outline-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input type="text" name="address" defaultValue={profile?.address || ''} required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-bold focus:bg-white focus:border-blue-500 transition-all outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 text-slate-400" size={18} />
                    <input type="tel" name="phone" defaultValue={profile?.phone || ''} required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-bold focus:bg-white focus:border-blue-500 transition-all outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email (Non-Editable)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                    <input type="email" readOnly value={profile?.email || ''} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-slate-500 font-bold outline-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <CreditCard size={20} className="text-blue-600" /> Compliance Info
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">GST Number</label>
                <input type="text" name="gst" defaultValue={profile?.gst || ''} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-bold focus:bg-white focus:border-blue-500 transition-all outline-none" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">PAN Details</label>
                <input type="text" name="pan" defaultValue={profile?.pan || ''} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-bold focus:bg-white focus:border-blue-500 transition-all outline-none" />
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-sm text-blue-800 font-medium flex items-start gap-3">
                <ShieldCheck size={20} className="mt-0.5 min-w-[20px]" />
                Your business documents are verified. To update restricted details, please contact system admin.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 border-t bg-slate-50/50 flex justify-end">
          <button 
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-8 py-3 rounded-2xl flex items-center gap-2 text-sm font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
