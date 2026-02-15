/**
 * Contract Context & Provider
 *
 * Manages the smart contract lifecycle:
 * - Builds Midnight providers when the wallet is connected
 * - Joins the deployed contract
 * - Subscribes to on-chain state updates
 * - Exposes contract actions (registerEquityStake)
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { DerivedState, ProviderAction } from '../midnight/types';
import { ACTION_MESSAGES } from '../midnight/types';
import { buildProviders } from '../midnight/providers';
import { ContractController } from '../midnight/contract';
import { useWallet } from './WalletContext';

interface ContractContextValue {
  /** Current on-chain state */
  state: DerivedState | null;
  /** Contract joining status */
  contractStatus: 'idle' | 'joining' | 'ready' | 'error';
  /** Human-readable status message */
  statusMessage: string;
  /** Error message if contract operations fail */
  contractError: string | null;
  /** Register an equity stake (calls increment on-chain) */
  registerEquityStake: () => Promise<void>;
  /** Whether register is in progress */
  isRegistering: boolean;
}

const ContractContext = createContext<ContractContextValue | null>(null);

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as string;

export function ContractProvider({ children }: { children: ReactNode }) {
  const { wallet } = useWallet();
  const [controller, setController] = useState<ContractController | null>(null);
  const [state, setState] = useState<DerivedState | null>(null);
  const [contractStatus, setContractStatus] = useState<'idle' | 'joining' | 'ready' | 'error'>('idle');
  const [contractError, setContractError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('Waiting for wallet connection...');
  const [isRegistering, setIsRegistering] = useState(false);

  const onAction = useCallback((action: ProviderAction) => {
    const msg = ACTION_MESSAGES[action];
    if (msg) setStatusMessage(msg);
  }, []);

  // When wallet connects, build providers and join contract
  useEffect(() => {
    if (
      wallet.status !== 'connected' ||
      !wallet.connectedAPI ||
      !wallet.configuration ||
      !wallet.shieldedCoinPublicKey ||
      !wallet.shieldedEncryptionPublicKey
    ) {
      setController(null);
      setState(null);
      setContractStatus('idle');
      return;
    }

    let cancelled = false;

    async function init() {
      setContractStatus('joining');
      setStatusMessage('Building Midnight providers...');
      setContractError(null);

      try {
        const config = wallet.configuration!;
        const providers = buildProviders(
          wallet.connectedAPI!,
          config.indexerUri,
          config.indexerWsUri,
          config.proverServerUri ?? 'http://127.0.0.1:6300',
          wallet.shieldedCoinPublicKey!,
          wallet.shieldedEncryptionPublicKey!,
          'undeployed', // local testnet
          onAction,
        );

        setStatusMessage('Joining deployed contract...');

        const ctrl = await ContractController.join(providers, CONTRACT_ADDRESS);
        if (cancelled) return;

        setController(ctrl);
        setContractStatus('ready');
        setStatusMessage('Connected to contract');

        // Subscribe to state updates
        const sub = ctrl.state$.subscribe({
          next: (s) => {
            if (!cancelled) setState(s);
          },
          error: (err) => {
            if (!cancelled) {
              setContractError(`State subscription error: ${err.message}`);
            }
          },
        });

        return () => sub.unsubscribe();
      } catch (err: any) {
        if (!cancelled) {
          setContractStatus('error');
          setContractError(err?.message || 'Failed to join contract');
          setStatusMessage('Contract connection failed');
        }
      }
    }

    const cleanup = init();

    return () => {
      cancelled = true;
      cleanup?.then((unsub) => unsub?.());
    };
  }, [wallet.status, wallet.connectedAPI, wallet.configuration]);

  const registerEquityStake = useCallback(async () => {
    if (!controller) throw new Error('Contract not ready');
    setIsRegistering(true);
    setStatusMessage('Registering equity stake...');
    try {
      await controller.registerEquityStake();
      setStatusMessage('Equity stake registered!');
    } catch (err: any) {
      setStatusMessage('Registration failed');
      throw err;
    } finally {
      setIsRegistering(false);
    }
  }, [controller]);

  const value = useMemo<ContractContextValue>(
    () => ({
      state,
      contractStatus,
      statusMessage,
      contractError,
      registerEquityStake,
      isRegistering,
    }),
    [state, contractStatus, statusMessage, contractError, registerEquityStake, isRegistering],
  );

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
}

export function useContract(): ContractContextValue {
  const ctx = useContext(ContractContext);
  if (!ctx) throw new Error('useContract must be used within <ContractProvider>');
  return ctx;
}
