import React from 'react';
import { motion } from 'motion/react';
import { Car } from '../types';
import { IndianRupee, Fuel, Settings2, ShieldCheck, MapPin } from 'lucide-react';

interface CarCardProps {
  car: Car;
  onClick: (car: Car) => void;
  key?: React.Key;
}

export default function CarCard({ car, onClick }: CarCardProps) {
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(car.price);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="card overflow-hidden group cursor-pointer transition-all hover:shadow-md"
      onClick={() => onClick(car)}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={car.image}
          alt={car.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100 flex items-center gap-1.5">
          <ShieldCheck size={12} className="text-emerald-500" />
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Verified</span>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">
            {car.name}
          </h3>
          <p className="text-xs text-slate-400 flex items-center gap-1 font-medium">
            <MapPin size={12} /> {car.dealer}
          </p>
        </div>

        <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-50">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Fuel size={14} className="text-slate-400" />
            <span className="text-xs font-semibold">{car.fuelType}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <Settings2 size={14} className="text-slate-400" />
            <span className="text-xs font-semibold">{car.transmission}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Price Point</p>
            <p className="text-lg font-bold text-slate-900">
              {formattedPrice}
            </p>
          </div>
          <button
            className="btn-primary py-2 px-4 !rounded-lg text-xs font-bold uppercase tracking-wider"
          >
            Quotation
          </button>
        </div>
      </div>
    </motion.div>
  );
}
