import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, ShieldCheck, Building2, Trash2, Clock } from 'lucide-react';
import { MOCK_CARS } from '../../data/mockData';
import { motion } from 'motion/react';
import { getDealers } from '../../services/carService';
import { getQuotationsByUser, downloadQuotationPDF } from '../../services/quotationService';
import { useAuth } from '../../contexts/AuthContext';
import { Quotation, Dealer } from '../../types';
import { useToast } from '../../context/ToastContext';

export default function MyQuotations() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const [qResponse, dData] = await Promise.all([
          getQuotationsByUser(user.email),
          getDealers()
        ]);
        if (qResponse.success) {
          setQuotations(qResponse.quotations as Quotation[] || []);
        }
        setDealers(dData as Dealer[] || []);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const getCarImage = (name: string) => {
    return MOCK_CARS.find(c => c.name.includes(name))?.image || MOCK_CARS[0].image;
  };

  const handleDownload = (quote: Quotation) => {
    const dealer = dealers.find(d => d.dealership === quote.dealerName) || {
      name: quote.dealerName,
      address: 'Authorized Dealership',
      email: 'dealer@quotalo.app'
    } as any;
    
    downloadQuotationPDF(quote, dealer);
    showToast('Quotation PDF generated successfully!', 'success');
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest">Compiling price breakdowns...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial Records</h1>
          <p className="text-slate-500 mt-1">Review and manage your professional on-road price quotations.</p>
        </div>
        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border border-emerald-100">
          <ShieldCheck size={16} /> VERIFIED QUOTATIONS
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {quotations.map((quote, i) => (
          <motion.div
            key={quote.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group card overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 border-slate-100"
          >
            <div className="h-44 relative group">
              <img src={getCarImage(quote.carName)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={quote.carName} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
              <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
                <div>
                   <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-1">{quote.quotationId}</p>
                   <h3 className="text-xl font-black text-white leading-tight">{quote.carName}</h3>
                </div>
                <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg border border-white/30 text-white">
                   <FileText size={18} />
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
               <div className="flex items-center justify-between text-[11px] pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase tracking-wider">
                     <Calendar size={14} className="text-blue-500" /> {quote.date}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase tracking-wider">
                     <Building2 size={14} className="text-indigo-500" /> {quote.dealerName}
                  </div>
               </div>

               <div className="space-y-3">
                  <div className="flex justify-between items-center bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">On-Road Protection</span>
                     <span className="text-lg font-black text-slate-900">₹{new Intl.NumberFormat('en-IN').format(quote.finalOnRoadPrice)}</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
                     <Clock size={14} className="text-amber-600" />
                     <span className="text-[10px] font-bold text-amber-700 uppercase">Valid Until: {quote.quoteValidUntil?.toDate ? quote.quoteValidUntil.toDate().toLocaleDateString() : '30 Days'}</span>
                  </div>
               </div>

               <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => handleDownload(quote)}
                    className="flex-3 btn-primary py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                  >
                     <Download size={16} /> DOWNLOAD PDF
                  </button>
                  <button className="flex-1 p-3 border border-slate-200 text-slate-400 rounded-xl hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all">
                     <Trash2 size={20} />
                  </button>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      {quotations.length === 0 && (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <FileText size={40} />
           </div>
           <h3 className="text-xl font-black text-slate-900 tracking-tight">No Financial Records</h3>
           <p className="text-slate-500 mt-2 text-sm max-w-xs mx-auto">Generate a professional on-road price breakdown from the car details page to see them here.</p>
           <button className="mt-8 text-primary font-black text-xs uppercase tracking-widest hover:underline border-2 border-primary/20 px-6 py-2 rounded-xl">View Cars</button>
        </div>
      )}
    </div>
  );
}

