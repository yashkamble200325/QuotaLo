import { initializeApp, deleteApp } from 'firebase/app';
import { 
  getAuth,
  createUserWithEmailAndPassword, 
  signOut,
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  Timestamp, 
  collection, 
  writeBatch,
  addDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import firebaseConfig from '../../firebase-applet-config.json';

const dealers = [
  {
    email: 'toyota@quotalo.com',
    name: 'Toyota Motors',
    role: 'dealer',
    dealerId: 'toyota@quotalo.com'
  },
  {
    email: 'honda@quotalo.com',
    name: 'Honda Cars',
    role: 'dealer',
    dealerId: 'honda@quotalo.com'
  },
  {
    email: 'onkarmotors@quotalo.com',
    name: 'Onkar Motors',
    role: 'dealer',
    dealerId: 'onkarmotors@quotalo.com'
  },
  {
    email: 'volkswagen@quotalo.com',
    name: 'Volkswagen Cars',
    role: 'dealer',
    dealerId: 'volkswagen@quotalo.com'
  }
];

const customers = [
  {
    email: 'rahul.sharma@example.com',
    name: 'Rahul Sharma',
    role: 'user'
  }
];

const cars = [
  {
    dealerId: "toyota@quotalo.com",
    dealerEmail: "toyota@quotalo.com",
    brand: "Toyota",
    name: "Toyota Fortuner Legender",
    variant: "Legender 4x4 AT",
    year: 2024,
    fuelType: "Diesel",
    transmission: "Automatic",
    engine: "2755 cc",
    mileage: "15 km/l",
    seatingCapacity: 7,
    color: "Pearl White",
    image: "https://images.unsplash.com/photo-1626668893632-6c1a4465d4f6?w=800",
    price: 4500000,
    baseExShowroomPrice: 4500000,
    rtoCharges: 450000,
    insuranceAmount: 120000,
    fastagCharges: 500,
    handlingCharges: 10000,
    accessoriesPackage: 50000,
    extendedWarranty: 35000,
    discountOffer: 75000,
    exchangeBonus: 30000,
    corporateDiscount: 15000,
    stockStatus: "In Stock",
    dealer: "Toyota Authorized Dealership"
  },
  {
    dealerId: "honda@quotalo.com",
    dealerEmail: "honda@quotalo.com",
    brand: "Honda",
    name: "Honda CR-V",
    variant: "VX 4WD CVT",
    year: 2024,
    fuelType: "Petrol",
    transmission: "Automatic",
    engine: "1998 cc",
    mileage: "14 km/l",
    seatingCapacity: 5,
    color: "Golden Brown",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800",
    price: 3500000,
    baseExShowroomPrice: 3500000,
    rtoCharges: 350000,
    insuranceAmount: 85000,
    fastagCharges: 500,
    handlingCharges: 8000,
    accessoriesPackage: 35000,
    extendedWarranty: 28000,
    discountOffer: 50000,
    exchangeBonus: 20000,
    corporateDiscount: 10000,
    stockStatus: "In Stock",
    dealer: "Honda Premium Showroom"
  },
  {
    dealerId: "toyota@quotalo.com",
    dealerEmail: "toyota@quotalo.com",
    brand: "Toyota",
    name: "Toyota Hilux",
    variant: "High 4X4 AT",
    year: 2024,
    fuelType: "Diesel",
    transmission: "Automatic",
    engine: "2755 cc",
    mileage: "12 km/l",
    seatingCapacity: 5,
    color: "Emotional Red",
    image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800",
    price: 3800000,
    baseExShowroomPrice: 3800000,
    rtoCharges: 380000,
    insuranceAmount: 90000,
    fastagCharges: 500,
    handlingCharges: 9000,
    accessoriesPackage: 40000,
    extendedWarranty: 30000,
    discountOffer: 60000,
    exchangeBonus: 25000,
    corporateDiscount: 12000,
    stockStatus: "In Stock",
    dealer: "Toyota Authorized Dealership"
  },
  {
    dealerId: "honda@quotalo.com",
    dealerEmail: "honda@quotalo.com",
    brand: "Honda",
    name: "Honda City",
    variant: "ZX MT",
    year: 2024,
    fuelType: "Petrol",
    transmission: "Manual",
    engine: "1498 cc",
    mileage: "17 km/l",
    seatingCapacity: 5,
    color: "Radiant Red",
    image: "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800",
    price: 1600000,
    baseExShowroomPrice: 1600000,
    rtoCharges: 160000,
    insuranceAmount: 45000,
    fastagCharges: 500,
    handlingCharges: 5000,
    accessoriesPackage: 15000,
    extendedWarranty: 12000,
    discountOffer: 25000,
    exchangeBonus: 10000,
    corporateDiscount: 5000,
    stockStatus: "In Stock",
    dealer: "Honda Premium Showroom"
  },
  {
    dealerId: "toyota@quotalo.com",
    dealerEmail: "toyota@quotalo.com",
    brand: "Toyota",
    name: "Toyota Glanza",
    variant: "V AMT",
    year: 2024,
    fuelType: "Petrol",
    transmission: "Automatic",
    engine: "1197 cc",
    mileage: "22 km/l",
    seatingCapacity: 5,
    color: "Gaming Grey",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
    price: 950000,
    baseExShowroomPrice: 950000,
    rtoCharges: 95000,
    insuranceAmount: 25000,
    fastagCharges: 500,
    handlingCharges: 3000,
    accessoriesPackage: 10000,
    extendedWarranty: 8000,
    discountOffer: 15000,
    exchangeBonus: 5000,
    corporateDiscount: 3000,
    stockStatus: "In Stock",
    dealer: "Toyota Authorized Dealership"
  },
  {
    dealerId: "honda@quotalo.com",
    dealerEmail: "honda@quotalo.com",
    brand: "Honda",
    name: "Honda Amaze",
    variant: "VX CVT",
    year: 2024,
    fuelType: "Petrol",
    transmission: "Automatic",
    engine: "1199 cc",
    mileage: "18 km/l",
    seatingCapacity: 5,
    color: "Meteoroid Grey",
    image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800",
    price: 980000,
    baseExShowroomPrice: 980000,
    rtoCharges: 98000,
    insuranceAmount: 26000,
    fastagCharges: 500,
    handlingCharges: 3200,
    accessoriesPackage: 11000,
    extendedWarranty: 8500,
    discountOffer: 16000,
    exchangeBonus: 6000,
    corporateDiscount: 3500,
    stockStatus: "In Stock",
    dealer: "Honda Premium Showroom"
  },
  {
    dealerId: "toyota@quotalo.com",
    dealerEmail: "toyota@quotalo.com",
    brand: "Toyota",
    name: "Toyota Urban Cruiser Taisor",
    variant: "V Turbo AT",
    year: 2024,
    fuelType: "Petrol",
    transmission: "Automatic",
    engine: "998 cc",
    mileage: "20 km/l",
    seatingCapacity: 5,
    color: "Lucent Orange",
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800",
    price: 1300000,
    baseExShowroomPrice: 1300000,
    rtoCharges: 130000,
    insuranceAmount: 35000,
    fastagCharges: 500,
    handlingCharges: 4000,
    accessoriesPackage: 12000,
    extendedWarranty: 10000,
    discountOffer: 20000,
    exchangeBonus: 8000,
    corporateDiscount: 4000,
    stockStatus: "In Stock",
    dealer: "Toyota Authorized Dealership"
  },
  {
    dealerId: "honda@quotalo.com",
    dealerEmail: "honda@quotalo.com",
    brand: "Honda",
    name: "Honda Elevate",
    variant: "ZX CVT",
    year: 2024,
    fuelType: "Petrol",
    transmission: "Automatic",
    engine: "1498 cc",
    mileage: "16 km/l",
    seatingCapacity: 5,
    color: "Phoenix Orange",
    image: "https://images.unsplash.com/photo-1542362567-b058c03794b2?w=800",
    price: 1550000,
    baseExShowroomPrice: 1550000,
    rtoCharges: 155000,
    insuranceAmount: 43000,
    fastagCharges: 500,
    handlingCharges: 4800,
    accessoriesPackage: 14000,
    extendedWarranty: 11000,
    discountOffer: 24000,
    exchangeBonus: 9000,
    corporateDiscount: 4500,
    stockStatus: "In Stock",
    dealer: "Honda Premium Showroom"
  }
];

export const seedDatabase = async () => {
  const status = {
    auth: [] as string[],
    firestore: [] as string[],
    errors: [] as string[]
  };

  let tempApp: any = null;
  try {
    // We create a temporary Firebase App instance for registering users so we don't disrupt
    // the active auth session on our primary app.
    tempApp = initializeApp(firebaseConfig, 'temp-seeding-app-' + Date.now());
    const tempAuth = getAuth(tempApp);

    // 1. Create ALL Auth Accounts First
    const allUsers = [
      { email: 'yashkamble200325@gmail.com', password: 'admin123', name: 'Yash Kamble', role: 'admin' },
      ...dealers.map(d => ({ email: d.email, password: 'dealer123', name: d.name, role: 'dealer' })),
      ...customers.map(c => ({ email: c.email, password: 'user123', name: c.name, role: 'user' }))
    ];

    for (const u of allUsers) {
      try {
        const cred = await createUserWithEmailAndPassword(tempAuth, u.email, u.password);
        (u as any).uid = cred.user.uid;
        await signOut(tempAuth);
        status.auth.push(`Created: ${u.email}`);
      } catch (e: any) {
        if (e.code === 'auth/email-already-in-use') {
          status.auth.push(`Exists: ${u.email}`);
        }
        else if (e.code === 'auth/operation-not-allowed') throw new Error('Email/Password auth is NOT enabled in Firebase Console.');
        else status.errors.push(`Auth ${u.email}: ${e.message}`);
      }
    }

    // 2. Sign in as Admin to perform Firestore writes to restricted collections
    try {
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.email?.toLowerCase() === 'yashkamble200325@gmail.com'.toLowerCase()) {
        status.auth.push('Already logged in as Admin');
      } else {
        await signInWithEmailAndPassword(auth, 'yashkamble200325@gmail.com', 'admin123');
        status.auth.push('Logged in as Admin for Seeding');
      }
    } catch (e: any) {
      status.errors.push(`Admin Login Failure: ${e.message}. Attempting writes anyway...`);
    }

    // 3. Sync User Profiles
    for (const u of allUsers) {
      try {
        const targetId = (u as any).uid || u.email;
        await setDoc(doc(db, 'users', targetId), {
          email: u.email,
          name: u.name,
          role: u.role,
          uid: (u as any).uid || null,
          ...(u.email.includes('quotalo') ? { dealerId: u.email } : {}),
          createdAt: Timestamp.now()
        }, { merge: true });
        status.firestore.push(`Profile synced: ${u.email} (ID: ${targetId})`);
      } catch (e: any) {
        status.errors.push(`Users setDoc fail (${u.email}): ${e.message}`);
        // Log and continue to allow remaining seed operations to run
      }
    }

    // 4. Sync Dealers Collection
    for (const d of dealers) {
      try {
        await setDoc(doc(db, 'dealers', d.dealerId), {
          dealerId: d.dealerId,
          dealerName: d.name,
          dealership: d.dealerId.includes('toyota') ? 'Toyota Authorized Dealership' : 
                      d.dealerId.includes('honda') ? 'Honda Premium Showroom' : 
                      d.dealerId.includes('volkswagen') ? 'Volkswagen Authorized Dealership' : 
                      d.dealerId.includes('onkar') ? 'Onkar Motors Dealership' : d.name,
          email: d.email,
          isVerified: true,
          createdAt: Timestamp.now()
        }, { merge: true });
        status.firestore.push(`Dealer synced: ${d.dealerId}`);
      } catch (e: any) {
        status.errors.push(`Dealers setDoc fail (${d.dealerId}): ${e.message}`);
      }
    }

    // 5. Sync Cars
    try {
      const carBatch = writeBatch(db);
      for (const car of cars) {
        const carId = `${car.brand.toLowerCase()}_${car.name.replace(/\s+/g, '_').toLowerCase()}`;
        carBatch.set(doc(db, 'cars', carId), {
          ...car,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }, { merge: true });
      }
      await carBatch.commit();
      status.firestore.push('Cars synced');
    } catch (e: any) {
      status.errors.push(`Cars batch commit fail: ${e.message}`);
    }

    // 6. Sync Sample Booking (requested by user)
    try {
      const testBooking = {
        userId: "rahul.sharma@example.com",
        userEmail: "rahul.sharma@example.com",
        userName: "Rahul Sharma",
        userPhone: "9876543210",
        carId: "honda_cr_v",
        carName: "Honda CR-V",
        carVariant: "VX 4WD CVT",
        dealerId: "honda@quotalo.com",
        dealerName: "Honda Cars",
        bookingDate: Timestamp.now(),
        timeSlot: "10:00 AM",
        testDriveType: "showroom",
        status: "pending",
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, 'bookings'), testBooking);
      status.firestore.push('Sample booking created');
    } catch (e: any) {
      status.errors.push(`Booking addDoc fail: ${e.message}`);
    }

    return status;
  } catch (error: any) {
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    if (tempApp) {
      try {
        await deleteApp(tempApp);
      } catch (err) {
        console.error('Error deleting temp app:', err);
      }
    }
  }
};
