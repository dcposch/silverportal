import "./Header.css";

import * as React from "react";
import { useMemo } from "react";
import { NavLink } from "react-router-dom";

export default function Header() {
  const navTabClass = useMemo(
    () => (p: { isActive: boolean }) => p.isActive ? "nav-tab-sel" : "nav-tab",
    []
  );
  return (
    <header>
      <img src="./sketch/header.excalidraw.png"></img>
      <nav>
        <NavLink className={navTabClass} to="/">
          📖 Home
        </NavLink>
        {/*<NavLink className={navTabClass} to="/prove">
          🔏 Prove
        </NavLink>*/}
        <NavLink className={navTabClass} to="/exchange">
          🪙 Exchange
        </NavLink>
      </nav>
    </header>
  );
}
