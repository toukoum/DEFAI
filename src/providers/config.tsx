import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { avalanche, avalancheFuji, mainnet } from "viem/chains";

export const config = getDefaultConfig({
  appName: "oxford",
  projectId: "7a8f913d026858bae28fb603bc9b42ca",
  chains: [avalanche, avalancheFuji, mainnet],
  ssr: false,
});
