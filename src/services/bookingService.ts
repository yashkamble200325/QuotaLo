import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, getDoc, orderBy, Timestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreError';

export interface BookingData {
  bookingId?: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  carId: string;
  carName: string;
  carVariant: string;
  dealerId: string;
  dealerName: string;
  dealershipName: string;
  dealerEmail?: string;
  bookingDate: any; // Can be string or Date or Timestamp
  timeSlot: string;
  testDriveType: 'showroom' | 'home';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  message?: string;
  createdAt: any;
}

// Create a new booking
export const createBooking = async (bookingData: Omit<BookingData, 'bookingId' | 'createdAt' | 'status'>) => {
  const path = "bookings";
  try {
    const bookingWithMeta = {
      ...bookingData,
      status: 'pending',
      createdAt: Timestamp.now()
    };
    const docRef = await addDoc(collection(db, path), bookingWithMeta);
    return { success: true, id: docRef.id, data: bookingWithMeta };
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
    console.error("Error creating booking:", error);
    return { success: false, error: error.message };
  }
};

// Get bookings by dealer ID or Email
export const getBookingsByDealer = async (dealerId: string, dealerEmail?: string) => {
  const path = "bookings";
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
    const bookings = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        bookingId: doc.id,
        ...(data as any),
      };
    }) as any[];
    
    // Sort locally by createdAt desc
    return { 
      success: true, 
      bookings: bookings.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      })
    };
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.LIST, path);
    }
    console.error("Error getting bookings:", error);
    return { success: false, error: error.message, bookings: [] };
  }
};

// Get all bookings (for admin)
export const getAllBookings = async () => {
  const path = "bookings";
  try {
    const q = query(
      collection(db, path),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const bookings = querySnapshot.docs.map(doc => ({
      id: doc.id,
      bookingId: doc.id,
      ...(doc.data() as any)
    })) as any[];
    return { success: true, bookings };
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.LIST, path);
    }
    console.error("Error getting all bookings:", error);
    return { success: false, error: error.message, bookings: [] };
  }
};

// Get bookings by user ID
export const getBookingsByUser = async (userId: string) => {
  const path = "bookings";
  try {
    const q = query(
      collection(db, path), 
      where("userId", "==", userId.toLowerCase())
    );
    const querySnapshot = await getDocs(q);
    const bookings = querySnapshot.docs.map(doc => ({
      bookingId: doc.id,
      ...doc.data()
    })) as BookingData[];
    
    // Sort locally by createdAt desc
    return { 
      success: true, 
      bookings: bookings.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      })
    };
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.LIST, path);
    }
    console.error("Error getting user bookings:", error);
    return { success: false, error: error.message, bookings: [] };
  }
};

// Update booking status
export const updateBookingStatus = async (bookingId: string, status: BookingData['status']) => {
  const path = `bookings/${bookingId}`;
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    await updateDoc(bookingRef, { status, updatedAt: Timestamp.now() });
    return { success: true };
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
    console.error("Error updating booking:", error);
    return { success: false, error: error.message };
  }
};

// Cancel booking
export const cancelBooking = async (bookingId: string) => {
  return updateBookingStatus(bookingId, 'cancelled');
};
