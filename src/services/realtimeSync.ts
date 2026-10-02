import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { GameAccount, SaleRecord } from '../types';
import { INITIAL_ACCOUNTS, INITIAL_SALES_RECORDS } from '../data/initialAccounts';

const STORAGE_KEY = 'gamestore_accounts_data_v2';
const STORAGE_SALES_KEY = 'pandirstore_sales_records_v1';
const FIREBASE_CONFIG_STORAGE_KEY = 'gamestore_firebase_custom_config';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  databaseURL?: string;
}

export type SyncMode = 'firebase' | 'broadcast' | 'offline';

type AccountsListener = (accounts: GameAccount[]) => void;

class RealtimeSyncService {
  private listeners: Set<AccountsListener> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;
  private unsubscribeFirestore: (() => void) | null = null;
  private currentMode: SyncMode = 'broadcast';
  private firestoreDb: any = null;
  private currentAccounts: GameAccount[] = [];
  private currentSales: SaleRecord[] = [];
  private salesListeners: Set<(sales: SaleRecord[]) => void> = new Set();

  constructor() {
    this.initBroadcastChannel();
    this.initStorageListener();
    this.loadInitialData();
    this.loadInitialSalesData();
    this.initFirebaseIfConfigured();
  }

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('gamestore_realtime_sync');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'ACCOUNTS_UPDATED' && Array.isArray(event.data.payload)) {
            this.currentAccounts = event.data.payload;
            this.saveToLocalStorage(this.currentAccounts, false);
            this.notifyListeners(this.currentAccounts);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel not available:', err);
      }
    }
  }

  private initStorageListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            if (Array.isArray(parsed)) {
              this.currentAccounts = parsed;
              this.notifyListeners(this.currentAccounts);
            }
          } catch (err) {
            console.error('Failed to parse storage update:', err);
          }
        }
      });
    }
  }

  private loadInitialData() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.currentAccounts = parsed;
          return;
        }
      }
    } catch (err) {
      console.warn('Error reading from localStorage:', err);
    }
    this.currentAccounts = INITIAL_ACCOUNTS;
    this.saveToLocalStorage(INITIAL_ACCOUNTS, false);
  }

  private loadInitialSalesData() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_SALES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.currentSales = parsed;
          return;
        }
      }
    } catch (err) {
      console.warn('Error reading sales from localStorage:', err);
    }
    this.currentSales = INITIAL_SALES_RECORDS;
    this.saveSalesToLocalStorage(INITIAL_SALES_RECORDS);
  }

  private saveSalesToLocalStorage(sales: SaleRecord[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_SALES_KEY, JSON.stringify(sales));
      this.notifySalesListeners(sales);
    } catch (err) {
      console.error('Error saving sales to localStorage:', err);
    }
  }

  public getSalesRecords(): SaleRecord[] {
    return [...this.currentSales];
  }

  public subscribeSales(listener: (sales: SaleRecord[]) => void): () => void {
    this.salesListeners.add(listener);
    listener([...this.currentSales]);
    return () => {
      this.salesListeners.delete(listener);
    };
  }

  private notifySalesListeners(sales: SaleRecord[]) {
    this.salesListeners.forEach((listener) => {
      try {
        listener([...sales]);
      } catch (e) {
        console.error('Error in sales listener:', e);
      }
    });
  }

  public addSaleRecord(record: Omit<SaleRecord, 'id'>): SaleRecord {
    const newRecord: SaleRecord = {
      ...record,
      id: `TRX-${Date.now().toString().slice(-5)}`,
    };
    const updated = [newRecord, ...this.currentSales];
    this.currentSales = updated;
    this.saveSalesToLocalStorage(updated);
    return newRecord;
  }

  private saveToLocalStorage(accounts: GameAccount[], broadcast = true) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
      if (broadcast && this.broadcastChannel) {
        this.broadcastChannel.postMessage({
          type: 'ACCOUNTS_UPDATED',
          payload: accounts,
        });
      }
    } catch (err) {
      console.error('Error saving to localStorage:', err);
    }
  }

  public getStoredFirebaseConfig(): FirebaseConfig | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }

    // Check environment variables as fallback
    const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (envApiKey && envProjectId) {
      return {
        apiKey: envApiKey,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
        projectId: envProjectId,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${envProjectId}.appspot.com`,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
        appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
        databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
      };
    }
    return null;
  }

  public async saveFirebaseConfig(config: FirebaseConfig | null) {
    if (typeof window === 'undefined') return;
    if (this.unsubscribeFirestore) {
      this.unsubscribeFirestore();
      this.unsubscribeFirestore = null;
    }
    if (!config) {
      localStorage.removeItem(FIREBASE_CONFIG_STORAGE_KEY);
      this.currentMode = 'broadcast';
      this.firestoreDb = null;
      return;
    }
    localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
    await this.initFirebaseWithConfig(config);
  }

  private initFirebaseIfConfigured() {
    const config = this.getStoredFirebaseConfig();
    if (config && config.apiKey && config.projectId) {
      this.initFirebaseWithConfig(config);
    } else {
      this.currentMode = 'broadcast';
    }
  }

  private async initFirebaseWithConfig(config: FirebaseConfig) {
    try {
      const app = getApps().length === 0 ? initializeApp(config) : getApp();
      const db = getFirestore(app);
      this.firestoreDb = db;

      const accountsCol = collection(db, 'gamestore_accounts');

      // Listen in real-time via WebSocket / long polling
      this.unsubscribeFirestore = onSnapshot(
        accountsCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteAccounts: GameAccount[] = [];
            snapshot.forEach((docSnap) => {
              remoteAccounts.push(docSnap.data() as GameAccount);
            });
            // Sort by createdAt descending
            remoteAccounts.sort((a, b) => b.createdAt - a.createdAt);
            this.currentAccounts = remoteAccounts;
            this.saveToLocalStorage(remoteAccounts, true);
            this.currentMode = 'firebase';
            this.notifyListeners(remoteAccounts);
          } else {
            // First time seeding to Firestore
            this.seedToFirestore(db, this.currentAccounts);
          }
        },
        (error) => {
          console.warn('Firestore real-time sync subscription error, fallback to broadcast:', error);
          this.currentMode = 'broadcast';
        }
      );
      this.currentMode = 'firebase';
    } catch (err) {
      console.warn('Firebase init failed, continuing in broadcast mode:', err);
      this.currentMode = 'broadcast';
    }
  }

  private async seedToFirestore(db: any, accounts: GameAccount[]) {
    try {
      const batch = writeBatch(db);
      for (const acc of accounts) {
        const docRef = doc(db, 'gamestore_accounts', acc.id);
        batch.set(docRef, acc);
      }
      await batch.commit();
      this.currentMode = 'firebase';
    } catch (e) {
      console.warn('Failed to seed to Firestore:', e);
    }
  }

  public getSyncStatus(): { mode: SyncMode; label: string; active: boolean } {
    if (this.currentMode === 'firebase') {
      return {
        mode: 'firebase',
        label: 'Firebase Realtime Cloud Database (Multi-Device Active)',
        active: true,
      };
    }
    return {
      mode: 'broadcast',
      label: 'Instant Multi-Tab / Netlify Ready Real-Time Sync',
      active: true,
    };
  }

  public subscribe(listener: AccountsListener): () => void {
    this.listeners.add(listener);
    // Send immediate state
    listener(this.currentAccounts);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(accounts: GameAccount[]) {
    this.listeners.forEach((listener) => {
      try {
        listener([...accounts]);
      } catch (err) {
        console.error('Error in accounts listener:', err);
      }
    });
  }

  public getAccounts(): GameAccount[] {
    return [...this.currentAccounts];
  }

  public async addAccount(newAccount: Omit<GameAccount, 'createdAt' | 'updatedAt'>): Promise<GameAccount> {
    const now = Date.now();
    const created: GameAccount = {
      ...newAccount,
      createdAt: now,
      updatedAt: now,
    };

    const updatedList = [created, ...this.currentAccounts];
    this.currentAccounts = updatedList;
    this.saveToLocalStorage(updatedList, true);
    this.notifyListeners(updatedList);

    // Sync to Firestore if connected
    if (this.firestoreDb) {
      try {
        await setDoc(doc(this.firestoreDb, 'gamestore_accounts', created.id), created);
      } catch (e) {
        console.error('Failed to sync addAccount to Firestore:', e);
      }
    }

    return created;
  }

  public async updateAccount(account: GameAccount): Promise<GameAccount> {
    const updated: GameAccount = {
      ...account,
      updatedAt: Date.now(),
    };

    const updatedList = this.currentAccounts.map((a) => (a.id === updated.id ? updated : a));
    this.currentAccounts = updatedList;
    this.saveToLocalStorage(updatedList, true);
    this.notifyListeners(updatedList);

    if (this.firestoreDb) {
      try {
        await setDoc(doc(this.firestoreDb, 'gamestore_accounts', updated.id), updated);
      } catch (e) {
        console.error('Failed to sync updateAccount to Firestore:', e);
      }
    }

    return updated;
  }

  public async updateAccountStock(
    id: string,
    stock: number,
    status: GameAccount['status']
  ): Promise<GameAccount | null> {
    const target = this.currentAccounts.find((a) => a.id === id);
    if (!target) return null;

    if (status === 'SOLD_OUT' && target.status !== 'SOLD_OUT') {
      const cost = target.costPrice || Math.round(target.price * 0.7);
      this.addSaleRecord({
        accountId: target.id,
        accountTitle: target.title,
        game: target.game,
        sellingPrice: target.price,
        costPrice: cost,
        profit: target.price - cost,
        date: Date.now(),
        buyerNote: 'Status diubah ke Sold Out oleh Penjual',
      });
    }

    const updated: GameAccount = {
      ...target,
      stock,
      status,
      updatedAt: Date.now(),
    };

    return this.updateAccount(updated);
  }

  public async deleteAccount(id: string): Promise<boolean> {
    const updatedList = this.currentAccounts.filter((a) => a.id !== id);
    this.currentAccounts = updatedList;
    this.saveToLocalStorage(updatedList, true);
    this.notifyListeners(updatedList);

    if (this.firestoreDb) {
      try {
        await deleteDoc(doc(this.firestoreDb, 'gamestore_accounts', id));
      } catch (e) {
        console.error('Failed to sync deleteAccount to Firestore:', e);
      }
    }

    return true;
  }

  public async resetToSeed(): Promise<void> {
    this.currentAccounts = INITIAL_ACCOUNTS;
    this.saveToLocalStorage(INITIAL_ACCOUNTS, true);
    this.notifyListeners(INITIAL_ACCOUNTS);

    if (this.firestoreDb) {
      await this.seedToFirestore(this.firestoreDb, INITIAL_ACCOUNTS);
    }
  }
}

export const realtimeSync = new RealtimeSyncService();
