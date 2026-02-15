/**
 * Contract Panel
 *
 * Shows the on-chain contract state and provides the
 * "Register Equity Stake" button to call the contract.
 */

import { useState } from 'react';
import { useContract } from '../contexts/ContractContext';
import { useWallet } from '../contexts/WalletContext';

export default function ContractPanel() {
  const { wallet } = useWallet();
  const { state, contractStatus, statusMessage, contractError, registerEquityStake, isRegistering } = useContract();
  const [txError, setTxError] = useState<string | null>(null);
  const [txSuccess, setTxSuccess] = useState(false);

  if (wallet.status !== 'connected') {
    return (
      <div className="bg-gray-900/60 border border-purple-900/30 rounded-xl p-8 text-center animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-900/30 flex items-center justify-center">
          <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Connect Your Wallet</h3>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          Connect your Midnight Lace wallet to interact with the Anonymous Equity Registry smart contract.
        </p>
      </div>
    );
  }

  const handleRegister = async () => {
    setTxError(null);
    setTxSuccess(false);
    try {
      await registerEquityStake();
      setTxSuccess(true);
      setTimeout(() => setTxSuccess(false), 5000);
    } catch (err: any) {
      setTxError(err?.message || 'Transaction failed');
    }
  };

  return (
    <div className="bg-gray-900/60 border border-purple-900/30 rounded-xl p-6 animate-fade-in">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Smart Contract
      </h2>

      {/* Status */}
      <div className="mb-4 flex items-center gap-2">
        {contractStatus === 'joining' && (
          <>
            <svg className="w-4 h-4 animate-spin text-purple-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
            </svg>
            <span className="text-sm text-purple-300">{statusMessage}</span>
          </>
        )}
        {contractStatus === 'ready' && (
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-sm text-emerald-400">Contract connected</span>
          </>
        )}
        {contractStatus === 'error' && (
          <>
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-sm text-red-400">Error: {contractError}</span>
          </>
        )}
      </div>

      {/* Contract Address */}
      <div className="bg-gray-800/40 rounded-lg p-3 mb-4">
        <p className="text-xs text-gray-500 mb-1">Contract Address</p>
        <p
          className="text-xs text-gray-300 font-mono break-all cursor-pointer hover:text-purple-300"
          onClick={() => navigator.clipboard.writeText(import.meta.env.VITE_CONTRACT_ADDRESS)}
          title="Click to copy"
        >
          {import.meta.env.VITE_CONTRACT_ADDRESS}
        </p>
      </div>

      {/* On-chain State */}
      {state && (
        <div className="bg-gray-800/40 rounded-lg p-4 mb-4">
          <p className="text-xs text-gray-500 mb-2">On-Chain State</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">
                {state.equityStakes.toString()}
              </p>
              <p className="text-xs text-gray-500">Registered Equity Stakes</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-900/40 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Action Status */}
      {(isRegistering || state?.actionMessage) && (
        <div className="bg-purple-900/20 border border-purple-800/30 rounded-lg p-3 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 animate-spin text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
          </svg>
          <span className="text-sm text-purple-300">{state?.actionMessage || statusMessage}</span>
        </div>
      )}

      {/* Success */}
      {txSuccess && (
        <div className="bg-emerald-900/20 border border-emerald-800/30 rounded-lg p-3 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm text-emerald-400">Equity stake registered successfully!</span>
        </div>
      )}

      {/* Error */}
      {txError && (
        <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-400">{txError}</p>
        </div>
      )}

      {/* Register Button */}
      <button
        onClick={handleRegister}
        disabled={contractStatus !== 'ready' || isRegistering}
        className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold
                   hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-900/30
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-purple-600 disabled:hover:to-indigo-600"
      >
        {isRegistering ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
            </svg>
            Processing...
          </span>
        ) : (
          'Register Equity Stake'
        )}
      </button>
    </div>
  );
}
