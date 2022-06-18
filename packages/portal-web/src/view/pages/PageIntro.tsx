import "./PageIntro.css";

import { marked } from "marked";
import * as React from "react";

const readmeMd = require("../../../../../README.md");

export default function PageIntro() {
  const html = marked.parse(readmeMd);
  return <article dangerouslySetInnerHTML={{ __html: html }} />;
}
