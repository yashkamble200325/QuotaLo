import React, { useState, useEffect } from 'react';
import { FileText, Download, User, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { getQuotationsByDealer, downloadQuotationPDF } from '../../services/quotationService';
import { useAuth } from '../../contexts/AuthContext';
import { Quotation, Dealer } from '../../types';
import { useToast } from '../../context/ToastContext';

export default function Quotations() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { showToast } = useToast();

  const fetchData = async () => {
    if (!user || user.role !== 'dealer') return;
    setIsLoading(true);
    try {
      const dealerId = user.dealerId || user.email;
      const response = await getQuotationsByDealer(dealerId, user.email);
      if (response.success) {
        setQuotations(response.quotations);
      } else {
        showToast(response.error || 'Failed to load quotations', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Failed to load quotations', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleDownload = async (quote: Quotation) => {
    try {
      // For the PDF we need the full dealer object, but we might only have user
      const dealerMock: Dealer = {
        id: user?.dealerId || user?.email || '',
        name: user?.name || '',
        dealership: quote.dealerName,
        email: user?.email || '',
        address: 'Authorized Dealership Address', // Fallback
        phone: '',
        status: 'Verified',
        logo: ''
      };
      await downloadQuotationPDF(quote, dealerMock);
    } catch (error) {
      console.error(error);
      showToast('Failed to generate PDF', 'error');
    }
  };

  const filteredQuotations = quotations.filter(q => 
    q.carName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.quotationId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Quotations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quotations</h1>
          <p className="text-slate-500 mt-1">View all quotations generated for your vehicles.</p>
        </div>
        <div className="relative group min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search by Car or Quote ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>
      </div>

      {filteredQuotations.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <FileText size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Quotations Found</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">
            {searchQuery ? "Try a different search term or clear the filter." : "Quotations will appear here once customers generate them for your vehicles."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuotations.map((quote) => (
            <motion.div
              layout
              key={quote.id}
              className="card group hover:shadow-md transition-all overflow-hidden"
            >
              <div className="p-5 border-b border-slate-50 bg-slate-50/50">
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold uppercase tracking-wider">
                    {quote.quotationId}
                  </span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {quote.date}
                  </p>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">{quote.carName}</h3>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500">
                    <User size={14} />
                    <span className="text-xs font-medium">Customer</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    ID: {quote.userId ? quote.userId.slice(-6).toUpperCase() : 'USER'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Final Price</p>
                  <p className="text-lg font-black text-primary">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(quote.finalOnRoadPrice)}
                  </p>
                </div>

                <button
                  onClick={() => handleDownload(quote)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                >
                  <Download size={14} />
                  DOWNLOAD PDF
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
