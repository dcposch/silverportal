import * as React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";

import Main from "./view/Main";

createRoot(document.querySelector("#root")).render(<App />);

function App() {
  return (
    <HashRouter>
      <Main />
    </HashRouter>
  );
}
