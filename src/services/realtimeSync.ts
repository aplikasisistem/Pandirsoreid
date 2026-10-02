import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from './firebase';
import { GameAccount, SaleRecord } from '../types';
import { INITIAL_ACCOUNTS, INITIAL_SALES_RECORDS } from '../data/initialAccounts';

const STORAGE_KEY = 'gamestore_accounts_data_v2';
const STORAGE_SALES_KEY = 'pandirstore_sales_records_v1';

export type SyncMode = 'firebase' | 'broadcast' | 'offline';

type AccountsListener = (accounts: GameAccount[]) => void;
type SalesListener = (sales: SaleRecord[]) => void;

class RealtimeSyncService {
  private listeners: Set<AccountsListener> = new Set();
  private salesListeners: Set<SalesListener> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;
  private unsubscribeFirestoreAccounts: (() => void) | null = null;
  private unsubscribeFirestoreSales: (() => void) | null = null;
  private currentMode: SyncMode = 'firebase';
  private currentAccounts: GameAccount[] = [];
  private currentSales: SaleRecord[] = [];
  private isInitialized = false;

  constructor() {
    this.initBroadcastChannel();
    this.loadCachedData();
    this.initFirestoreSync();
  }

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('pandirstore_realtime_sync');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'ACCOUNTS_UPDATED' && Array.isArray(event.data.payload)) {
            this.currentAccounts = event.data.payload;
            this.notifyListeners(this.currentAccounts);
          } else if (event.data?.type === 'SALES_UPDATED' && Array.isArray(event.data.payload)) {
            this.currentSales = event.data.payload;
            this.notifySalesListeners(this.currentSales);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel not available:', err);
      }
    }
  }

  private loadCachedData() {
    if (typeof window === 'undefined') return;
    try {
      const storedAcc = localStorage.getItem(STORAGE_KEY);
      if (storedAcc) {
        const parsed = JSON.parse(storedAcc);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.currentAccounts = parsed;
        } else {
          this.currentAccounts = INITIAL_ACCOUNTS;
        }
      } else {
        this.currentAccounts = INITIAL_ACCOUNTS;
      }

      const storedSales = localStorage.getItem(STORAGE_SALES_KEY);
      if (storedSales) {
        const parsedSales = JSON.parse(storedSales);
        if (Array.isArray(parsedSales) && parsedSales.length > 0) {
          this.currentSales = parsedSales;
        } else {
          this.currentSales = INITIAL_SALES_RECORDS;
        }
      } else {
        this.currentSales = INITIAL_SALES_RECORDS;
      }
    } catch (err) {
      console.warn('Error reading from localStorage cache:', err);
      this.currentAccounts = INITIAL_ACCOUNTS;
      this.currentSales = INITIAL_SALES_RECORDS;
    }
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
      console.error('Error saving accounts to localStorage:', err);
    }
  }

  private saveSalesToLocalStorage(sales: SaleRecord[], broadcast = true) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_SALES_KEY, JSON.stringify(sales));
      if (broadcast && this.broadcastChannel) {
        this.broadcastChannel.postMessage({
          type: 'SALES_UPDATED',
          payload: sales,
        });
      }
    } catch (err) {
      console.error('Error saving sales to localStorage:', err);
    }
  }

  private async initFirestoreSync() {
    try {
      const accountsCol = collection(db, 'gamestore_accounts');
      const salesCol = collection(db, 'sales_records');

      // Subscribe to real-time accounts collection
      this.unsubscribeFirestoreAccounts = onSnapshot(
        accountsCol,
        async (snapshot) => {
          if (!snapshot.empty) {
            const remoteAccounts: GameAccount[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as GameAccount;
              remoteAccounts.push(data);
            });
            remoteAccounts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            this.currentAccounts = remoteAccounts;
            this.saveToLocalStorage(remoteAccounts, false);
            this.currentMode = 'firebase';
            this.notifyListeners(remoteAccounts);
          } else {
            // First time seed from INITIAL_ACCOUNTS
            await this.seedInitialAccounts();
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'gamestore_accounts');
          this.currentMode = 'broadcast';
        }
      );

      // Subscribe to real-time sales collection
      this.unsubscribeFirestoreSales = onSnapshot(
        salesCol,
        async (snapshot) => {
          if (!snapshot.empty) {
            const remoteSales: SaleRecord[] = [];
            snapshot.forEach((docSnap) => {
              remoteSales.push(docSnap.data() as SaleRecord);
            });
            remoteSales.sort((a, b) => (b.date || 0) - (a.date || 0));
            this.currentSales = remoteSales;
            this.saveSalesToLocalStorage(remoteSales, false);
            this.notifySalesListeners(remoteSales);
          } else if (this.currentSales.length > 0) {
            await this.seedInitialSales();
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'sales_records');
        }
      );

      this.currentMode = 'firebase';
      this.isInitialized = true;
    } catch (err) {
      console.error('Failed to initialize Firestore sync:', err);
      this.currentMode = 'broadcast';
    }
  }

  private async seedInitialAccounts() {
    try {
      const batch = writeBatch(db);
      for (const acc of INITIAL_ACCOUNTS) {
        const docRef = doc(db, 'gamestore_accounts', acc.id);
        batch.set(docRef, acc);
      }
      await batch.commit();
      this.currentAccounts = INITIAL_ACCOUNTS;
      this.saveToLocalStorage(INITIAL_ACCOUNTS, true);
      this.notifyListeners(INITIAL_ACCOUNTS);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'gamestore_accounts');
    }
  }

  private async seedInitialSales() {
    try {
      const batch = writeBatch(db);
      for (const sale of INITIAL_SALES_RECORDS) {
        const docRef = doc(db, 'sales_records', sale.id);
        batch.set(docRef, sale);
      }
      await batch.commit();
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'sales_records');
    }
  }

  public getSyncStatus(): { mode: SyncMode; label: string; active: boolean } {
    if (this.currentMode === 'firebase') {
      return {
        mode: 'firebase',
        label: 'Firebase Firestore Real-Time Active (Multi-Device Terhubung)',
        active: true,
      };
    }
    return {
      mode: 'broadcast',
      label: 'Local & BroadcastChannel Real-Time (Fallback)',
      active: true,
    };
  }

  public subscribe(listener: AccountsListener): () => void {
    this.listeners.add(listener);
    listener(this.currentAccounts);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public subscribeSales(listener: SalesListener): () => void {
    this.salesListeners.add(listener);
    listener(this.currentSales);
    return () => {
      this.salesListeners.delete(listener);
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

  private notifySalesListeners(sales: SaleRecord[]) {
    this.salesListeners.forEach((listener) => {
      try {
        listener([...sales]);
      } catch (err) {
        console.error('Error in sales listener:', err);
      }
    });
  }

  public getAccounts(): GameAccount[] {
    return [...this.currentAccounts];
  }

  public getSalesRecords(): SaleRecord[] {
    return [...this.currentSales];
  }

  public async addAccount(newAccount: Omit<GameAccount, 'createdAt' | 'updatedAt'>): Promise<GameAccount> {
    const now = Date.now();
    const created: GameAccount = {
      ...newAccount,
      createdAt: now,
      updatedAt: now,
    };

    // Update local immediately for responsive UI
    const updatedList = [created, ...this.currentAccounts];
    this.currentAccounts = updatedList;
    this.saveToLocalStorage(updatedList, true);
    this.notifyListeners(updatedList);

    // Sync to Firestore
    try {
      await setDoc(doc(db, 'gamestore_accounts', created.id), created);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `gamestore_accounts/${created.id}`);
      throw e;
    }

    return created;
  }

  public async updateAccount(account: GameAccount): Promise<GameAccount> {
    const updated: GameAccount = {
      ...account,
      updatedAt: Date.now(),
    };

    // Update local immediately for responsive UI
    const updatedList = this.currentAccounts.map((a) => (a.id === updated.id ? updated : a));
    this.currentAccounts = updatedList;
    this.saveToLocalStorage(updatedList, true);
    this.notifyListeners(updatedList);

    // Sync to Firestore
    try {
      await setDoc(doc(db, 'gamestore_accounts', updated.id), updated);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `gamestore_accounts/${updated.id}`);
      throw e;
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
      await this.addSaleRecord({
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
    // Optimistic local update
    const updatedList = this.currentAccounts.filter((a) => a.id !== id);
    this.currentAccounts = updatedList;
    this.saveToLocalStorage(updatedList, true);
    this.notifyListeners(updatedList);

    // Sync to Firestore
    try {
      await deleteDoc(doc(db, 'gamestore_accounts', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `gamestore_accounts/${id}`);
      throw e;
    }

    return true;
  }

  public async addSaleRecord(record: Omit<SaleRecord, 'id'>): Promise<SaleRecord> {
    const newRecord: SaleRecord = {
      ...record,
      id: `TRX-${Date.now().toString().slice(-6)}`,
    };
    const updated = [newRecord, ...this.currentSales];
    this.currentSales = updated;
    this.saveSalesToLocalStorage(updated, true);
    this.notifySalesListeners(updated);

    try {
      await setDoc(doc(db, 'sales_records', newRecord.id), newRecord);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `sales_records/${newRecord.id}`);
    }

    return newRecord;
  }

  public async resetToSeed(): Promise<void> {
    await this.seedInitialAccounts();
    await this.seedInitialSales();
  }
}

export const realtimeSync = new RealtimeSyncService();
