import * as React from "react";
import Intro from "./Intro";
import { Routes, Route } from "react-router-dom";
import Header from "./Header";
import SwapEthToBtc from "./Swap";
import ProveTx from "./ProveTx";

export default function Main() {
  return (
    <main>
      <h1>Silver Portal</h1>
      <Header />
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/prove" element={<ProveTx />} />
        <Route path="/swap" element={<SwapEthToBtc />} />
      </Routes>
    </main>
  );
}
