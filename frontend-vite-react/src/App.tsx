/**
 * App - Root Component
 *
 * Wraps the application in WalletProvider and ContractProvider,
 * then renders the Header, WalletInfo, and ContractPanel.
 */

import { WalletProvider } from './contexts/WalletContext';
import { ContractProvider } from './contexts/ContractContext';
import Header from './components/Header';
import WalletInfo from './components/WalletInfo';
import ContractPanel from './components/ContractPanel';

export default function App() {
  return (
    <WalletProvider>
      <ContractProvider>
        <div className="min-h-screen flex flex-col">
          <Header />

          <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
            {/* Hero */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Anonymous Startup Equity Registry
              </h2>
              <p className="text-gray-400 max-w-lg mx-auto">
                Register and verify equity stakes privately on the Midnight blockchain
                using zero-knowledge proofs.
              </p>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <ContractPanel />
              <WalletInfo />
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-purple-900/20 py-4">
            <p className="text-center text-xs text-gray-600">
              Built on{' '}
              <a href="https://midnight.network" target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:text-purple-400">
                Midnight Network
              </a>
              {' '}| Zero-Knowledge Privacy
            </p>
          </footer>
        </div>
      </ContractProvider>
    </WalletProvider>
  );
}
