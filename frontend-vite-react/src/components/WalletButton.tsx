/**
 * Wallet Button Component
 *
 * Shows "Connect Wallet" when disconnected, or the address + disconnect dropdown when connected.
 * Uses the DApp Connector API via WalletContext to discover and connect to Lace.
 */

import { useState, useRef, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';

const NETWORK_ID = 'undeployed'; // local testnet

export default function WalletButton() {
  const { wallet, availableWallets, connect, disconnect, refreshWallets } = useWallet();
  const [showWalletPicker, setShowWalletPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowWalletPicker(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ── Connected state ───────────────────────────────────────
  if (wallet.status === 'connected' && wallet.unshieldedAddress) {
    const addr = wallet.unshieldedAddress;
    const short = addr.length > 20
      ? `${addr.slice(0, 10)}...${addr.slice(-6)}`
      : addr;

    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-900/30 border border-purple-700/50 text-purple-200 hover:bg-purple-900/50 transition-all text-sm font-medium"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {short}
          <svg className="w-3 h-3 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-56 rounded-lg bg-gray-900 border border-purple-800/50 shadow-xl py-1 z-50">
            <button
              onClick={() => {
                navigator.clipboard.writeText(addr);
                setShowMenu(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-purple-900/30 hover:text-white transition-colors"
            >
              Copy Address
            </button>
            <hr className="border-purple-900/30 my-1" />
            <button
              onClick={() => { disconnect(); setShowMenu(false); }}
              className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Connecting state ──────────────────────────────────────
  if (wallet.status === 'connecting') {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-700/50 text-purple-300 text-sm font-medium cursor-wait"
      >
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
        </svg>
        Connecting...
      </button>
    );
  }

  // ── Disconnected state ────────────────────────────────────
  return (
    <div className="relative" ref={pickerRef}>
      <button
        onClick={() => {
          refreshWallets();
          setShowWalletPicker(!showWalletPicker);
        }}
        className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-900/30"
      >
        Connect Wallet
      </button>

      {showWalletPicker && (
        <div className="absolute right-0 mt-2 w-72 rounded-lg bg-gray-900 border border-purple-800/50 shadow-xl z-50 animate-fade-in">
          <div className="px-4 py-3 border-b border-purple-900/30">
            <h3 className="text-sm font-semibold text-white">Select Wallet</h3>
            <p className="text-xs text-gray-500 mt-0.5">Network: Local Testnet (undeployed)</p>
          </div>

          {wallet.status === 'error' && (
            <div className="px-4 py-2 bg-red-900/20 border-b border-red-900/30">
              <p className="text-xs text-red-400">{wallet.error}</p>
            </div>
          )}

          <div className="p-2">
            {availableWallets.length === 0 ? (
              <div className="px-3 py-6 text-center">
                <p className="text-sm text-gray-400">No Midnight wallets detected</p>
                <p className="text-xs text-gray-600 mt-1">
                  Install the{' '}
                  <a
                    href="https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 underline"
                  >
                    Midnight Lace
                  </a>{' '}
                  browser extension
                </p>
              </div>
            ) : (
              availableWallets.map((w) => (
                <button
                  key={w.rdns}
                  onClick={async () => {
                    setShowWalletPicker(false);
                    await connect(w.rdns, NETWORK_ID);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-md hover:bg-purple-900/30 transition-colors group"
                >
                  {w.icon ? (
                    <img src={w.icon} alt={w.name} className="w-8 h-8 rounded" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-purple-800/50 flex items-center justify-center text-purple-300 text-xs font-bold">
                      {w.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-200 group-hover:text-white">{w.name}</p>
                    <p className="text-xs text-gray-500">v{w.apiVersion}</p>
                  </div>
                  <svg className="w-4 h-4 ml-auto text-gray-600 group-hover:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
