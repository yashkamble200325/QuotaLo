import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Phone, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getAllBookings, updateBookingStatus } from '../../services/bookingService';
import { Booking } from '../../types';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;
    try {
      const response = await getAllBookings();
      if (response.success) {
        setBookings(response.bookings as Booking[]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: Booking['status']) => {
    try {
      await updateBookingStatus(id, status as any);
      showToast(`Booking ${status} successfully`, 'success');
      fetchBookings();
    } catch (error) {
      showToast('Failed to update booking', 'error');
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest">Aggregating test drives...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Test Drive Bookings</h1>
        <p className="text-slate-500 mt-1">Monitor and manage test drive requests across the platform.</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Booking / User</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Vehicle Details</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Schedule</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-xs font-bold text-primary uppercase tracking-wider">#{(booking.id || '').slice(-6).toUpperCase()}</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">{booking.userName}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Phone size={12} /> {booking.userPhone || booking.phone}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-bold text-slate-700">{booking.carName}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                      <MapPin size={12} /> {booking.dealershipName || booking.dealerName}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar size={14} className="text-slate-400" /> 
                      {booking.bookingDate instanceof Date ? booking.bookingDate.toLocaleDateString() : (booking.bookingDate?.seconds ? new Date(booking.bookingDate.seconds * 1000).toLocaleDateString() : booking.bookingDate || booking.date)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <Clock size={12} /> {booking.timeSlot || booking.time} • <span className="uppercase text-[10px] font-bold">{booking.testDriveType || booking.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                      (booking.status === 'Completed' || booking.status === 'completed') ? "bg-green-50 text-green-700 border-green-200" :
                      (booking.status === 'Confirmed' || booking.status === 'confirmed') ? "bg-blue-50 text-blue-700 border-blue-200" :
                      "bg-amber-50 text-amber-700 border-amber-200"
                    )}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleStatusUpdate(booking.id || '', 'confirmed')}
                        className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(booking.id || '', 'cancelled')}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
