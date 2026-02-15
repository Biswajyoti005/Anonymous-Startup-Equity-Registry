/**
 * Midnight Providers
 *
 * Wires up all the Midnight SDK providers using data from the connected wallet.
 * These providers are required by midnight-js-contracts to deploy/join/call contracts.
 */

import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import type {
  MidnightProvider,
  WalletProvider,
  ProofProvider,
  PublicDataProvider,
  PrivateStateProvider,
  ZKConfigProvider,
  UnboundTransaction,
  ProveTxConfig,
} from '@midnight-ntwrk/midnight-js-types';
import type { UnprovenTransaction } from '@midnight-ntwrk/ledger-v7';
import * as ledger from '@midnight-ntwrk/ledger-v7';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { fromHex, toHex } from '@midnight-ntwrk/compact-runtime';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import type {
  EquityRegistryCircuits,
  EquityRegistryProviders,
  EquityRegistryPrivateState,
  ProviderAction,
} from './types';
import { PRIVATE_STATE_ID } from './types';

// ── In-Memory Private State Provider ────────────────────────

export function createPrivateStateProvider(): PrivateStateProvider<typeof PRIVATE_STATE_ID, EquityRegistryPrivateState> {
  const states = new Map<string, EquityRegistryPrivateState>();
  const signingKeys: Record<string, string> = {};

  return {
    set: (key, state) => { states.set(key, state); return Promise.resolve(); },
    get: (key) => Promise.resolve(states.get(key) ?? null),
    remove: (key) => { states.delete(key); return Promise.resolve(); },
    clear: () => { states.clear(); return Promise.resolve(); },
    setSigningKey: (addr, key) => { signingKeys[addr] = key; return Promise.resolve(); },
    getSigningKey: (addr) => Promise.resolve(signingKeys[addr] ?? null),
    removeSigningKey: (addr) => { delete signingKeys[addr]; return Promise.resolve(); },
    clearSigningKeys: () => { Object.keys(signingKeys).forEach(k => delete signingKeys[k]); return Promise.resolve(); },
  };
}

// ── ZK Config Provider with Caching ─────────────────────────

class CachedZkConfigProvider extends FetchZkConfigProvider<EquityRegistryCircuits> {
  private cache = new Map<string, any>();
  private onAction: (action: ProviderAction) => void;

  constructor(baseURL: string, onAction: (action: ProviderAction) => void) {
    super(baseURL, fetch.bind(window));
    this.onAction = onAction;
  }

  async getProverKey(circuitId: EquityRegistryCircuits) {
    const key = `proverKey:${circuitId}`;
    if (this.cache.has(key)) return this.cache.get(key);
    this.onAction('downloadProverStarted');
    try {
      const result = await super.getProverKey(circuitId);
      this.cache.set(key, result);
      return result;
    } finally {
      this.onAction('downloadProverDone');
    }
  }

  async getVerifierKey(circuitId: EquityRegistryCircuits) {
    const key = `verifierKey:${circuitId}`;
    if (this.cache.has(key)) return this.cache.get(key);
    const result = await super.getVerifierKey(circuitId);
    this.cache.set(key, result);
    return result;
  }

  async getZKIR(circuitId: EquityRegistryCircuits) {
    const key = `zkir:${circuitId}`;
    if (this.cache.has(key)) return this.cache.get(key);
    const result = await super.getZKIR(circuitId);
    this.cache.set(key, result);
    return result;
  }
}

// ── Build All Providers ─────────────────────────────────────

export function buildProviders(
  connectedAPI: ConnectedAPI,
  indexerUri: string,
  indexerWsUri: string,
  proverServerUri: string,
  shieldedCoinPublicKey: string,
  shieldedEncryptionPublicKey: string,
  networkId: string,
  onAction: (action: ProviderAction) => void,
): EquityRegistryProviders {
  // Set the network ID globally for Midnight SDK
  setNetworkId(networkId);

  // 1. Private state (in-memory)
  const privateStateProvider = createPrivateStateProvider();

  // 2. Public data (indexer)
  const publicDataProvider: PublicDataProvider = indexerPublicDataProvider(indexerUri, indexerWsUri);

  // 3. ZK config (fetch prover/verifier keys from /public/midnight/counter/)
  const zkConfigProvider: ZKConfigProvider<EquityRegistryCircuits> = new CachedZkConfigProvider(
    `${window.location.origin}/midnight/counter`,
    onAction,
  );

  // 4. Proof provider (proof server)
  const proofProvider: ProofProvider = {
    proveTx(tx: UnprovenTransaction, config?: ProveTxConfig): Promise<UnboundTransaction> {
      onAction('proveTxStarted');
      return httpClientProofProvider(proverServerUri.trim(), zkConfigProvider)
        .proveTx(tx, config)
        .finally(() => onAction('proveTxDone'));
    },
  };

  // 5. Wallet provider (uses Lace via DApp Connector to balance & sign tx)
  const walletProvider: WalletProvider = {
    getCoinPublicKey(): ledger.CoinPublicKey {
      return shieldedCoinPublicKey as unknown as ledger.CoinPublicKey;
    },
    getEncryptionPublicKey(): ledger.EncPublicKey {
      return shieldedEncryptionPublicKey as unknown as ledger.EncPublicKey;
    },
    async balanceTx(tx: UnboundTransaction): Promise<ledger.FinalizedTransaction> {
      const serializedTx = toHex(tx.serialize());
      const result = await connectedAPI.balanceUnsealedTransaction(serializedTx);
      return ledger.Transaction.deserialize<
        ledger.SignatureEnabled,
        ledger.Proof,
        ledger.Binding
      >('signature', 'proof', 'binding', fromHex(result.tx));
    },
  };

  // 6. Midnight provider (submit finalized tx)
  const midnightProvider: MidnightProvider = {
    async submitTx(tx: ledger.FinalizedTransaction): Promise<ledger.TransactionId> {
      onAction('submitTxStarted');
      try {
        await connectedAPI.submitTransaction(toHex(tx.serialize()));
        const ids = tx.identifiers();
        return ids[0];
      } finally {
        onAction('submitTxDone');
      }
    },
  };

  return {
    privateStateProvider,
    publicDataProvider,
    zkConfigProvider,
    proofProvider,
    walletProvider,
    midnightProvider,
  };
}
