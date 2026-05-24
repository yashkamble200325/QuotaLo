import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Car, Dealer } from '../types';

// Let's reuse or define Firestore error handling here
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: any) {
  console.error('Firestore operation failed:', error);
  throw error;
}

// ==========================================
// USER PROFILE SERVICES
// ==========================================
export const getUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error);
  }
};

export const getUserProfile = async (id: string) => {
  try {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    handleFirestoreError(error);
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error);
  }
};

export const createUserProfile = async (id: string, data: any) => {
  try {
    const userDoc = {
      ...data,
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    await setDoc(doc(db, 'users', id), userDoc);
    return userDoc;
  } catch (error) {
    handleFirestoreError(error);
  }
};

export const updateUserProfile = async (id: string, data: any) => {
  try {
    await updateDoc(doc(db, 'users', id), {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    handleFirestoreError(error);
  }
};

// ==========================================
// CAR / VEHICLE SERVICES
// ==========================================
export const getCars = async (): Promise<Car[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'cars'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Car[];
  } catch (error) {
    handleFirestoreError(error);
    return [];
  }
};

export const getCarsByDealer = async (dealerId: string): Promise<Car[]> => {
  try {
    const q = query(collection(db, 'cars'), where('dealerId', '==', dealerId.toLowerCase()));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Car[];
  } catch (error) {
    handleFirestoreError(error);
    return [];
  }
};

export const upsertCar = async (carData: any) => {
  try {
    if (carData.id) {
      const { id, ...updateData } = carData;
      await updateDoc(doc(db, 'cars', id), {
        ...updateData,
        updatedAt: Timestamp.now()
      });
      return id;
    } else {
      const docRef = await addDoc(collection(db, 'cars'), {
        ...carData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    }
  } catch (error) {
    handleFirestoreError(error);
  }
};

export const deleteCar = async (carId: string) => {
  try {
    await deleteDoc(doc(db, 'cars', carId));
  } catch (error) {
    handleFirestoreError(error);
  }
};

// ==========================================
// DEALER SERVICES
// ==========================================
export const getDealers = async (): Promise<Dealer[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'dealers'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Dealer[];
  } catch (error) {
    handleFirestoreError(error);
    return [];
  }
};

export const getDealerById = async (id: string): Promise<Dealer | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'dealers', id.toLowerCase()));
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Dealer) : null;
  } catch (error) {
    handleFirestoreError(error);
    return null;
  }
};

export const upsertDealer = async (id: string, dealerData: any) => {
  try {
    await setDoc(doc(db, 'dealers', id.toLowerCase()), {
      ...dealerData,
      updatedAt: Timestamp.now()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error);
  }
};
