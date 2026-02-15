import { createRootRoute, Outlet } from '@tanstack/react-router';
import * as pino from "pino";
import { ThemeProvider } from "@/components/theme-provider";
import { MidnightMeshProvider } from "@/modules/midnight/wallet-widget/contexts/wallet";
import { EquityRegistryAppProvider } from "@/modules/midnight/equity-registry-sdk/contexts";
import { MainLayout } from "@/layouts/layout";

export const logger = pino.pino({
  level: "trace",
});

// Deployed equity registry contract address
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS!;

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <MidnightMeshProvider logger={logger}>
        <EquityRegistryAppProvider logger={logger} contractAddress={contractAddress}>
          <MainLayout>
            <Outlet />
          </MainLayout>          
        </EquityRegistryAppProvider>
      </MidnightMeshProvider>
    </ThemeProvider>
  );
}
