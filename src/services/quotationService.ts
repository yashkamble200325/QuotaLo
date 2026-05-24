import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { Car, Dealer, Quotation } from '../types';
import { calculatePriceBreakdown } from '../utils/priceCalculator';
import { handleFirestoreError, OperationType } from '../utils/firestoreError';

// Create quotation
export const createQuotation = async (data: any) => {
  const path = 'quotations';
  try {
    const docRef = await addDoc(collection(db, 'quotations'), {
      ...data,
      date: new Date().toLocaleDateString('en-IN'),
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
    throw error;
  }
};

// Generate quotation
export const generateQuotation = async (car: Car, dealer: any, userId: string) => {
  const breakdown = calculatePriceBreakdown(car);
  const quotationId = `QT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  
  const rawDealerId = dealer.id || dealer.dealerId || dealer.email || 'unknown';
  const rawDealerEmail = dealer.email || 'verified@dealer.com';
  const dealerDisplayName = dealer.dealershipName || dealer.dealership || dealer.dealerName || dealer.name || 'Authorized Dealer';

  const quotationData: Partial<Quotation> = {
    quotationId,
    userId: userId.toLowerCase(),
    carId: car.id || 'unknown',
    dealerId: String(rawDealerId).toLowerCase(),
    dealerEmail: String(rawDealerEmail).toLowerCase(),
    carName: car.name,
    dealerName: dealerDisplayName,
    date: new Date().toLocaleDateString('en-IN'),
    finalOnRoadPrice: breakdown.finalOnRoadPrice,
    priceBreakdown: breakdown,
    quoteValidUntil: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) as any, 
    qrCodeData: `https://quotalo.app/verify/${quotationId}`,
    createdAt: Timestamp.now() as any
  };

  const id = await createQuotation(quotationData);
  return { ...quotationData, id } as Quotation;
};

// Get quotations by dealer
export const getQuotationsByDealer = async (dealerId: string, dealerEmail?: string) => {
  const path = "quotations";
  try {
    let q;
    if (dealerEmail) {
      q = query(
        collection(db, path), 
        where("dealerEmail", "==", dealerEmail.toLowerCase())
      );
    } else {
      q = query(
        collection(db, path), 
        where("dealerId", "==", dealerId.toLowerCase())
      );
    }
    const querySnapshot = await getDocs(q);
    const quotations = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any)
    })) as any[];
    
    // Sort locally by createdAt desc
    return { 
      success: true, 
      quotations: quotations.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      })
    };
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.LIST, path);
    }
    console.error("Error getting dealer quotations:", error);
    return { success: false, error: error.message, quotations: [] };
  }
};

// Get quotations by user ID
export const getQuotationsByUser = async (userId: string) => {
  const path = "quotations";
  try {
    const q = query(
      collection(db, path), 
      where("userId", "==", userId.toLowerCase())
    );
    const querySnapshot = await getDocs(q);
    const quotations = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];
    
    // Sort locally by createdAt desc
    return { 
      success: true, 
      quotations: quotations.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      })
    };
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.LIST, path);
    }
    console.error("Error getting user quotations:", error);
    return { success: false, error: error.message, quotations: [] };
  }
};

// Get all quotations (for admin)
export const getAllQuotations = async () => {
  const path = "quotations";
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const quotations = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any)
    })) as any[];
    return { 
      success: true, 
      quotations: quotations.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      })
    };
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.LIST, path);
    }
    console.error("Error getting all quotations:", error);
    return { success: false, error: error.message, quotations: [] };
  }
};

export const downloadQuotationPDF = async (quote: Quotation, dealer: Dealer) => {
  const doc = new jsPDF();
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Helpers
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR', 
      maximumFractionDigits: 0 
    }).format(val);

  // 1. Header & Branding
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('QuotaLo', margin, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Professional Vehicle Quotation', margin, 32);
  
  doc.setFontSize(8);
  doc.text('QUOTALO-CERTIFIED-DOC-' + quote.quotationId, pageWidth - margin, 25, { align: 'right' });
  doc.text('GENERATED ON: ' + quote.date, pageWidth - margin, 30, { align: 'right' });

  // 2. Dealer & Vehicle Summary
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DEALER DETAILS', margin, 55);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(quote.dealerName || 'Authorized Dealer', margin, 62);
  doc.text(dealer?.address || 'Authorized Dealer Address', margin, 67);
  doc.text(dealer?.email || quote.dealerEmail || 'contact@dealer.com', margin, 72);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('VEHICLE SUMMARY', pageWidth / 2 + 10, 55);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(37, 99, 235); // Blue 600
  doc.text(quote.carName, pageWidth / 2 + 10, 62);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8);
  doc.text('VARIANT: ' + (quote.priceBreakdown?.variant || 'Standard'), pageWidth / 2 + 10, 67);
  doc.text('VALID UNTIL: ' + (quote.quoteValidUntil?.toDate ? quote.quoteValidUntil.toDate().toLocaleDateString() : '30 Days'), pageWidth / 2 + 10, 72);

  // 3. Pricing Table
  const priceRows = [
    ['Ex-Showroom Price', formatCurrency(quote.priceBreakdown.baseExShowroomPrice)],
    ['RTO & Registration', formatCurrency(quote.priceBreakdown.rtoCharges)],
    ['Comprehensive Insurance', formatCurrency(quote.priceBreakdown.insuranceAmount)],
    ['Fastag Charges', formatCurrency(quote.priceBreakdown.fastagCharges)],
    ['Handling/Logistics', formatCurrency(quote.priceBreakdown.handlingCharges)],
    ['Accessories Package', formatCurrency(quote.priceBreakdown.accessoriesPackage)],
    ['Extended Warranty', formatCurrency(quote.priceBreakdown.extendedWarranty || 0)],
  ];

  autoTable(doc, {
    startY: 80,
    head: [['Item Description', 'Amount (INR)']],
    body: priceRows,
    theme: 'striped',
    headStyles: { fillColor: [30, 41, 59], fontSize: 10, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 1: { halign: 'right' } },
    margin: { left: margin, right: margin }
  });

  // Offers Table
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  const offerRows = [
    ['Dealer Discount Offer', '- ' + formatCurrency(quote.priceBreakdown.discountOffer)],
    ['Exchange Bonus', '- ' + formatCurrency(quote.priceBreakdown.exchangeBonus)],
    ['Corporate Benefits', '- ' + formatCurrency(quote.priceBreakdown.corporateDiscount)],
  ];

  autoTable(doc, {
    startY: finalY + 5,
    body: offerRows,
    theme: 'plain',
    bodyStyles: { fontSize: 9, textColor: [5, 150, 105], fontStyle: 'italic' }, // Emerald 600
    columnStyles: { 1: { halign: 'right' } },
    margin: { left: margin, right: margin }
  });

  // Total Row
  const totalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFillColor(30, 41, 59);
  doc.rect(margin, totalY, pageWidth - margin * 2, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL ON-ROAD PRICE (EST.)', margin + 5, totalY + 8);
  doc.text(formatCurrency(quote.finalOnRoadPrice), pageWidth - margin - 5, totalY + 8, { align: 'right' });

  // 4. Security & Disclaimer
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Note: This is a system-generated indicative quotation. Final price may vary based on exact RTO location and delivery date.', margin, totalY + 20);
  doc.text('Quotation subject to stock availability and price revisions by the manufacturer.', margin, totalY + 24);

  // 5. Verification QR Section
  const qrY = 215;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, qrY, 180, 45, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('QUOTATION VERIFICATION', margin + 10, qrY + 10);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Scan this QR Code to verify the authenticity of this quotation on the QuotaLo platform.', margin + 10, qrY + 17);
  doc.text('Quote ID: ' + quote.quotationId, margin + 10, qrY + 23);
  doc.text('Valid Until: ' + (quote.quoteValidUntil?.toDate ? quote.quoteValidUntil.toDate().toLocaleDateString() : '30 Days'), margin + 10, qrY + 29);

  // Generate QR Code
  try {
    const qrDataUrl = await QRCode.toDataURL(quote.qrCodeData || `https://quotalo.app/verify/${quote.quotationId}`);
    doc.addImage(qrDataUrl, 'PNG', 150, qrY + 5, 35, 35);
  } catch (err) {
    console.error('QR Generation failed', err);
    doc.setDrawColor(203, 213, 225);
    doc.rect(150, qrY + 5, 35, 35);
    doc.setFontSize(6);
    doc.text('QR UNAVAILABLE', 151, qrY + 22);
  }

  // 6. Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('QuotaLo.app - Your Trusted Partner in Digital Mobility', pageWidth / 2, 280, { align: 'center' });

  doc.save(`Quotation_${quote.quotationId}.pdf`);
};
