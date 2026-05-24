import React, { useState, useEffect } from 'react';
import { Search, Filter, IndianRupee, Fuel, Settings2, ShieldCheck, Calendar, Clock, Phone, Store, ReceiptText, Calculator, Info } from 'lucide-react';
import { Car, Dealer } from '../../types';
import CarCard from '../../components/CarCard';
import { CarCardSkeleton } from '../../components/Skeleton';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'motion/react';
import { getCars, getDealers } from '../../services/carService';
import { createBooking } from '../../services/bookingService';
import { calculatePriceBreakdown, calculateEMI } from '../../utils/priceCalculator';
import { generateQuotation } from '../../services/quotationService';

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const { showToast } = useToast();
  const { user } = useAuth();
  
  // EMI State
  const [emiTenure, setEmiTenure] = useState(5);
  const [emiRate, setEmiRate] = useState(8.5);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [firestoreCars, firestoreDealers] = await Promise.all([
          getCars(),
          getDealers()
        ]);
        if (firestoreCars) setCars(firestoreCars as Car[]);
        if (firestoreDealers) setDealers(firestoreDealers as Dealer[]);
      } catch (error) {
        console.error(error);
        showToast('Failed to fetch data', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [showToast]);

  const filteredCars = cars.filter(car => 
    car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.dealer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedCar) return;

    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      
      const dealer = dealers.find(d => 
        (selectedCar.dealerId && d.id === selectedCar.dealerId) || 
        (d.dealership === selectedCar.dealer)
      );

      const bookingData = {
        userId: user.email.toLowerCase(),
        userEmail: user.email.toLowerCase(),
        userName: user.name || user.email.split('@')[0],
        userPhone: formData.get('phone') as string,
        carId: selectedCar.id!,
        carName: selectedCar.name,
        carVariant: selectedCar.variant || 'Standard',
        dealerId: (selectedCar.dealerId || dealer?.id || 'unknown').toLowerCase(),
        dealerName: selectedCar.dealer,
        dealerEmail: (dealer?.email || `${selectedCar.dealerId || 'unknown'}@quotalo.com`).toLowerCase(),
        dealershipName: dealer?.dealership || selectedCar.dealer,
        bookingDate: formData.get('date') as string,
        timeSlot: formData.get('time') as string,
        testDriveType: (formData.get('loc') as string).toLowerCase() as 'showroom' | 'home',
        message: ''
      };

      const response = await createBooking(bookingData);
      if (response.success) {
        showToast('Test drive booked successfully!', 'success');
        setIsBookingModalOpen(false);
        setSelectedCar(null);
      } else {
        showToast(response.error || 'Failed to book test drive', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Failed to book test drive', 'error');
    }
  };

  const handleQuotation = async () => {
    if (!user || !selectedCar) return;
    
    const dealer = dealers.find(d => 
      d.email === selectedCar.dealerEmail || 
      d.email === selectedCar.dealerId ||
      d.dealershipName === selectedCar.dealer ||
      d.dealership === selectedCar.dealer ||
      d.dealerName === selectedCar.dealer
    ) || {
      id: selectedCar.dealerId || 'default',
      name: selectedCar.dealer || 'Authorized Dealer',
      dealershipName: selectedCar.dealer || 'Authorized Dealer',
      dealership: selectedCar.dealer || 'Authorized Dealer',
      email: selectedCar.dealerEmail || selectedCar.dealerId || 'verified@dealer.com',
      status: 'Verified'
    } as unknown as Dealer;

    try {
      showToast('Generating professional quote...', 'info');
      await generateQuotation(selectedCar, dealer, user.email);
      showToast('Professional Quotation generated! Check Financial Records.', 'success');
      setSelectedCar(null);
    } catch (error) {
      console.error(error);
      showToast('Failed to generate professional quotation', 'error');
    }
  };

  const currentBreakdown = selectedCar ? calculatePriceBreakdown(selectedCar) : null;
  const currentEMI = currentBreakdown ? calculateEMI(currentBreakdown.finalOnRoadPrice, emiRate, emiTenure) : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Hero Section */}
      <div className="relative h-64 rounded-3xl overflow-hidden group shadow-lg shadow-slate-200 mb-12">
        <img 
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1600" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          alt="Hero"
        />
        <div className="absolute inset-0 bg-slate-900/40 flex flex-col justify-center px-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl font-black text-white leading-tight tracking-tight">
              Premium Mobility <br />Refined.
            </h1>
            <p className="text-white/80 mt-4 text-sm font-medium max-w-md uppercase tracking-widest">
              Verified dealers • Instant quotations • Seamless bookings
            </p>
          </motion.div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-2 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-3 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by model, brand or dealer..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-slate-200 transition-all outline-none text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {['Price', 'Fuel', 'Trans'].map((filter) => (
            <button key={filter} className="flex-1 md:flex-none px-4 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider border border-transparent hover:border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer">
              {filter} <Filter size={14} />
            </button>
          ))}
        </div>
      </div>

      {/* Car Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <CarCardSkeleton key={i} />)
        ) : (
          filteredCars.map((car) => (
            <CarCard key={car.id} car={car} onClick={(c) => setSelectedCar(c)} />
          ))
        )}
        {!isLoading && filteredCars.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm font-medium">
            No vehicles match your search query.
          </div>
        )}
      </div>

      {/* Car Details Modal */}
      <Modal
        isOpen={!!selectedCar}
        onClose={() => setSelectedCar(null)}
        title="Vehicle Specifications"
        className="max-w-5xl"
      >
        {selectedCar && currentBreakdown && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-h-[70vh] overflow-y-auto px-1">
            <div className="lg:col-span-5 space-y-6 animate-in fade-in duration-300">
              <div className="aspect-[16/10] rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
                <img src={selectedCar.image} className="w-full h-full object-cover" alt={selectedCar.name} />
              </div>
              
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                <h4 className="text-slate-900 font-black mb-4 flex items-center gap-2 text-xs uppercase tracking-widest border-b pb-2 border-slate-200">
                  <ShieldCheck size={18} className="text-blue-600" /> Professional Price Breakdown
                </h4>
                <div className="space-y-2.5 text-[11px] font-bold">
                  <div className="flex justify-between text-slate-500">
                    <span>Ex-Showroom Price</span>
                    <span>₹{new Intl.NumberFormat('en-IN').format(currentBreakdown.baseExShowroomPrice)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>RTO & Registration</span>
                    <span>₹{new Intl.NumberFormat('en-IN').format(currentBreakdown.rtoCharges)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Comprehensive Insurance</span>
                    <span>₹{new Intl.NumberFormat('en-IN').format(currentBreakdown.insuranceAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Fastag & Handling</span>
                    <span>₹{new Intl.NumberFormat('en-IN').format(currentBreakdown.fastagCharges + currentBreakdown.handlingCharges)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Accessories & Warranty</span>
                    <span>₹{new Intl.NumberFormat('en-IN').format(currentBreakdown.accessoriesPackage + (currentBreakdown.extendedWarranty || 0))}</span>
                  </div>
                  
                  <div className="h-[1px] bg-slate-200 my-2" />
                  
                  <div className="flex justify-between text-emerald-600 italic">
                    <span className="flex items-center gap-1 uppercase tracking-tighter">Total Benefit/Offers</span>
                    <span>- ₹{new Intl.NumberFormat('en-IN').format(currentBreakdown.totalDiscount)}</span>
                  </div>
                  
                  <div className="h-[2px] bg-blue-100 my-1" />
                  
                  <div className="flex justify-between text-slate-900 font-black text-base pt-2">
                    <span className="uppercase tracking-tighter">On-Road Balance</span>
                    <span className="text-blue-600">₹{new Intl.NumberFormat('en-IN').format(currentBreakdown.finalOnRoadPrice)}</span>
                  </div>
                  <div className="bg-blue-50/50 p-2 rounded-lg border border-blue-100 flex items-center gap-2 text-[9px] text-blue-500 mt-2">
                    <Info size={12} />
                    <span>Calculated with current verified dealer rates.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-8 animate-in fade-in duration-300">
              <div>
                <div className="flex items-center justify-between">
                   <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedCar.name}</h2>
                   <div className="bg-slate-50 border px-3 py-1 rounded-full text-[10px] font-black uppercase text-slate-400">
                      {selectedCar.stockStatus || 'In Stock'}
                   </div>
                </div>
                <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-[10px]">{selectedCar.variant}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Fuel Type', value: selectedCar.fuelType, icon: Fuel },
                  { label: 'Transmission', value: selectedCar.transmission, icon: Settings2 },
                  { label: 'Engine', value: selectedCar.engine || '2.0L Turbo', icon: Settings2 },
                  { label: 'Seats', value: selectedCar.seating || '5 Seater', icon: Settings2 },
                ].map(spec => (
                  <div key={spec.label} className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{spec.label}</p>
                    <p className="text-xs font-black text-slate-800">
                       {spec.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* EMI Calculator */}
              <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16 pointer-events-none" />
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                    <Calculator size={20} />
                  </div>
                  <div>
                    <h4 className="text-white font-black text-sm uppercase tracking-widest">EMI Calculator</h4>
                    <p className="text-slate-400 text-[10px] font-bold">Plan your vehicle ownership</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase">Tenure ({emiTenure} Years)</label>
                      </div>
                      <input 
                        type="range" min="1" max="7" step="1"
                        value={emiTenure}
                        onChange={(e) => setEmiTenure(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase">Interest Rate ({emiRate}%)</label>
                      </div>
                      <input 
                        type="range" min="6" max="15" step="0.1"
                        value={emiRate}
                        onChange={(e) => setEmiRate(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                      />
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center">
                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Estimated Monthly EMI</p>
                    <p className="text-3xl font-black text-white">₹{currentEMI.toLocaleString()}</p>
                    <p className="text-blue-500 text-[10px] font-bold mt-1">@ {emiRate}% for {emiTenure} years</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 flex items-center justify-center shadow-sm">
                     <Store size={24} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dealer Partner</p>
                    <p className="text-sm font-black text-slate-900">{selectedCar.dealer}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 font-black text-xs uppercase bg-white border px-3 py-1.5 rounded-lg shadow-sm">
                   <ShieldCheck size={16} /> Verified
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={handleQuotation}
                  className="flex-1 bg-white border-2 border-slate-900 text-slate-900 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                   <ReceiptText size={18} />
                   Generate Quotation
                </button>
                <button 
                  onClick={() => setIsBookingModalOpen(true)}
                  className="flex-1 btn-primary py-4 !rounded-xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                   <Calendar size={18} />
                   Book Test Drive
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Booking Modal */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        title="Schedule Test Drive"
        footer={
          <div className="flex w-full gap-3">
            <button onClick={() => setIsBookingModalOpen(false)} className="flex-1 px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-widest border rounded-xl bg-transparent cursor-pointer">Cancel</button>
            <button form="booking-form" type="submit" className="flex-1 btn-primary px-8 py-3 !rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 cursor-pointer">Schedule Now</button>
          </div>
        }
      >
        <form id="booking-form" onSubmit={handleBooking} className="space-y-6">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
             <div className="w-16 h-10 rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm">
                <img src={selectedCar?.image} className="w-full h-full object-cover" alt="" />
             </div>
             <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Scheduling for</p>
                <p className="text-sm font-black text-slate-900">{selectedCar?.name}</p>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Select Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input name="date" type="date" required className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-slate-200 transition-all outline-none font-black text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Select Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <select name="time" required className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-slate-200 transition-all outline-none font-black text-sm">
                   <option>10:00 AM</option>
                   <option>11:00 AM</option>
                   <option>12:00 PM</option>
                   <option>02:00 PM</option>
                   <option>04:00 PM</option>
                </select>
              </div>
            </div>
          </div>

          <div>
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
             <div className="relative">
                <Phone className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input name="phone" type="tel" required placeholder="+91 XXXX XXX XXX" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-slate-200 transition-all outline-none font-black text-sm" />
              </div>
          </div>

          <div>
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Location preference</label>
             <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-2xl cursor-pointer hover:border-slate-400 has-[:checked]:border-slate-900 has-[:checked]:bg-slate-900 has-[:checked]:text-white transition-all group shadow-sm">
                   <input type="radio" name="loc" value="Showroom" className="hidden" defaultChecked />
                   <span className="text-xs font-black uppercase tracking-wider mx-auto">Showroom Visit</span>
                </label>
                <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-2xl cursor-pointer hover:border-slate-400 has-[:checked]:border-slate-900 has-[:checked]:bg-slate-900 has-[:checked]:text-white transition-all group shadow-sm">
                   <input type="radio" name="loc" value="Home" className="hidden" />
                   <span className="text-xs font-black uppercase tracking-wider mx-auto">Home Delivery</span>
                </label>
             </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
