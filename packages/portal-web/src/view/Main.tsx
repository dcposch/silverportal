import * as React from "react";
import Intro from "./Intro";
import { Routes, Route } from "react-router-dom";
import Header from "./Header";
import SwapEthToBtc from "./Swap";
import ProveTx from "./ProveTx";
import Footer from "./Footer";

export default function Main() {
  return (
    <main>
      <Header />
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/prove" element={<ProveTx />} />
        <Route path="/swap" element={<SwapEthToBtc />} />
      </Routes>
      <Footer />
    </main>
  );
}
