import * as React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header>
      <Link to="/">Intro</Link>
      <Link to="/prove">Prove</Link>
      <Link to="/swap">Swap</Link>
    </header>
  );
}
