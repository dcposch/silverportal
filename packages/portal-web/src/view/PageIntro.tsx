import * as React from "react";
import { marked } from "marked";

const readmeMd = require("../../../../README.md");

export default function PageIntro() {
  const html = marked.parse(readmeMd);
  return <article dangerouslySetInnerHTML={{ __html: html }} />;
}
