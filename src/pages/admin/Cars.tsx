import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Filter, IndianRupee } from 'lucide-react';
import Modal from '../../components/Modal';
import { getCars, getDealers, upsertCar, deleteCar } from '../../services/carService';
import { Car, Dealer } from '../../types';
import { useToast } from '../../context/ToastContext';

export default function Cars() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [carsData, dealersData] = await Promise.all([
        getCars(),
        getDealers()
      ]);
      setCars(carsData as Car[] || []);
      setDealers(dealersData as Dealer[] || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCar = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    // Ensure we have a valid dealer ID and email
    const selectedDealerEmail = formData.get('dealer') as string;
    const selectedDealer = dealers.find(d => d.email === selectedDealerEmail);
    const dealerId = selectedDealer?.email || selectedDealerEmail; // dealerId is set to the selected dealer's email
    const dealerEmail = selectedDealer?.email || selectedDealerEmail;
    const dealerDisplayName = selectedDealer?.dealershipName || selectedDealer?.dealership || selectedDealer?.dealerName || selectedDealerEmail;

    const carData = {
      id: editingCar?.id || undefined,
      name: formData.get('name'),
      brand: (selectedDealer?.dealerName || selectedDealer?.name || dealerDisplayName || '').split(' ')[0], // Best effort brand extraction
      variant: formData.get('variant'),
      dealer: dealerDisplayName,
      dealerId: dealerId,
      dealerEmail: dealerEmail,
      price: Number(formData.get('price')) || 0,
      fuelType: formData.get('fuelType'),
      transmission: formData.get('transmission'),
      image: formData.get('image') || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
      stockStatus: formData.get('stockStatus') || 'In Stock',
      baseExShowroomPrice: Number(formData.get('price')) || 0,
      rtoCharges: Number(formData.get('rtoCharges')) || 0,
      insuranceAmount: Number(formData.get('insuranceAmount')) || 0,
      fastagCharges: Number(formData.get('fastagCharges')) || 500,
      handlingCharges: Number(formData.get('handlingCharges')) || 5000,
      accessoriesPackage: Number(formData.get('accessoriesPackage')) || 0,
      extendedWarranty: Number(formData.get('extendedWarranty')) || 0,
      discountOffer: Number(formData.get('discountOffer')) || 0,
      exchangeBonus: Number(formData.get('exchangeBonus')) || 0,
      corporateDiscount: Number(formData.get('corporateDiscount')) || 0,
    };

    try {
      await upsertCar(carData);
      showToast(editingCar ? 'Car updated successfully' : 'Car added successfully', 'success');
      setIsAddModalOpen(false);
      setEditingCar(null);
      fetchData();
    } catch (error) {
      showToast('Failed to save car', 'error');
    }
  };

  const handleDeleteCar = async (carId: string) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        await deleteCar(carId);
        showToast('Car deleted successfully', 'success');
        fetchData();
      } catch (error: any) {
        showToast(error.message || 'Failed to delete car', 'error');
      }
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500 font-black tracking-widest uppercase">Fetching Inventory...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manage Inventory</h1>
          <p className="text-slate-500 mt-1">Keep track of all vehicles listed across all dealers.</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-white border text-slate-700 px-4 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold shadow-sm hover:bg-slate-50 transition-all">
            <Filter size={18} />
            Filter
          </button>
          <button 
            onClick={() => {
              setEditingCar(null);
              setIsAddModalOpen(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 text-sm font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
          >
            <Plus size={20} />
            Add Car
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Car Info</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Dealer</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Price (Ex-Showroom)</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Fuel / Trans</th>
                <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cars.map((car) => (
                <tr key={car.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img src={car.image} alt={car.name} className="w-16 h-10 rounded-lg object-cover border shadow-sm" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">{car.name}</p>
                        <p className="text-xs text-slate-400 font-medium">{car.variant}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-slate-700">{car.dealer}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-black text-blue-600">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(car.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">
                    <p className="text-sm text-slate-600 font-medium">{car.fuelType}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{car.transmission}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => {
                          setEditingCar(car);
                          setIsAddModalOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => car.id && handleDeleteCar(car.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingCar ? "Edit Vehicle" : "Add New Vehicle"}
        size="lg"
      >
        <form onSubmit={handleSaveCar} className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Basic Information</h3>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Car Name</label>
                <input name="name" type="text" defaultValue={editingCar?.name} required className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" placeholder="e.g. Fortuner" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Variant</label>
                <input name="variant" type="text" defaultValue={editingCar?.variant} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" placeholder="e.g. SX(O) Diesel AT" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Dealer</label>
                <select name="dealer" defaultValue={editingCar?.dealerEmail || editingCar?.dealerId} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium">
                  {dealers.map(d => (
                    <option key={d.id} value={d.email}>
                      {d.dealershipName || d.dealership || d.dealerName || d.name || d.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Fuel Type</label>
                  <select name="fuelType" defaultValue={editingCar?.fuelType} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium">
                    <option>Petrol</option>
                    <option>Diesel</option>
                    <option>EV</option>
                    <option>Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Transmission</label>
                  <select name="transmission" defaultValue={editingCar?.transmission} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium">
                    <option>Manual</option>
                    <option>Automatic</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Image URL</label>
                <input name="image" type="text" defaultValue={editingCar?.image} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" placeholder="https://..." />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Professional Pricing (Quotation)</h3>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase flex items-center gap-1"><IndianRupee size={12}/> Ex-Showroom Price</label>
                <input name="price" type="number" defaultValue={editingCar?.price} required className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold text-blue-600" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase">RTO Charges</label>
                  <input name="rtoCharges" type="number" defaultValue={editingCar?.rtoCharges || 0} required className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase">Insurance</label>
                  <input name="insuranceAmount" type="number" defaultValue={editingCar?.insuranceAmount || 0} required className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase">Fastag</label>
                  <input name="fastagCharges" type="number" defaultValue={editingCar?.fastagCharges || 500} className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase">Handling</label>
                  <input name="handlingCharges" type="number" defaultValue={editingCar?.handlingCharges || 5000} className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase">Accessories</label>
                  <input name="accessoriesPackage" type="number" defaultValue={editingCar?.accessoriesPackage || 0} className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase">Extended Warranty</label>
                  <input name="extendedWarranty" type="number" defaultValue={editingCar?.extendedWarranty || 0} className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase">Discount Offer</label>
                  <input name="discountOffer" type="number" defaultValue={editingCar?.discountOffer || 0} className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm italic text-green-600" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase">Exchange Bonus</label>
                  <input name="exchangeBonus" type="number" defaultValue={editingCar?.exchangeBonus || 0} className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase">Corporate Disc.</label>
                  <input name="corporateDiscount" type="number" defaultValue={editingCar?.corporateDiscount || 0} className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t flex justify-end gap-4">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 uppercase tracking-widest bg-transparent cursor-pointer">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-xl text-sm font-black shadow-lg shadow-blue-100 hover:bg-blue-700 uppercase tracking-widest cursor-pointer">
              {editingCar ? 'Update Vehicle' : 'Save Vehicle'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
