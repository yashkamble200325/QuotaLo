import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ShieldCheck, Mail, MapPin, Loader2 } from 'lucide-react';
import { collection, doc, setDoc, Timestamp, onSnapshot, query, orderBy, deleteDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail, getAuth, setPersistence, inMemoryPersistence } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { db } from '../../lib/firebase';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { getUserByEmail } from '../../services/carService';

// Embedded production-grade config keys so secondary app-generation succeeds under direct user execution
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD2IupmXCw6qSpP-J0NBLohNUg9I2JmgTs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "quotalo-37318.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "quotalo-37318",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "quotalo-37318.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "797814830044",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:797814830044:web:f631bbea95a9d503355519"
};

export default function Dealers() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [dealers, setDealers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    dealerName: '',
    dealershipName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const q = query(collection(db, 'dealers'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dealerList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDealers(dealerList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching dealers:", error);
      showToast("Failed to load dealers", "error");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [showToast]);

  const handleCreateDealer = async () => {
    if (!formData.email || !formData.dealerName || !formData.dealershipName) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // Create Firebase Auth user using a secondary app instance
      // This prevents the current admin user from being automatically signed out
      const tempAppName = `dealer-gen-${Date.now()}`;
      const tempApp = initializeApp(firebaseConfig, tempAppName);
      const tempAuth = getAuth(tempApp);
      
      // CRITICAL: Set persistence to none/memory to avoid hijacking the browser session
      await setPersistence(tempAuth, inMemoryPersistence);
      
      let userUid = '';
      try {
        const userCredential = await createUserWithEmailAndPassword(
          tempAuth, 
          formData.email, 
          "dealer123"
        );
        userUid = userCredential.user.uid;
      } catch (authError: any) {
        if (authError.code === 'auth/email-already-in-use') {
          console.log("Auth user already exists, seeking UID or skipping");
          const existingProfile = await getUserByEmail(formData.email);
          userUid = existingProfile?.id || formData.email;
        } else {
          throw authError;
        }
      }
      
      console.log(`Writing user profile for ${userUid}...`);
      try {
        await setDoc(doc(db, "users", userUid), {
          email: formData.email,
          name: formData.dealerName,
          role: "dealer",
          uid: userUid,
          dealerId: formData.email,
          createdAt: Timestamp.now()
        }, { merge: true });
      } catch (e: any) {
        console.error("Failed to write to users collection:", e);
        throw e;
      }
      
      console.log(`Writing dealer record for ${formData.email}...`);
      try {
        await setDoc(doc(db, "dealers", formData.email), {
          email: formData.email,
          dealerName: formData.dealerName,
          dealershipName: formData.dealershipName,
          phone: formData.phone,
          address: "India",
          uid: userUid,
          isVerified: true,
          createdAt: Timestamp.now()
        }, { merge: true });
      } catch (e: any) {
        console.error("Failed to write to dealers collection:", e);
        throw e;
      }
      
      showToast(`Dealer ${formData.dealerName} added successfully!`, 'success');
      setIsAddModalOpen(false);
      setFormData({ dealerName: '', dealershipName: '', email: '', phone: '' });
      
    } catch (error: any) {
      console.error(error);
      showToast(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDealer = async (email: string) => {
    if (window.confirm('Are you sure you want to delete this dealer?')) {
      try {
        await deleteDoc(doc(db, 'dealers', email));
        await deleteDoc(doc(db, 'users', email));
        showToast('Dealer deleted successfully', 'success');
      } catch (error: any) {
        showToast(error.message, 'error');
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manage Dealers</h1>
          <p className="text-slate-500 mt-1">Add, verify, and manage your network of automotive dealers.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 text-sm font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
        >
          <Plus size={20} />
          Add Dealer
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Dealer Info</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Dealership</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dealers.map((dealer) => (
                  <tr key={dealer.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl border p-2 flex items-center justify-center bg-slate-50 overflow-hidden shadow-sm">
                           <ShieldCheck size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{dealer.dealerName}</p>
                          <p className="text-xs text-slate-400 font-medium">ID: {dealer.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-bold text-slate-700">{dealer.dealershipName || dealer.dealership}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} /> {dealer.address || 'India'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-slate-600 flex items-center gap-1">
                        <Mail size={14} className="text-slate-400" /> {dealer.email}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{dealer.phone}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 w-fit ${
                        dealer.isVerified 
                          ? "bg-green-50 text-green-700 border-green-200" 
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {dealer.isVerified && <ShieldCheck size={12} />}
                        {dealer.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteDealer(dealer.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {dealers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500 font-medium">
                      No dealers found. Add your first dealer to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => !submitting && setIsAddModalOpen(false)}
        title="Add New Dealer"
        footer={
          <>
            <button 
              disabled={submitting}
              onClick={() => setIsAddModalOpen(false)} 
              className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              disabled={submitting}
              onClick={handleCreateDealer}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-black shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:opacity-70 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating...
                </>
              ) : 'Create Dealer'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Dealer Name</label>
            <input 
              type="text" 
              value={formData.dealerName}
              onChange={(e) => setFormData({ ...formData, dealerName: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="e.g. John Doe" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Dealership Name</label>
            <input 
              type="text" 
              value={formData.dealershipName}
              onChange={(e) => setFormData({ ...formData, dealershipName: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="e.g. Toyota Motors Mumbai" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="john@example.com" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Phone</label>
              <input 
                type="tel" 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="+91 9999999999" 
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
