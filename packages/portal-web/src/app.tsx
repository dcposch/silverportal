import * as React from "react";
import ReactDOM from "react-dom";
import { HashRouter } from "react-router-dom";

import Main from "./view/Main";

ReactDOM.render(<App />, document.querySelector("#root"));

function App() {
  return (
    <HashRouter>
      <Main />
    </HashRouter>
  );
}
