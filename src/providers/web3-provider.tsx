"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mainnet, avalanche, avalancheFuji } from "wagmi/chains";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { config } from "./config";

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // ✅ Marquer que le thème est chargé
  }, []);

  // Si le thème n'est pas encore monté, ne pas afficher RainbowKit (évite l'erreur SSR)
  if (!mounted) return null;

  const rainbowTheme = theme === "dark" ? darkTheme() : lightTheme();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rainbowTheme}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}