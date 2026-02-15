/**
 * Wallet Info Panel
 *
 * Displays detailed wallet information when connected:
 * addresses, balances, and connection configuration.
 */

import { useWallet } from '../contexts/WalletContext';

export default function WalletInfo() {
  const { wallet } = useWallet();

  if (wallet.status !== 'connected') return null;

  const formatBalance = (balances: Record<string, bigint> | undefined) => {
    if (!balances) return '0';
    const total = Object.values(balances).reduce((sum, b) => sum + b, 0n);
    return total.toString();
  };

  const truncate = (s: string | undefined, start = 12, end = 8) => {
    if (!s) return 'N/A';
    if (s.length <= start + end + 3) return s;
    return `${s.slice(0, start)}...${s.slice(-end)}`;
  };

  return (
    <div className="bg-gray-900/60 border border-purple-900/30 rounded-xl p-6 animate-fade-in">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        Wallet Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Unshielded */}
        <InfoCard
          label="Unshielded Address"
          value={truncate(wallet.unshieldedAddress)}
          fullValue={wallet.unshieldedAddress}
        />
        <InfoCard
          label="Unshielded Balance"
          value={`${formatBalance(wallet.unshieldedBalances)} tDUST`}
        />

        {/* Shielded */}
        <InfoCard
          label="Shielded Address"
          value={truncate(wallet.shieldedAddress)}
          fullValue={wallet.shieldedAddress}
        />
        <InfoCard
          label="Shielded Balance"
          value={`${formatBalance(wallet.shieldedBalances)} tDUST`}
        />

        {/* Dust */}
        <InfoCard
          label="Dust Address"
          value={truncate(wallet.dustAddress)}
          fullValue={wallet.dustAddress}
        />
        <InfoCard
          label="Dust Balance"
          value={wallet.dustBalance ? `${wallet.dustBalance.balance} / ${wallet.dustBalance.cap}` : 'N/A'}
        />
      </div>

      {/* Service URIs */}
      {wallet.configuration && (
        <div className="mt-4 pt-4 border-t border-purple-900/20">
          <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Service Endpoints</p>
          <div className="grid grid-cols-1 gap-1 text-xs">
            <ServiceRow label="Indexer" value={wallet.configuration.indexerUri} />
            <ServiceRow label="Indexer WS" value={wallet.configuration.indexerWsUri} />
            <ServiceRow label="Prover" value={wallet.configuration.proverServerUri} />
            <ServiceRow label="Node" value={wallet.configuration.nodeUri} />
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value, fullValue }: { label: string; value: string; fullValue?: string }) {
  return (
    <div className="bg-gray-800/40 rounded-lg p-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p
        className={`text-sm text-gray-200 font-mono ${fullValue ? 'cursor-pointer hover:text-purple-300' : ''}`}
        title={fullValue}
        onClick={() => fullValue && navigator.clipboard.writeText(fullValue)}
      >
        {value}
      </p>
    </div>
  );
}

function ServiceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="text-gray-500 w-20 shrink-0">{label}:</span>
      <span className="text-gray-400 font-mono truncate">{value}</span>
    </div>
  );
}
