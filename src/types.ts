export type UserRole = 'admin' | 'dealer' | 'user';

export interface User {
  uid: string;
  id?: string;
  email: string;
  role: UserRole;
  name: string;
  phone?: string;
  dealerId?: string;
  dealerName?: string;
}

export interface Car {
  id: string;
  brand: string;
  name: string;
  price: number;
  dealer: string;
  dealerId: string;
  dealerEmail: string;
  fuelType: string;
  transmission: string;
  image: string;
  variant?: string;
  engine?: string;
  mileage?: string;
  seating?: string;
  stockStatus?: 'In Stock' | 'Out of Stock';
  baseExShowroomPrice?: number;
  rtoCharges?: number;
  insuranceAmount?: number;
  fastagCharges?: number;
  handlingCharges?: number;
  accessoriesPackage?: number;
  extendedWarranty?: number;
  discountOffer?: number;
  exchangeBonus?: number;
  corporateDiscount?: number;
}

export interface Dealer {
  id: string;
  name: string;
  email: string;
  dealership: string;
  dealershipName?: string;
  dealerName?: string;
  status: 'Verified' | 'Pending';
  logo: string;
  gst?: string;
  pan?: string;
  address?: string;
  phone?: string;
}

export interface Booking {
  id?: string;
  bookingId?: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  carId: string;
  carName: string;
  carVariant?: string;
  dealerId: string;
  dealerName: string;
  dealershipName?: string;
  bookingDate: any;
  timeSlot: string;
  testDriveType: 'showroom' | 'home';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  dealerEmail?: string;
  message?: string;
  createdAt: any;
  // Deprecated fields for transition
  date?: string;
  time?: string;
  phone?: string;
  type?: string;
}

export interface Quotation {
  id: string;
  quotationId: string;
  userId: string;
  carId: string;
  dealerId: string;
  dealerEmail?: string;
  carName: string;
  dealerName: string;
  date: string;
  finalOnRoadPrice: number;
  priceBreakdown: PriceBreakdown;
  quoteValidUntil: any;
  qrCodeData?: string;
  createdAt: any;
}

export interface PriceBreakdown {
  variant?: string;
  baseExShowroomPrice: number;
  rtoCharges: number;
  insuranceAmount: number;
  fastagCharges: number;
  handlingCharges: number;
  accessoriesPackage: number;
  extendedWarranty: number;
  subtotal: number;
  discountOffer: number;
  exchangeBonus: number;
  corporateDiscount: number;
  totalDiscount: number;
  finalOnRoadPrice: number;
}
