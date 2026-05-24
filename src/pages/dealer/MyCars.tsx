import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, IndianRupee, Fuel, Settings2, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import Modal from '../../components/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Car, Dealer } from '../../types';
import { getCars, upsertCar, deleteCar, getDealers, getCarsByDealer } from '../../services/carService';

export default function MyCars() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [currentDealer, setCurrentDealer] = useState<Dealer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user }: any = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const allDealers = (await getDealers()) as any[];
        
        const dealerObj = allDealers?.find((d: any) => d.email === user.email);
        if (dealerObj) {
          setCurrentDealer(dealerObj);
          const dealerCars = await getCarsByDealer(dealerObj.email || dealerObj.id || user.email);
          setCars(dealerCars as Car[]);
        }
      } catch (error) {
        console.error(error);
        showToast('Failed to load inventory', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDealer) return;

    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      
      const carData: Partial<Car> = {
        name: formData.get('name') as string,
        brand: currentDealer.dealerName || currentDealer.name || 'Unknown',
        variant: formData.get('variant') as string,
        price: Number(formData.get('price')) || 0,
        baseExShowroomPrice: Number(formData.get('price')) || 0,
        rtoCharges: Number(formData.get('rtoCharges')) || 0,
        insuranceAmount: Number(formData.get('insuranceAmount')) || 0,
        fastagCharges: Number(formData.get('fastagCharges')) || 0,
        handlingCharges: Number(formData.get('handlingCharges')) || 0,
        accessoriesPackage: Number(formData.get('accessoriesPackage')) || 0,
        extendedWarranty: Number(formData.get('extendedWarranty')) || 0,
        discountOffer: Number(formData.get('discountOffer')) || 0,
        exchangeBonus: Number(formData.get('exchangeBonus')) || 0,
        corporateDiscount: Number(formData.get('corporateDiscount')) || 0,
        fuelType: formData.get('fuelType') as string,
        transmission: formData.get('transmission') as string,
        engine: formData.get('engine') as string,
        seating: formData.get('seating') as string,
        stockStatus: 'In Stock',
        image: formData.get('image') as string,
        dealer: currentDealer.dealershipName || currentDealer.dealership || currentDealer.dealerName || currentDealer.name || '',
        dealerId: currentDealer.email,
        dealerEmail: currentDealer.email,
        ...(editingCar?.id ? { id: editingCar.id } : {})
      };

      await upsertCar(carData as Car);
      showToast(editingCar ? 'Car updated successfully!' : 'Car added to inventory!', 'success');
      setIsModalOpen(false);
      setEditingCar(null);
      // Refresh cars
      const freshCars = await getCarsByDealer(currentDealer.email || currentDealer.id);
      setCars(freshCars as Car[]);
    } catch (error) {
      showToast('Failed to save car', 'error');
    }
  };

  const handleDelete = async (carId: string) => {
    if (!confirm('Are you sure you want to remove this vehicle from inventory?')) return;
    try {
      await deleteCar(carId);
      setCars(cars.filter(c => c.id !== carId));
      showToast('Vehicle removed from inventory', 'success');
    } catch (error) {
      showToast('Failed to delete vehicle', 'error');
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center font-black text-slate-400 uppercase tracking-widest animate-pulse">Accessing Secure Inventory...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Showroom Inventory Listing</h1>
          <p className="text-slate-500 mt-1">Authorized Dealership: <span className="font-bold text-blue-600">{currentDealer?.dealershipName || currentDealer?.dealership || currentDealer?.dealerName || user.name}</span></p>
        </div>
        <button 
          onClick={() => { setEditingCar(null); setIsModalOpen(true); }}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center gap-2 text-sm font-black shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all cursor-pointer"
        >
          <Plus size={20} /> Add New Car
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cars.map((car) => (
          <div key={car.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300">
            <div className="relative aspect-[16/10]">
              <img src={car.image} alt={car.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${
                car.stockStatus === 'In Stock' ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
              }`}>
                {car.stockStatus || 'In Stock'}
              </div>
              <div className="absolute bottom-4 left-6">
                <h3 className="text-xl font-black text-white leading-tight">{car.name}</h3>
                <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest">{car.variant}</p>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-1 text-slate-900 font-black text-xl">
                  <IndianRupee size={18} className="text-blue-600" />
                  {new Intl.NumberFormat('en-IN').format(car.price)}
                </div>
                <div className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase rounded-lg">
                  Professional Config
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fuel Type</span>
                  <span className="text-xs font-black text-slate-700 flex items-center gap-1.5"><Fuel size={12} className="text-blue-500" /> {car.fuelType}</span>
                </div>
                <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Transmission</span>
                  <span className="text-xs font-black text-slate-700 flex items-center gap-1.5"><Settings2 size={12} className="text-blue-500" /> {car.transmission}</span>
                </div>
              </div>

              <div className="mt-auto flex gap-3">
                <button 
                  onClick={() => { setEditingCar(car); setIsModalOpen(true); }}
                  className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-md hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Edit2 size={16} /> Edit Details
                </button>
                <button 
                  onClick={() => car.id && handleDelete(car.id)}
                  className="p-3 bg-red-50 text-red-500 border border-red-100 rounded-xl hover:bg-red-100 transition-all cursor-pointer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {cars.length === 0 && (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
             <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 shadow-sm border border-slate-100">
                <ImageIcon size={40} />
             </div>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Your inventory is empty</p>
             <button 
               onClick={() => setIsModalOpen(true)}
               className="mt-6 text-blue-600 font-black text-xs uppercase tracking-widest hover:underline cursor-pointer"
             >
               Add your first vehicle listing
             </button>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingCar(null); }}
        title={editingCar ? "Edit Vehicle Details" : "Add Professional Listing"}
        className="max-w-4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-8 max-h-[70vh] overflow-y-auto px-1">
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-4">
             <div className="flex items-center gap-3 mb-4">
               <ShieldCheck size={20} className="text-blue-600" />
               <h4 className="text-blue-900 font-black text-xs uppercase tracking-widest">Listing Requirements</h4>
             </div>
             <p className="text-blue-700/70 text-[11px] font-bold leading-relaxed uppercase">
                Ensure all pricing fields are accurate. These values will be used to generate official on-road price quotations for customers.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2 border-slate-100">Vehicle Info</h5>
               <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Car Model & Name</label>
                <input name="name" type="text" required defaultValue={editingCar?.name} className="w-full px-5 py-3 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none font-bold text-sm" placeholder="e.g. Toyota Fortuner Legender" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Variant</label>
                  <input name="variant" type="text" required defaultValue={editingCar?.variant} className="w-full px-5 py-3 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none font-bold text-sm" placeholder="Top End / Luxury" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Display price</label>
                  <input name="price" type="number" required defaultValue={editingCar?.price} className="w-full px-5 py-3 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none font-bold text-sm" placeholder="2800000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Fuel Type</label>
                  <select name="fuelType" defaultValue={editingCar?.fuelType} className="w-full px-5 py-3 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none font-bold text-sm bg-white">
                    <option>Petrol</option>
                    <option>Diesel</option>
                    <option>Hybrid</option>
                    <option>Electric</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Transmission</label>
                  <select name="transmission" defaultValue={editingCar?.transmission} className="w-full px-5 py-3 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none font-bold text-sm bg-white">
                    <option>Automatic</option>
                    <option>Manual</option>
                    <option>iMT</option>
                    <option>CVT</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Engine Size</label>
                  <input name="engine" type="text" defaultValue={editingCar?.engine} className="w-full px-5 py-3 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none font-bold text-sm" placeholder="2498cc" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Seating</label>
                  <input name="seating" type="text" defaultValue={editingCar?.seating} className="w-full px-5 py-3 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none font-bold text-sm" placeholder="7 Seater" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">High-Res Image URL</label>
                <input name="image" type="url" required defaultValue={editingCar?.image} className="w-full px-5 py-3 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none font-bold text-sm" placeholder="https://..." />
              </div>
            </div>

            <div className="space-y-6">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2 border-slate-100">Professional Quotation Pricing</h5>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Ex-Showroom Price</label>
                  <input name="baseExShowroomPrice" type="number" required defaultValue={editingCar?.baseExShowroomPrice || editingCar?.price} className="w-full px-5 py-3 border-2 border-slate-100 rounded-xl focus:border-emerald-500 outline-none font-bold text-sm" placeholder="2500000" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">RTO Charges</label>
                  <input name="rtoCharges" type="number" required defaultValue={editingCar?.rtoCharges || 0} className="w-full px-5 py-3 border-2 border-slate-100 rounded-xl focus:border-emerald-500 outline-none font-bold text-sm" placeholder="250000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Insurance Amount</label>
                  <input name="insuranceAmount" type="number" required defaultValue={editingCar?.insuranceAmount || 0} className="w-full px-5 py-3 border-2 border-slate-100 rounded-xl focus:border-emerald-500 outline-none font-bold text-sm" placeholder="125000" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Fastag Charges</label>
                  <input name="fastagCharges" type="number" defaultValue={editingCar?.fastagCharges || 500} className="w-full px-5 py-3 border-2 border-slate-100 rounded-xl focus:border-emerald-500 outline-none font-bold text-sm" placeholder="1100" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Handling Charges</label>
                  <input name="handlingCharges" type="number" defaultValue={editingCar?.handlingCharges || 5000} className="w-full px-5 py-3 border-2 border-slate-100 rounded-xl focus:border-emerald-500 outline-none font-bold text-sm" placeholder="5000" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Accessories Pkg</label>
                  <input name="accessoriesPackage" type="number" defaultValue={editingCar?.accessoriesPackage || 0} className="w-full px-5 py-3 border-2 border-slate-100 rounded-xl focus:border-emerald-500 outline-none font-bold text-sm" placeholder="35000" />
                </div>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                 <h6 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-3">Consumer Benefits (Deductions)</h6>
                 <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-emerald-600/70 uppercase tracking-widest ml-1">Discount</label>
                      <input name="discountOffer" type="number" defaultValue={editingCar?.discountOffer || 0} className="w-full px-3 py-2 border border-emerald-200 rounded-lg outline-none font-bold text-xs bg-white focus:ring-1 focus:ring-emerald-500" placeholder="0" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-emerald-600/70 uppercase tracking-widest ml-1">Exchange</label>
                      <input name="exchangeBonus" type="number" defaultValue={editingCar?.exchangeBonus || 0} className="w-full px-3 py-2 border border-emerald-200 rounded-lg outline-none font-bold text-xs bg-white focus:ring-1 focus:ring-emerald-500" placeholder="0" />
                   </div>
                 </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t flex justify-end gap-x-4">
             <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest bg-transparent cursor-pointer">Discard</button>
             <button type="submit" className="bg-slate-900 text-white px-10 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
                {editingCar ? 'Update Listing' : 'Authenticate & List Car'}
             </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
