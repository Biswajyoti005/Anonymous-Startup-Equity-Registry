import { Link } from '@tanstack/react-router';
import { ReactNode } from 'react';
import { Shield } from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground shadow">
        <nav className="container mx-auto flex items-center gap-6 p-4">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-lg transition hover:opacity-90"
            activeProps={{ className: 'underline' }}
          >
            <Shield className="w-5 h-5" />
            Equity Registry
          </Link>
          <div className="flex gap-4 ml-auto">
            <Link
              to="/equity-registry"
              className="font-semibold transition hover:opacity-80"
              activeProps={{ className: 'underline' }}
            >
              Registry
            </Link>
            <Link
              to="/wallet-ui"
              className="font-semibold transition hover:opacity-80"
              activeProps={{ className: 'underline' }}
            >
              Wallet
            </Link>
          </div>
        </nav>
      </header>
      <main className="container mx-auto flex-1 py-6">
        {children}
      </main>
    </div>
  );
};