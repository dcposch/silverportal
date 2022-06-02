import * as React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header>
      <Link to="/">Intro</Link>
      <Link to="/btc-to-eth">BTC to ETH</Link>
      <Link to="/eth-to-btc">ETH to BTC</Link>
    </header>
  );
}
