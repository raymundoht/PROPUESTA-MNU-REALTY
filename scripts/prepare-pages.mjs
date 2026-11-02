#!/usr/bin/env node
import { copyFileSync, cpSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distClient = path.join(root, "dist", "client");
const docs = path.join(root, "docs");

mkdirSync(docs, { recursive: true });
cpSync(distClient, docs, { recursive: true });
copyFileSync(path.join(docs, "index.html"), path.join(docs, "404.html"));
writeFileSync(path.join(docs, ".nojekyll"), "");
writeFileSync(path.join(root, ".nojekyll"), "");

console.log("Prepared GitHub Pages in docs/ with .nojekyll and 404.html");
