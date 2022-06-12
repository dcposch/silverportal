import "@rainbow-me/rainbowkit/styles.css";
import "./index.css";

import * as React from "react";
import { Route, Routes } from "react-router-dom";
import Exchange from "./Exchange";
import Footer from "./Footer";
import Header from "./Header";
import Intro from "./Intro";
import ProveTx from "./ProveTx";

import {
  connectorsForWallets,
  getDefaultWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";
import rainbowTheme from "./rainbowKitTheme";

const { chains, provider } = configureChains(
  [chain.ropsten, chain.optimism],
  [
    infuraProvider({ infuraId: "c2098b0ca85643b1ad367c0f479c98f0" }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({ appName: "Silver Portal", chains });

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});
console.log("Wagmi client", wagmiClient);

export default function Main() {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains} theme={rainbowTheme}>
        <main>
          <Header />
          <Routes>
            <Route path="/" element={<Intro />} />
            <Route path="/prove" element={<ProveTx />} />
            <Route path="/exchange" element={<Exchange />} />
          </Routes>
          <Footer />
        </main>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
