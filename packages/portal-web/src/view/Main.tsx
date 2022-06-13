import "@rainbow-me/rainbowkit/styles.css";
import "./index.css";

import * as React from "react";
import { Route, Routes } from "react-router-dom";
import PageExchange from "./PageExchange";
import Footer from "./Footer";
import Header from "./Header";
import PageIntro from "./PageIntro";
import PageProveTx from "./PageProveTx";

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
            <Route path="/" element={<PageIntro />} />
            <Route path="/prove" element={<PageProveTx />} />
            <Route path="/exchange" element={<PageExchange />} />
          </Routes>
          <Footer />
        </main>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
