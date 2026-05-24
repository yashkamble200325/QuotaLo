import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Phone, ChevronRight, FileText, Download } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';
import { getBookingsByUser } from '../../services/bookingService';
import { useAuth } from '../../contexts/AuthContext';
import { Booking } from '../../types';

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      try {
        const response = await getBookingsByUser(user.email);
        if (response.success) {
          setBookings(response.bookings as Booking[]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, [user]);

  const getCarImage = (carName: string) => {
    // If we had a way to get actual product image, but for now fallback
    return "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=800";
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest">Identifying your requests...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Test Drives</h1>
        <p className="text-slate-500 mt-1">Track and manage your upcoming and past vehicle test drives.</p>
      </div>

      <div className="space-y-6">
        {bookings.map((booking, i) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group card p-6 md:p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden hover:shadow-md transition-all"
          >
            <div className={`absolute top-0 bottom-0 left-0 w-1 ${
              booking.status === 'Completed' ? 'bg-emerald-500' :
              booking.status === 'Confirmed' ? 'bg-blue-500' :
              'bg-amber-500'
            }`} />

            <div className="w-full md:w-64 h-44 rounded-xl overflow-hidden border border-slate-100 shadow-sm">
              <img src={getCarImage(booking.carName)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={booking.carName} />
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                    (booking.status === 'Completed' || booking.status === 'completed') ? "bg-green-50 text-green-700 border-green-200" :
                    (booking.status === 'Confirmed' || booking.status === 'confirmed') ? "bg-blue-50 text-blue-700 border-blue-200" :
                    "bg-amber-50 text-amber-700 border-amber-200"
                  )}>
                    {booking.status}
                  </span>
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">#{(booking.id || '').slice(-6)}</p>
                </div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors cursor-pointer">{booking.carName}</h3>
                <p className="text-xs text-slate-500 font-bold flex items-center gap-1 mt-1 opacity-80 uppercase tracking-wide">
                   <MapPin size={12} /> {booking.dealershipName || booking.dealerName}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                  <p className="text-xs font-bold text-slate-700 flex items-center gap-2">
                     <Calendar size={12} className="text-slate-400" /> 
                     {booking.bookingDate instanceof Date ? booking.bookingDate.toLocaleDateString() : (booking.bookingDate?.seconds ? new Date(booking.bookingDate.seconds * 1000).toLocaleDateString() : booking.bookingDate || booking.date)}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Time</p>
                  <p className="text-xs font-bold text-slate-700 flex items-center gap-2">
                     <Clock size={12} className="text-slate-400" /> {booking.timeSlot || booking.time}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Type</p>
                  <p className="text-xs font-bold text-slate-700 flex items-center gap-2">
                     <ChevronRight size={12} className="text-slate-400" /> {booking.testDriveType || booking.type}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Contact</p>
                  <p className="text-xs font-bold text-slate-700 flex items-center gap-2 truncate">
                     <Phone size={12} className="text-slate-400" /> {booking.userPhone || booking.phone}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex md:flex-col gap-3 justify-center border-t md:border-t-0 md:border-l pt-6 md:pt-0 md:pl-8 border-slate-50">
               <button className="flex-1 md:flex-none py-2.5 px-4 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider">
                  <FileText size={16} /> Summary
               </button>
               <button 
                onClick={() => alert('PDF report will be downloaded here')}
                className="flex-1 md:flex-none py-2.5 px-4 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider shadow-sm"
               >
                  <Download size={16} /> Receipt
               </button>
            </div>
          </motion.div>
        ))}
      </div>

      {bookings.length === 0 && (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-200">
           <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Calendar size={32} />
           </div>
           <h3 className="text-lg font-bold text-slate-900">No bookings yet</h3>
           <p className="text-slate-500 mt-2 text-sm">Find your favorite car and schedule a test drive today!</p>
           <button className="mt-8 btn-primary px-8">Explore Cars</button>
        </div>
      )}
    </div>
  );
}
