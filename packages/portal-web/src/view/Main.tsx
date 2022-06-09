import * as React from "react";
import Intro from "./Intro";
import { Routes, Route } from "react-router-dom";
import Header from "./Header";
import Exchange from "./Exchange";
import ProveTx from "./ProveTx";
import Footer from "./Footer";

export default function Main() {
  return (
    <main>
      <Header />
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/prove" element={<ProveTx />} />
        <Route path="/exchange" element={<Exchange />} />
      </Routes>
      <Footer />
    </main>
  );
}
