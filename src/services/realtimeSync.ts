import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  getDocs,
  Unsubscribe,
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from './firebase';
import { GameAccount, SaleRecord } from '../types';
import { INITIAL_ACCOUNTS, INITIAL_SALES_RECORDS } from '../data/initialAccounts';

const STORAGE_KEY = 'gamestore_accounts_data_v3';
const STORAGE_SALES_KEY = 'pandirstore_sales_records_v2';
const ACCOUNTS_COLLECTION = 'akun_toko_game';
const SALES_COLLECTION = 'catatan_penjualan';

export type SyncMode = 'firebase' | 'broadcast' | 'offline';

type AccountsListener = (accounts: GameAccount[]) => void;
type SalesListener = (sales: SaleRecord[]) => void;

class RealtimeSyncService {
  private listeners: Set<AccountsListener> = new Set();
  private salesListeners: Set<SalesListener> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;
  private unsubscribeFirestoreAccounts: Unsubscribe | null = null;
  private unsubscribeFirestoreSales: Unsubscribe | null = null;
  private currentMode: SyncMode = 'firebase';
  private currentAccounts: GameAccount[] = [];
  private currentSales: SaleRecord[] = [];
  private isSeedingAccounts = false;
  private hasAttemptedMigration = false;
  public isConnected = false;

  constructor() {
    this.initBroadcastChannel();
    this.loadCachedData();
    this.initFirestoreSync();
  }

  /**
   * BroadcastChannel allows same-device multi-tab synchronization
   * when offline or during instant optimistic state updates.
   */
  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('pandirstore_realtime_sync');
        this.broadcastChannel.onmessage = (event) => {
          // Only use BroadcastChannel fallback if Firestore is currently disconnected
          if (!this.isConnected) {
            if (event.data?.type === 'ACCOUNTS_UPDATED' && Array.isArray(event.data.payload)) {
              this.currentAccounts = event.data.payload;
              this.notifyListeners(this.currentAccounts);
            } else if (event.data?.type === 'SALES_UPDATED' && Array.isArray(event.data.payload)) {
              this.currentSales = event.data.payload;
              this.notifySalesListeners(this.currentSales);
            }
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel initialization skipped:', err);
      }
    }
  }

  /**
   * Load initial cached state from localStorage so the application
   * renders immediately without a blank loading screen.
   */
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

  private saveToLocalStorage(accounts: GameAccount[], broadcast = false) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
      if (broadcast && this.broadcastChannel && !this.isConnected) {
        this.broadcastChannel.postMessage({
          type: 'ACCOUNTS_UPDATED',
          payload: accounts,
        });
      }
    } catch (err) {
      console.error('Error saving accounts to localStorage:', err);
    }
  }

  private saveSalesToLocalStorage(sales: SaleRecord[], broadcast = false) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_SALES_KEY, JSON.stringify(sales));
      if (broadcast && this.broadcastChannel && !this.isConnected) {
        this.broadcastChannel.postMessage({
          type: 'SALES_UPDATED',
          payload: sales,
        });
      }
    } catch (err) {
      console.error('Error saving sales to localStorage:', err);
    }
  }

  /**
   * Initialize bidirectional real-time Firestore listeners.
   * Any change made on any device triggers onSnapshot within milliseconds.
   */
  private initFirestoreSync() {
    try {
      const accountsCol = collection(db, ACCOUNTS_COLLECTION);
      const salesCol = collection(db, SALES_COLLECTION);

      // Clean up previous listeners if any
      if (this.unsubscribeFirestoreAccounts) {
        this.unsubscribeFirestoreAccounts();
        this.unsubscribeFirestoreAccounts = null;
      }
      if (this.unsubscribeFirestoreSales) {
        this.unsubscribeFirestoreSales();
        this.unsubscribeFirestoreSales = null;
      }

      // 1. Real-Time Accounts Listener (akun_toko_game)
      this.unsubscribeFirestoreAccounts = onSnapshot(
        accountsCol,
        async (snapshot) => {
          this.isConnected = true;
          this.currentMode = 'firebase';

          if (!snapshot.empty) {
            const remoteAccounts: GameAccount[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as GameAccount;
              if (data && data.id) {
                remoteAccounts.push(data);
              }
            });

            // Sort newest first based on createdAt
            remoteAccounts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

            this.currentAccounts = remoteAccounts;
            this.saveToLocalStorage(remoteAccounts, false);
            this.notifyListeners(remoteAccounts);
          } else {
            // Firestore collection is empty. Check once if migration is needed, without looping.
            if (!this.hasAttemptedMigration && !this.isSeedingAccounts) {
              this.hasAttemptedMigration = true;
              await this.checkAndMigrateLegacyAccounts();
            } else {
              this.currentAccounts = [];
              this.saveToLocalStorage([], false);
              this.notifyListeners([]);
            }
          }
        },
        (error) => {
          console.warn('Firestore onSnapshot accounts listener fallback:', error.message);
          this.currentMode = 'broadcast';
          this.isConnected = false;
        }
      );

      // 2. Real-Time Sales Ledger Listener (catatan_penjualan)
      this.unsubscribeFirestoreSales = onSnapshot(
        salesCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteSales: SaleRecord[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as SaleRecord;
              if (data && data.id) {
                remoteSales.push(data);
              }
            });

            remoteSales.sort((a, b) => (b.date || 0) - (a.date || 0));
            this.currentSales = remoteSales;
            this.saveSalesToLocalStorage(remoteSales, false);
            this.notifySalesListeners(remoteSales);
          } else {
            this.currentSales = [];
            this.saveSalesToLocalStorage([], false);
            this.notifySalesListeners([]);
          }
        },
        (error) => {
          console.warn('Firestore onSnapshot sales listener fallback:', error.message);
        }
      );
    } catch (err) {
      console.warn('Failed to attach Firestore listeners, running offline cache:', err);
      this.currentMode = 'broadcast';
      this.isConnected = false;
    }
  }

  /**
   * One-time check for legacy collections to prevent data loss.
   */
  private async checkAndMigrateLegacyAccounts() {
    if (this.isSeedingAccounts) return;
    this.isSeedingAccounts = true;

    try {
      let seedSource = INITIAL_ACCOUNTS;
      try {
        const legacySnap = await getDocs(collection(db, 'gamestore_accounts'));
        if (!legacySnap.empty) {
          const legacyAccounts: GameAccount[] = [];
          legacySnap.forEach((d) => {
            const item = d.data() as GameAccount;
            if (item && item.id) legacyAccounts.push(item);
          });
          if (legacyAccounts.length > 0) {
            seedSource = legacyAccounts;
          }
        }
      } catch {
        // Fallback to INITIAL_ACCOUNTS
      }

      if (seedSource.length > 0) {
        const batch = writeBatch(db);
        for (const acc of seedSource) {
          const docRef = doc(db, ACCOUNTS_COLLECTION, acc.id);
          batch.set(docRef, acc);
        }
        await batch.commit();
      } else {
        this.currentAccounts = [];
        this.saveToLocalStorage([], false);
        this.notifyListeners([]);
      }
    } catch (e) {
      console.warn('Initial migration check completed with warning:', e);
    } finally {
      this.isSeedingAccounts = false;
    }
  }

  public getSyncStatus(): { mode: SyncMode; label: string; active: boolean } {
    if (this.currentMode === 'firebase' || this.isConnected) {
      return {
        mode: 'firebase',
        label: 'Google Cloud Firestore Real-Time Active (Multi-Device Terhubung)',
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
    // Immediately supply current state to new subscriber
    listener([...this.currentAccounts]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public subscribeSales(listener: SalesListener): () => void {
    this.salesListeners.add(listener);
    listener([...this.currentSales]);
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

  /**
   * Adds a new game account to Firestore.
   * Immediately propagates to all devices in real-time.
   */
  public async addAccount(newAccount: Omit<GameAccount, 'createdAt' | 'updatedAt'>): Promise<GameAccount> {
    const now = Date.now();
    const created: GameAccount = {
      ...newAccount,
      createdAt: now,
      updatedAt: now,
    };

    // Optimistic local update (newest at top)
    const updatedList = [created, ...this.currentAccounts.filter((a) => a.id !== created.id)];
    this.currentAccounts = updatedList;
    this.saveToLocalStorage(updatedList, false);
    this.notifyListeners(updatedList);

    // Save directly to Firestore collection 'akun_toko_game'
    try {
      await setDoc(doc(db, ACCOUNTS_COLLECTION, created.id), created);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `${ACCOUNTS_COLLECTION}/${created.id}`);
      throw e;
    }

    return created;
  }

  /**
   * Updates an existing account in Firestore.
   * Propagates to all buyer & seller devices in real-time.
   */
  public async updateAccount(account: GameAccount): Promise<GameAccount> {
    const updated: GameAccount = {
      ...account,
      updatedAt: Date.now(),
    };

    // Optimistic local update
    const updatedList = this.currentAccounts.map((a) => (a.id === updated.id ? updated : a));
    this.currentAccounts = updatedList;
    this.saveToLocalStorage(updatedList, false);
    this.notifyListeners(updatedList);

    try {
      await setDoc(doc(db, ACCOUNTS_COLLECTION, updated.id), updated);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `${ACCOUNTS_COLLECTION}/${updated.id}`);
      throw e;
    }

    return updated;
  }

  /**
   * Updates stock or changes status between READY and SOLD_OUT.
   * If transitioning to SOLD_OUT, creates a sales ledger record in Firestore.
   */
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
        accountId: target.idLapak || target.accountId || target.id,
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

  /**
   * Deletes an account from Firestore.
   * Immediately removes it from all active users' catalog in real-time.
   */
  public async deleteAccount(id: string): Promise<boolean> {
    // Optimistic local update
    const updatedList = this.currentAccounts.filter((a) => a.id !== id);
    this.currentAccounts = updatedList;
    this.saveToLocalStorage(updatedList, false);
    this.notifyListeners(updatedList);

    try {
      await deleteDoc(doc(db, ACCOUNTS_COLLECTION, id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `${ACCOUNTS_COLLECTION}/${id}`);
      throw e;
    }

    return true;
  }

  /**
   * Adds a transaction record to Firestore 'catatan_penjualan'.
   */
  public async addSaleRecord(record: Omit<SaleRecord, 'id'>): Promise<SaleRecord> {
    const newRecord: SaleRecord = {
      ...record,
      id: `TRX-${Date.now().toString().slice(-6)}`,
    };
    const updated = [newRecord, ...this.currentSales.filter((s) => s.id !== newRecord.id)];
    this.currentSales = updated;
    this.saveSalesToLocalStorage(updated, false);
    this.notifySalesListeners(updated);

    try {
      await setDoc(doc(db, SALES_COLLECTION, newRecord.id), newRecord);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `${SALES_COLLECTION}/${newRecord.id}`);
    }

    return newRecord;
  }
}

export const realtimeSync = new RealtimeSyncService();
