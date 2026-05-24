import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Store, 
  Car, 
  CalendarCheck, 
  TrendingUp, 
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { getCars, getDealers } from '../../services/carService';
import { getAllBookings } from '../../services/bookingService';
import { useAuth } from '../../contexts/AuthContext';
import { Booking } from '../../types';

export default function Dashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [carCount, setCarCount] = useState(0);
  const [dealerCount, setDealerCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bResponse, cData, dData] = await Promise.all([
          getAllBookings(),
          getCars(),
          getDealers()
        ]);
        if (bResponse.success) {
          setBookings(bResponse.bookings as Booking[]);
        }
        setCarCount(cData?.length || 0);
        setDealerCount(dData?.length || 0);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Total Dealers', value: dealerCount.toString(), change: '+2', color: 'text-blue-600', trend: 'text-green-600' },
    { label: 'Total Cars', value: carCount.toString(), change: 'Live', color: 'text-indigo-600', trend: 'text-indigo-600' },
    { label: 'Active Users', value: '12', change: 'Growth', color: 'text-emerald-600', trend: 'text-green-600' },
    { label: 'Bookings', value: bookings.length.toString(), change: 'Requests', color: 'text-orange-600', trend: 'text-orange-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-500 mt-1 text-sm">Welcome back. Here's what's happening today.</p>
        </div>
        <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm hover:bg-slate-50 transition-all">
          Download Report
          <TrendingUp size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card p-6"
          >
            <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</div>
            <div className="text-3xl font-bold tracking-tight text-slate-900">{stat.value}</div>
            <div className={cn("text-[11px] font-semibold mt-3 flex items-center gap-1", stat.trend)}>
              {stat.change} <ArrowUpRight size={12} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Recent Bookings</h3>
            <button className="text-xs font-bold text-primary uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Booking ID</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">User</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Car</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.slice(0, 5).map((booking) => (
                  <tr key={booking.id || booking.bookingId} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">#{booking.id || booking.bookingId}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{booking.userName}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{booking.carName}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                        (booking.status === 'Completed' || booking.status === 'completed') ? "bg-green-50 text-green-700 border-green-100" :
                        (booking.status === 'Confirmed' || booking.status === 'confirmed') ? "bg-blue-50 text-blue-700 border-blue-100" :
                        "bg-orange-50 text-orange-700 border-orange-100"
                      )}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {booking.bookingDate instanceof Date ? booking.bookingDate.toLocaleDateString() : (booking.bookingDate?.seconds ? new Date(booking.bookingDate.seconds * 1000).toLocaleDateString() : booking.bookingDate || booking.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {[
              { type: 'New Dealer', name: 'Toyota Motors Joined', time: '2h ago', icon: Store, color: 'text-blue-600', bg: 'bg-blue-50' },
              { type: 'Registration', name: 'User yash@example.com Registered', time: '5h ago', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
              { type: 'Inventory', name: 'New Car Added: Honda CR-V', time: '1d ago', icon: Car, color: 'text-purple-600', bg: 'bg-purple-50' },
              { type: 'Booking', name: 'New Test Drive for Tata Harrier', time: '2d ago', icon: CalendarCheck, color: 'text-orange-600', bg: 'bg-orange-50' },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4">
                <div className={cn("h-10 w-10 min-w-[40px] rounded-lg flex items-center justify-center border border-slate-100", activity.bg, activity.color)}>
                  <activity.icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{activity.name}</p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Clock size={12} /> {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
