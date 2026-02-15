/**
 * Header Component
 *
 * Top navigation bar with app title and wallet connect button.
 */

import { useWallet } from '../contexts/WalletContext';
import WalletButton from './WalletButton';

export default function Header() {
  const { wallet } = useWallet();

  return (
    <header className="border-b border-purple-900/30 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo / Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Equity Registry</h1>
            <p className="text-xs text-purple-400/80">Midnight Network</p>
          </div>
        </div>

        {/* Network Badge + Wallet */}
        <div className="flex items-center gap-3">
          {wallet.status === 'connected' && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-900/40 text-emerald-400 border border-emerald-800/50">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
              Local Testnet
            </span>
          )}
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
