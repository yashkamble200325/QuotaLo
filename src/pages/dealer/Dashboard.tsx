import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Car, 
  CalendarCheck, 
  Calendar,
  FileText, 
  Clock
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { getCars } from '../../services/carService';
import { getBookingsByDealer } from '../../services/bookingService';
import { getQuotationsByDealer } from '../../services/quotationService';
import { useAuth } from '../../contexts/AuthContext';
import { Booking } from '../../types';

export default function Dashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [carCount, setCarCount] = useState(0);
  const [quoteCount, setQuoteCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!user || user.role !== 'dealer') return;
      try {
        const dealerId = user.dealerId || user.email; // Fallback to email if dealerId is missing
        const [bResponse, qResponse, cData] = await Promise.all([
          getBookingsByDealer(dealerId, user.email),
          getQuotationsByDealer(dealerId, user.email),
          getCars(),
        ]);
        
        if (bResponse.success) {
          setBookings(bResponse.bookings as Booking[]);
        }
        
        if (qResponse.success) {
          setQuoteCount(qResponse.quotations.length);
        }
        
        setCarCount(cData?.length || 0);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const stats = [
    { label: 'Total Cars', value: carCount.toString(), icon: Car, color: 'text-blue-600', bg: 'bg-blue-50', path: '/dealer/my-cars' },
    { label: 'Test Drive Requests', value: bookings.length.toString(), icon: CalendarCheck, color: 'text-purple-600', bg: 'bg-purple-50', path: '/dealer/bookings' },
    { label: 'Total Quotations', value: quoteCount.toString(), icon: FileText, color: 'text-green-600', bg: 'bg-green-50', path: '/dealer/quotations' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dealer Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your inventory and customer requests.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="card p-6 cursor-pointer hover:shadow-lg transition-all border border-transparent hover:border-slate-100"
            onClick={() => navigate(stat.path)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn(stat.bg, stat.color, "p-3 rounded-xl")}>
                <stat.icon size={24} />
              </div>
              <span className="text-green-600 flex items-center text-[10px] font-bold bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Active
              </span>
            </div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.label}</h3>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Recent Test Drive Requests</h3>
          <button 
            onClick={() => navigate('/dealer/bookings')}
            className="text-xs font-bold text-primary hover:underline uppercase tracking-wider"
          >
            View All
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.slice(0, 4).map((booking) => (
            <div key={booking.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex gap-4 hover:border-slate-200 transition-colors">
              <div className="bg-white h-12 w-12 min-w-[48px] rounded-lg flex items-center justify-center text-primary shadow-sm border border-slate-100">
                <Clock size={24} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{booking.userName}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">{booking.userEmail}</p>
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                    (booking.status === 'Completed' || booking.status === 'completed') ? "bg-green-50 text-green-700 border-green-200" : 
                    (booking.status === 'Confirmed' || booking.status === 'confirmed') ? "bg-blue-50 text-blue-700 border-blue-200" : 
                    "bg-amber-50 text-amber-700 border-amber-200"
                  )}>
                    {booking.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Car size={12} className="text-primary" />
                  <p className="text-xs text-slate-700 font-bold">{booking.carName}</p>
                </div>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <Calendar size={10} />
                    <span>{booking.bookingDate instanceof Date ? booking.bookingDate.toLocaleDateString() : (booking.bookingDate?.seconds ? new Date(booking.bookingDate.seconds * 1000).toLocaleDateString() : booking.bookingDate || booking.date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={10} />
                    <span>{booking.timeSlot || booking.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {bookings.length === 0 && (
            <div className="col-span-2 text-center py-8 text-slate-400 text-sm">
              No test drive requests received yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
