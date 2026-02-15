/**
 * Midnight Lace Wallet Connection
 *
 * Uses the DApp Connector API v4.0.0 to discover, connect, and interact
 * with the Midnight Lace browser wallet extension.
 *
 * Key integration points:
 * - window.midnight.{walletId} provides InitialAPI
 * - InitialAPI.connect(networkId) returns ConnectedAPI
 * - ConnectedAPI provides configuration, balances, addresses, tx operations
 */

import type { InitialAPI, ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import type { AvailableWallet, WalletState } from './types';

declare global {
  interface Window {
    midnight?: Record<string, InitialAPI>;
  }
}

const STORAGE_KEY_RDNS = 'midnight-wallet-rdns';
const STORAGE_KEY_NETWORK = 'midnight-wallet-network';

/**
 * Discover all available Midnight wallets from window.midnight
 */
export function discoverWallets(): AvailableWallet[] {
  if (typeof window === 'undefined' || !window.midnight) return [];

  const wallets: AvailableWallet[] = [];
  for (const [key, api] of Object.entries(window.midnight)) {
    try {
      if (api?.name && api?.apiVersion) {
        wallets.push({
          name: api.name,
          rdns: key,
          apiVersion: api.apiVersion,
          icon: api.icon,
        });
      }
    } catch {
      // Skip malformed wallet entries
    }
  }
  return wallets;
}

/**
 * Wait for the Lace wallet to inject window.midnight.mnLace
 * (it may take a moment after page load)
 */
export function waitForWallet(
  rdns: string,
  timeoutMs = 3000
): Promise<InitialAPI> {
  return new Promise((resolve, reject) => {
    // Check immediately
    const existing = window.midnight?.[rdns];
    if (existing) return resolve(existing);

    const startTime = Date.now();
    const interval = setInterval(() => {
      const api = window.midnight?.[rdns];
      if (api) {
        clearInterval(interval);
        resolve(api);
      } else if (Date.now() - startTime > timeoutMs) {
        clearInterval(interval);
        reject(new Error(
          `Wallet "${rdns}" not found. Make sure the Midnight Lace browser extension is installed and enabled.`
        ));
      }
    }, 100);
  });
}

/**
 * Connect to a specific wallet by rdns identifier
 */
export async function connectWallet(
  rdns: string,
  networkId: string
): Promise<WalletState> {
  try {
    const initialAPI = await waitForWallet(rdns);

    const connectedAPI: ConnectedAPI = await initialAPI.connect(networkId);

    // Fetch all wallet data in parallel
    const [
      configuration,
      connectionStatus,
      dustAddressData,
      dustBalanceData,
      shieldedAddrs,
      shieldedBals,
      unshieldedAddr,
      unshieldedBals,
    ] = await Promise.all([
      connectedAPI.getConfiguration(),
      connectedAPI.getConnectionStatus(),
      connectedAPI.getDustAddress(),
      connectedAPI.getDustBalance(),
      connectedAPI.getShieldedAddresses(),
      connectedAPI.getShieldedBalances(),
      connectedAPI.getUnshieldedAddress(),
      connectedAPI.getUnshieldedBalances(),
    ]);

    // Persist connection for auto-reconnect
    localStorage.setItem(STORAGE_KEY_RDNS, rdns);
    localStorage.setItem(STORAGE_KEY_NETWORK, networkId);

    return {
      status: 'connected',
      initialAPI,
      connectedAPI,
      configuration,
      connectionStatus,
      dustAddress: (dustAddressData as any)?.dustAddress,
      dustBalance: dustBalanceData as any,
      shieldedAddress: (shieldedAddrs as any)?.shieldedAddress,
      shieldedCoinPublicKey: (shieldedAddrs as any)?.shieldedCoinPublicKey,
      shieldedEncryptionPublicKey: (shieldedAddrs as any)?.shieldedEncryptionPublicKey,
      shieldedBalances: shieldedBals as any,
      unshieldedAddress: (unshieldedAddr as any)?.unshieldedAddress,
      unshieldedBalances: unshieldedBals as any,
    };
  } catch (err: any) {
    return {
      status: 'error',
      error: err?.message || 'Failed to connect to wallet',
    };
  }
}

/**
 * Disconnect wallet and clear persisted state
 */
export function disconnectWallet(): void {
  localStorage.removeItem(STORAGE_KEY_RDNS);
  localStorage.removeItem(STORAGE_KEY_NETWORK);
}

/**
 * Get persisted wallet connection info for auto-reconnect
 */
export function getSavedConnection(): { rdns: string; networkId: string } | null {
  const rdns = localStorage.getItem(STORAGE_KEY_RDNS);
  const networkId = localStorage.getItem(STORAGE_KEY_NETWORK);
  if (rdns && networkId) return { rdns, networkId };
  return null;
}
