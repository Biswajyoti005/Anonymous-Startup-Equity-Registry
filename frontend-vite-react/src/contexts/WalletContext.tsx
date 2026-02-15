/**
 * Wallet Context & Provider
 *
 * Global React context that manages the Midnight Lace wallet connection state.
 * Provides auto-reconnect on page load and exposes connect/disconnect to all components.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { WalletState, AvailableWallet } from '../midnight/types';
import {
  connectWallet,
  disconnectWallet,
  discoverWallets,
  getSavedConnection,
} from '../midnight/wallet';

interface WalletContextValue {
  /** Current wallet connection state */
  wallet: WalletState;
  /** List of detected Midnight wallets */
  availableWallets: AvailableWallet[];
  /** Connect to a wallet by rdns */
  connect: (rdns: string, networkId: string) => Promise<void>;
  /** Disconnect the current wallet */
  disconnect: () => void;
  /** Re-discover available wallets */
  refreshWallets: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({ status: 'disconnected' });
  const [availableWallets, setAvailableWallets] = useState<AvailableWallet[]>([]);

  const refreshWallets = useCallback(() => {
    setAvailableWallets(discoverWallets());
  }, []);

  const connect = useCallback(async (rdns: string, networkId: string) => {
    setWallet({ status: 'connecting' });
    const result = await connectWallet(rdns, networkId);
    setWallet(result);
  }, []);

  const disconnect = useCallback(() => {
    disconnectWallet();
    setWallet({ status: 'disconnected' });
  }, []);

  // On mount: discover wallets & auto-reconnect
  useEffect(() => {
    // Wait briefly for wallet extension to inject
    const timer = setTimeout(() => {
      refreshWallets();

      const saved = getSavedConnection();
      if (saved) {
        void connect(saved.rdns, saved.networkId);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <WalletContext.Provider value={{ wallet, availableWallets, connect, disconnect, refreshWallets }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within <WalletProvider>');
  return ctx;
}
