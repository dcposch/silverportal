import { marked } from "marked";
import * as React from "react";

// Render the README as the main portion of the home page.
// This ensures that the docs on Github and online are always in sync.
const readmeMd = require("../../../../../README.md") as string;

export default function PageIntro() {
  const ix = readmeMd.indexOf("Everything below appears on silvermirror.xyz");
  const md = readmeMd.substring(readmeMd.indexOf("\n", ix));
  const html = marked.parse(md);
  return <article dangerouslySetInnerHTML={{ __html: html }} />;
}
