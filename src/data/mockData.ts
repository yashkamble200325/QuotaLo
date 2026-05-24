import { Car, Dealer, Booking, Quotation } from '../types';

export const MOCK_CARS: Car[] = [
  {
    id: '1',
    brand: 'Toyota',
    name: 'Toyota Fortuner Legender',
    price: 4500000,
    dealer: 'Toyota Motors',
    dealerId: 'D1',
    dealerEmail: 'arun@toyota.com',
    fuelType: 'Diesel',
    transmission: 'Automatic',
    image: 'https://images.unsplash.com/photo-1594535182308-8ffefbb661e1?auto=format&fit=crop&q=80&w=800',
    variant: 'Legender 4x2',
    engine: '2755 cc',
    mileage: '14.4 kmpl',
    seating: '7 Seater',
    stockStatus: 'In Stock'
  },
  {
    id: '2',
    brand: 'Honda',
    name: 'Honda CR-V',
    price: 3500000,
    dealer: 'Honda Cars',
    dealerId: 'D2',
    dealerEmail: 'suresh@honda.com',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=800',
    variant: 'AWD',
    engine: '1997 cc',
    mileage: '12 kmpl',
    seating: '5 Seater',
    stockStatus: 'In Stock'
  },
  {
    id: '3',
    brand: 'Hyundai',
    name: 'Hyundai Tucson',
    price: 3200000,
    dealer: 'Hyundai Motors',
    dealerId: 'D3',
    dealerEmail: 'priya@hyundai.com',
    fuelType: 'Diesel',
    transmission: 'Automatic',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800',
    variant: 'Signature',
    engine: '1999 cc',
    mileage: '15 kmpl',
    seating: '5 Seater',
    stockStatus: 'In Stock'
  }
];

export const MOCK_DEALERS: Dealer[] = [
  {
    id: 'D1',
    name: 'Arun Kumar',
    email: 'arun@toyota.com',
    dealership: 'Toyota Motors',
    status: 'Verified',
    logo: 'https://logo.clearbit.com/toyota.com',
    gst: '27AAAAA0000A1Z5',
    pan: 'ABCDE1234F',
    address: 'Andheri East, Mumbai',
    phone: '+91 9876543210'
  },
  {
    id: 'D2',
    name: 'Suresh Raina',
    email: 'suresh@honda.com',
    dealership: 'Honda Cars',
    status: 'Verified',
    logo: 'https://logo.clearbit.com/honda.com',
    gst: '27BBBBB0000B1Z5',
    pan: 'BCDEF2345G',
    address: 'Gurgaon, Delhi NCR',
    phone: '+91 9876543211'
  },
  {
    id: 'D3',
    name: 'Priya Sharma',
    email: 'priya@hyundai.com',
    dealership: 'Hyundai Motors',
    status: 'Pending',
    logo: 'https://logo.clearbit.com/hyundai.com',
    gst: '27CCCCC0000C1Z5',
    pan: 'CDEFG3456H',
    address: 'Whitefield, Bangalore',
    phone: '+91 9876543212'
  },
  {
    id: 'D4',
    name: 'Amit Shah',
    email: 'amit@maruti.com',
    dealership: 'Maruti Suzuki',
    status: 'Verified',
    logo: 'https://logo.clearbit.com/marutisuzuki.com',
    gst: '27DDDDD0000D1Z5',
    pan: 'DEFGH4567I',
    address: 'Salt Lake, Kolkata',
    phone: '+91 9876543213'
  }
];

export const MOCK_BOOKINGS: any[] = [
  {
    id: 'B101',
    userId: 'user@example.com',
    userEmail: 'user@example.com',
    userName: 'Rahul Verma',
    userPhone: '+91 9999999999',
    carId: '1',
    carName: 'Toyota Fortuner',
    dealerId: 'D1',
    dealerName: 'Toyota Motors',
    dealerEmail: 'arun@toyota.com',
    bookingDate: '2024-05-20',
    timeSlot: '11:00 AM',
    testDriveType: 'showroom',
    status: 'confirmed',
    createdAt: new Date(),
    date: '2024-05-20',
    time: '11:00 AM',
    phone: '+91 9999999999',
    type: 'Showroom'
  }
];

export const MOCK_QUOTATIONS: Quotation[] = [
  {
    id: 'Q501',
    quotationId: 'Q-12345',
    userId: 'user@example.com',
    carId: '1',
    dealerId: 'D1',
    carName: 'Toyota Fortuner',
    dealerName: 'Toyota Motors',
    date: '2024-05-15',
    finalOnRoadPrice: 4850000,
    priceBreakdown: {} as any,
    quoteValidUntil: new Date(),
    createdAt: new Date()
  }
];

export const MOCK_USERS = [
  {
    id: 'U1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91 9812345678',
    joinedDate: '2024-01-10',
    status: 'Active',
    avatar: 'https://i.pravatar.cc/150?u=john'
  },
  {
    id: 'U2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+91 9812345679',
    joinedDate: '2024-02-15',
    status: 'Active',
    avatar: 'https://i.pravatar.cc/150?u=jane'
  },
  {
    id: 'U3',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    phone: '+91 9812345680',
    joinedDate: '2024-03-20',
    status: 'Inactive',
    avatar: 'https://i.pravatar.cc/150?u=bob'
  }
];
