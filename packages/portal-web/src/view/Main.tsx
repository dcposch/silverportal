import * as React from "react";
import Intro from "./Intro";
import { Routes, Route } from "react-router-dom";
import Header from "./Header";
import Exchange from "./Exchange";
import ProveTx from "./ProveTx";
import Footer from "./Footer";
import "@rainbow-me/rainbowkit/styles.css";

import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";

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

export default function Main() {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
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
