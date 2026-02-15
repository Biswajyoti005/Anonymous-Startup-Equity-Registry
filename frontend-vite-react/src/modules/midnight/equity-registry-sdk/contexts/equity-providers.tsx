import * as ledger from "@midnight-ntwrk/ledger-v7";
import {
  type MidnightProvider,
  type WalletProvider,
  type UnboundTransaction,
  PrivateStateProvider,
  ZKConfigProvider,
  ProofProvider,
  PublicDataProvider,
} from "@midnight-ntwrk/midnight-js-types";
import { createContext, useCallback, useMemo, useState } from "react";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { Logger } from "pino";
import type {
  EquityRegistryCircuits,
  EquityRegistryPrivateStateId,
} from "../api/common-types";
import { EquityRegistryProviders } from "../api/common-types";
import { useWallet } from "../../wallet-widget/hooks/useWallet";
import {
  ActionMessages,
  ProviderAction,
  WrappedPublicDataProvider,
} from "../../wallet-widget/utils/providersWrappers/publicDataProvider";
import { CachedFetchZkConfigProvider } from "../../wallet-widget/utils/providersWrappers/zkConfigProvider";
import {
  noopProofClient,
  proofClient,
} from "../../wallet-widget/utils/providersWrappers/proofClient";
import { inMemoryPrivateStateProvider } from "../../wallet-widget/utils/customImplementations/in-memory-private-state-provider";
import { EquityRegistryPrivateState } from "@eddalabs/equity-registry-contract";
import { fromHex, toHex } from "@midnight-ntwrk/compact-runtime";

export interface ProvidersState {
  privateStateProvider: PrivateStateProvider<typeof EquityRegistryPrivateStateId>;
  zkConfigProvider?: ZKConfigProvider<EquityRegistryCircuits>;
  proofProvider: ProofProvider;
  publicDataProvider?: PublicDataProvider;
  walletProvider?: WalletProvider;
  midnightProvider?: MidnightProvider;
  providers?: EquityRegistryProviders;
  flowMessage?: string;
}

interface ProviderProps {
  children: React.ReactNode;
  logger: Logger;
}

export const ProvidersContext = createContext<ProvidersState | undefined>(undefined);

const ACTION_MESSAGES: Readonly<ActionMessages> = {
  proveTxStarted: "Generating zero-knowledge proof for equity stake...",
  proveTxDone: undefined,
  balanceTxStarted: "Signing transaction with Midnight Lace wallet...",
  balanceTxDone: undefined,
  downloadProverStarted: "Downloading prover key...",
  downloadProverDone: undefined,
  submitTxStarted: "Submitting equity registration to blockchain...",
  submitTxDone: undefined,
  watchForTxDataStarted: "Waiting for transaction finalization...",
  watchForTxDataDone: undefined,
} as const;

export const Provider = ({ children, logger }: ProviderProps) => {
  const [flowMessage, setFlowMessage] = useState<string | undefined>(undefined);
  const { serviceUriConfig, shieldedAddresses, connectedAPI, status } = useWallet();

  const providerCallback = useCallback(
    (action: ProviderAction): void => {
      setFlowMessage(ACTION_MESSAGES[action]);
    },
    []
  );

  const privateStateProvider: PrivateStateProvider<typeof EquityRegistryPrivateStateId> = useMemo(
    () => inMemoryPrivateStateProvider<string, EquityRegistryPrivateState>(),
    [logger, status]
  );

  const publicDataProvider: PublicDataProvider | undefined = useMemo(
    () =>
      serviceUriConfig
        ? new WrappedPublicDataProvider(
            indexerPublicDataProvider(
              serviceUriConfig.indexerUri,
              serviceUriConfig.indexerWsUri
            ),
            providerCallback,
            logger
          )
        : undefined,
    [serviceUriConfig, providerCallback, logger, status]
  );

  const zkConfigProvider = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return new CachedFetchZkConfigProvider<EquityRegistryCircuits>(
      `${window.location.origin}/midnight/counter`,
      fetch.bind(window),
      () => {}
    );
  }, [status]);

  const proofProvider = useMemo(
    () =>
      serviceUriConfig?.proverServerUri && zkConfigProvider
        ? proofClient(serviceUriConfig.proverServerUri, zkConfigProvider, providerCallback)
        : noopProofClient(),
    [serviceUriConfig, zkConfigProvider, providerCallback, status]
  );

  const walletProvider: WalletProvider = useMemo(
    () =>
      connectedAPI
        ? {
            getCoinPublicKey(): ledger.CoinPublicKey {
              return shieldedAddresses?.shieldedCoinPublicKey as unknown as ledger.CoinPublicKey;
            },
            getEncryptionPublicKey(): ledger.EncPublicKey {
              return shieldedAddresses?.shieldedEncryptionPublicKey as unknown as ledger.EncPublicKey;
            },
            async balanceTx(
              tx: UnboundTransaction,
              ttl?: Date
            ): Promise<ledger.FinalizedTransaction> {
              try {
                logger.info({ tx, ttl }, "Balancing equity registry transaction via wallet");
                const serializedTx = toHex(tx.serialize());
                const received = await connectedAPI.balanceUnsealedTransaction(serializedTx);
                return ledger.Transaction.deserialize<
                  ledger.SignatureEnabled,
                  ledger.Proof,
                  ledger.Binding
                >("signature", "proof", "binding", fromHex(received.tx));
              } catch (e) {
                logger.error({ error: e }, "Error balancing transaction via wallet");
                throw e;
              }
            },
          }
        : {
            getCoinPublicKey(): ledger.CoinPublicKey { return ""; },
            getEncryptionPublicKey(): ledger.EncPublicKey { return ""; },
            balanceTx: () => Promise.reject(new Error("Wallet not connected")),
          },
    [connectedAPI, providerCallback, status]
  );

  const midnightProvider: MidnightProvider = useMemo(
    () =>
      connectedAPI
        ? {
            submitTx: async (tx: ledger.FinalizedTransaction): Promise<ledger.TransactionId> => {
              await connectedAPI.submitTransaction(toHex(tx.serialize()));
              const txIdentifiers = tx.identifiers();
              const txId = txIdentifiers[0];
              logger.info({ txIdentifiers }, "Submitted equity registry transaction");
              return txId;
            },
          }
        : {
            submitTx: (): Promise<ledger.TransactionId> =>
              Promise.reject(new Error("Wallet not connected")),
          },
    [connectedAPI, providerCallback, status]
  );

  const combinedProviders: ProvidersState = useMemo(() => ({
    privateStateProvider,
    publicDataProvider,
    proofProvider,
    zkConfigProvider,
    walletProvider,
    midnightProvider,
    providers:
      publicDataProvider && zkConfigProvider
        ? {
            privateStateProvider,
            publicDataProvider,
            zkConfigProvider,
            proofProvider,
            walletProvider,
            midnightProvider,
          }
        : undefined,
    flowMessage,
  }), [
    privateStateProvider,
    publicDataProvider,
    proofProvider,
    zkConfigProvider,
    walletProvider,
    midnightProvider,
    flowMessage,
  ]);

  return (
    <ProvidersContext.Provider value={combinedProviders}>
      {children}
    </ProvidersContext.Provider>
  );
};
