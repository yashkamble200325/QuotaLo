import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { Booking } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Check, X, Loader2 } from 'lucide-react';

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const dealerEmail = user.email.toLowerCase();
    console.log("Fetching bookings for dealer email:", dealerEmail);

    try {
      const bookingsRef = collection(db, "bookings");
      
      // Perform parallel queries to cover cases where dealer is identified by either dealerId or dealerEmail
      const [snap1, snap2] = await Promise.all([
        getDocs(query(bookingsRef, where("dealerId", "==", dealerEmail))),
        getDocs(query(bookingsRef, where("dealerEmail", "==", dealerEmail)))
      ]);
      
      const combinedDocs = [...snap1.docs, ...snap2.docs];
      const uniqueDocsMap = new Map();
      combinedDocs.forEach(doc => {
        uniqueDocsMap.set(doc.id, { id: doc.id, ...doc.data() });
      });
      
      const bookingsList = Array.from(uniqueDocsMap.values()) as Booking[];
      console.log(`Found ${bookingsList.length} unique bookings for dealer: ${dealerEmail}`);
      setBookings(bookingsList);
    } catch (error: any) {
      console.error("Error fetching bookings:", error);
      showToast(error.message || "Failed to fetch bookings", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId: string | undefined, newStatus: string) => {
    if (!bookingId) return;
    setUpdatingId(bookingId);
    try {
      const docRef = doc(db, "bookings", bookingId);
      await updateDoc(docRef, {
        status: newStatus,
        updatedAt: Timestamp.now()
      });
      showToast(`Booking ${newStatus} successfully!`, 'success');
      // Update local state
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus as any } : b));
    } catch (error: any) {
      console.error("Error updating booking:", error);
      showToast(error.message || "Failed to update status", 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="p-6 text-center bg-white rounded-xl shadow-sm border border-slate-100 mt-8">
        <div className="text-slate-400 text-6xl mb-4">📅</div>
        <h3 className="text-xl font-semibold text-slate-900">No test drive requests yet</h3>
        <p className="text-slate-500 mt-2">
          When customers book test drives, they will appear here.
        </p>
        <button 
          onClick={fetchBookings}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Test Drive Requests</h1>
        <button 
          onClick={fetchBookings}
          className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
        >
          Refresh
        </button>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{booking.carName}</h3>
                  <p className="text-blue-600 text-sm font-medium">{booking.carVariant}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  booking.status?.toLowerCase() === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  booking.status?.toLowerCase() === 'confirmed' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                  booking.status?.toLowerCase() === 'completed' ? 'bg-green-50 text-green-700 border border-green-200' :
                  'bg-slate-50 text-slate-700 border border-slate-200'
                }`}>
                  {booking.status || 'pending'}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="font-semibold w-24 text-slate-400">Customer:</span>
                  <span className="text-slate-900 font-medium">{booking.userName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="font-semibold w-24 text-slate-400">Phone:</span>
                  <span className="text-slate-900">{booking.userPhone || booking.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="font-semibold w-24 text-slate-400">Date:</span>
                  <span className="text-slate-900">
                    {booking.bookingDate?.toDate?.() ? booking.bookingDate.toDate().toLocaleDateString() : 
                     (booking.bookingDate?.seconds ? new Date(booking.bookingDate.seconds * 1000).toLocaleDateString() : 
                      (booking.bookingDate || booking.date || 'Pending'))}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="font-semibold w-24 text-slate-400">Time:</span>
                  <span className="text-slate-900">{booking.timeSlot || booking.time}</span>
                </div>
              </div>
            </div>

            {booking.status?.toLowerCase() === 'pending' && (
              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center gap-2 justify-end">
                <button
                  disabled={updatingId !== null}
                  onClick={() => handleUpdateStatus(booking.id, 'Cancelled')}
                  className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-bold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  disabled={updatingId !== null}
                  onClick={() => handleUpdateStatus(booking.id, 'Confirmed')}
                  className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 text-sm font-bold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Check size={16} />
                  Confirm
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
