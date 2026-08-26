#!/usr/bin/env node

"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn, spawnSync } = require("node:child_process");

const WORKDIR = path.resolve(process.cwd());
const SOURCE_DIR = path.join(WORKDIR, "apuntes", "chatgpt");
const OUTPUT = path.join(WORKDIR, "Apuntes-Tup26-P4.epub");
const BOOK_ID = "Apuntes-TUP26-P4";
const BOOK_TITLE = "Apuntes de Programación IV";
const BOOK_LANGUAGE = "es";
const BOOK_SUBTITLE = "JavaScript, Node.js y desarrollo web";
const BOOK_AUTHOR = "Ing. Alejandro Di Battista";
const BOOK_COVER = path.join(WORKDIR, "output", "imagegen", "portada-programacion-iv.png");
const COVER_FILENAME = "portada.png";
const COVER_MEDIA_TYPE = "image/png";
const EXCLUDED = [
  "00.*.md",
  "09.*.md",
  "README.md",
  "CONTRIBUTING.md",
  "LICENSE.md",
  "examen*.md",
];
const MERMAID_TIMEOUT_SECONDS = 120;

function globToRegExp(pattern) {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped.replaceAll("*", ".*").replaceAll("?", ".")}$`);
}

function isExcluded(filePath) {
  const name = path.basename(filePath);
  return EXCLUDED.some((pattern) => globToRegExp(pattern).test(name));
}

function escapeHtml(value, quote = false) {
  let escaped = String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  if (quote) {
    escaped = escaped.replaceAll('"', "&quot;").replaceAll("'", "&#x27;");
  }
  return escaped;
}

function slugify(text) {
  const asciiOnly = text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  const slug = asciiOnly
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return slug || "section";
}

function normalizeHeadingText(text) {
  return text.trim().replace(/\s+#+\s*$/, "").trim();
}

function firstHeading(markdownText, fallback) {
  for (const line of markdownText.split(/\r?\n/)) {
    const stripped = line.trim();
    if (stripped.startsWith("# ")) {
      return normalizeHeadingText(stripped.slice(2));
    }
  }
  return fallback;
}

function inlineMarkdown(source) {
  const codeSpans = [];
  const escapedChars = [];
  let text = source.replace(/`([^`]+)`/g, (_match, code) => {
    codeSpans.push(`<code>${escapeHtml(code)}</code>`);
    return `@@CODE${codeSpans.length - 1}@@`;
  });

  text = text.replace(/\\([\\`*_{}\[\]()#+\-.!<>|])/g, (_match, character) => {
    escapedChars.push(escapeHtml(character));
    return `@@ESC${escapedChars.length - 1}@@`;
  });

  text = escapeHtml(text);
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  escapedChars.forEach((escaped, index) => {
    text = text.replaceAll(`@@ESC${index}@@`, escaped);
  });
  codeSpans.forEach((code, index) => {
    text = text.replaceAll(`@@CODE${index}@@`, code);
  });
  return text;
}

function stripLeadingTitle(markdownText, chapterTitle) {
  const lines = markdownText.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const stripped = lines[index].trim();
    if (!stripped) continue;
    if (stripped === `# ${chapterTitle}`) {
      const remainder = lines.slice(index + 1);
      while (remainder.length > 0 && !remainder[0].trim()) remainder.shift();
      return remainder.join("\n");
    }
    break;
  }
  return markdownText;
}

function renderPlainCode(code, languageClass = "") {
  const classAttribute = languageClass ? ` class="${languageClass}"` : "";
  return `<pre><code${classAttribute}>${escapeHtml(code)}</code></pre>`;
}

function codeLanguageLabel(language) {
  const lang = language.trim().toLowerCase();
  const aliases = {
    "": "texto",
    htm: "html",
    html: "html",
    txt: "texto",
    text: "texto",
    plaintext: "texto",
    cs: "csharp",
    cshtml: "razor",
    razor: "razor",
    shell: "bash",
    sh: "bash",
    zsh: "bash",
    xhtml: "html",
    xml: "xml",
  };
  return aliases[lang] ?? lang;
}

function wrapCodeBlock(content, language) {
  codeLanguageLabel(language);
  return `<div class="code-block">
    ${content}
</div>`;
}

function splitTableRow(line) {
  let stripped = line.trim();
  if (stripped.startsWith("|")) stripped = stripped.slice(1);
  if (stripped.endsWith("|")) stripped = stripped.slice(0, -1);

  const cells = [];
  let current = "";
  let escaped = false;
  for (const character of stripped) {
    if (escaped) {
      current += character;
      escaped = false;
      continue;
    }
    if (character === "\\") {
      escaped = true;
      continue;
    }
    if (character === "|") {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += character;
  }
  if (escaped) current += "\\";
  cells.push(current.trim());
  return cells.map((cell) => cell.replaceAll("\\|", "|"));
}

function isTableSeparator(line) {
  const stripped = line.trim().replace(/^\|+|\|+$/g, "");
  if (!stripped) return false;
  const parts = stripped.split("|").map((part) => part.trim());
  return parts.length > 0 && parts.every((part) => part && /^:?-{3,}:?$/.test(part));
}

function renderTable(headerLine, separatorLine, rows) {
  const headers = splitTableRow(headerLine);
  const alignments = splitTableRow(separatorLine).map((cell) => {
    const left = cell.startsWith(":");
    const right = cell.endsWith(":");
    if (left && right) return "center";
    if (left) return "left";
    if (right) return "right";
    return "";
  });
  const bodyRows = rows.map(splitTableRow);
  const columnCount = Math.max(headers.length, alignments.length, ...bodyRows.map((row) => row.length), 0);
  while (headers.length < columnCount) headers.push("");
  while (alignments.length < columnCount) alignments.push("");

  const normalizedRows = bodyRows.map((row) => {
    const padded = row.slice(0, columnCount);
    while (padded.length < columnCount) padded.push("");
    return padded;
  });
  const cellAttribute = (index) =>
    alignments[index] ? ` style="text-align: ${alignments[index]};"` : "";
  const headerHtml = headers
    .map((header, index) => `<th${cellAttribute(index)}>${inlineMarkdown(header)}</th>`)
    .join("");
  const rowsHtml = normalizedRows
    .map(
      (row) =>
        `<tr>${row
          .map((cell, index) => `<td${cellAttribute(index)}>${inlineMarkdown(cell)}</td>`)
          .join("")}</tr>`,
    )
    .join("");
  return `<table>\n<thead><tr>${headerHtml}</tr></thead>\n<tbody>\n${rowsHtml}\n</tbody>\n</table>`;
}

function highlightRegexContent(code, patterns) {
  const combined = new RegExp(
    patterns.map(([name, pattern]) => `(?<${name}>${pattern})`).join("|"),
    "gm",
  );
  const pieces = [];
  let last = 0;
  for (const match of code.matchAll(combined)) {
    const start = match.index;
    const end = start + match[0].length;
    if (start > last) pieces.push(escapeHtml(code.slice(last, start)));
    const tokenType = Object.entries(match.groups ?? {}).find(([, value]) => value !== undefined)?.[0] ?? "txt";
    pieces.push(`<span class="tok-${tokenType}">${escapeHtml(code.slice(start, end))}</span>`);
    last = end;
  }
  if (last < code.length) pieces.push(escapeHtml(code.slice(last)));
  return pieces.join("");
}

function highlightRegex(code, patterns, languageClass) {
  const content = highlightRegexContent(code, patterns);
  return `<pre><code class="${languageClass}">${content}</code></pre>`;
}

function highlightRazor(code, codePatterns) {
  const htmlPattern = /<!--[\s\S]*?-->|<\/?[A-Za-z][^>]*>/gm;
  const htmlPatterns = [
    ["tag", String.raw`<\/?[A-Za-z][A-Za-z0-9:-]*`],
    ["attr", String.raw`\b[A-Za-z_:][A-Za-z0-9:._-]*(?=\s*=)`],
    ["expression", String.raw`@(?:await\s+)?[A-Za-z_][A-Za-z0-9_.]*(?:\s*\([^()\n]*\))?`],
    ["string", String.raw`"(?:\\.|[^"@\\])*"|'(?:\\.|[^'@\\])*'|["']`],
    ["punct", String.raw`\/?>|=`],
  ];
  const pieces = [];
  let last = 0;
  for (const match of code.matchAll(htmlPattern)) {
    const start = match.index;
    const end = start + match[0].length;
    if (start > last) pieces.push(highlightRegexContent(code.slice(last, start), codePatterns));
    const fragment = code.slice(start, end);
    if (fragment.startsWith("<!--")) {
      pieces.push(`<span class="tok-comment">${escapeHtml(fragment)}</span>`);
    } else {
      pieces.push(highlightRegexContent(fragment, htmlPatterns));
    }
    last = end;
  }
  if (last < code.length) pieces.push(highlightRegexContent(code.slice(last), codePatterns));
  return `<pre><code class="language-razor">${pieces.join("")}</code></pre>`;
}

function renderCodeBlock(code, language) {
  const lang = language.toLowerCase();
  if (lang === "razor" || lang === "cshtml") {
    const csharpKeywords =
      "using|namespace|class|record|struct|interface|enum|public|private|protected|internal|static|" +
      "void|int|string|bool|var|new|return|if|else|switch|case|default|break|continue|for|foreach|" +
      "while|do|try|catch|finally|throw|null|true|false|this|base|out|ref|in|is|as|params|await|" +
      "async|get|set";
    const razorDirectives =
      "page|model|using|inject|functions|code|implements|inherits|layout|namespace|attribute|" +
      "typeparam|rendermode|section";
    const razorControls = "if|else|switch|for|foreach|while|do|try|catch|finally|lock|using|await";
    const patterns = [
      ["comment", String.raw`@\*[\s\S]*?\*@|\/\/[^\n]*|\/\*[\s\S]*?\*\/`],
      ["directive", `^[ \\t]*@(?:${razorDirectives})\\b`],
      ["razor", `@(?:${razorControls})\\b|@(?=[{(:])`],
      ["expression", String.raw`@(?:await\s+)?[A-Za-z_][A-Za-z0-9_.]*(?:\s*\([^()\n]*\))?`],
      ["string", String.raw`@"(?:""|[^"])*"|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])+'`],
      ["number", String.raw`\b\d+(?:\.\d+)?\b`],
      ["keyword", `\\b(?:${csharpKeywords})\\b`],
      ["type", String.raw`\b(?:Model|DateTime|Task|List|IEnumerable|RenderFragment|EventCallback)\b`],
    ];
    return wrapCodeBlock(highlightRazor(code, patterns), lang);
  }

  if (lang === "cs" || lang === "csharp") {
    const keywords =
      "using|namespace|class|record|struct|interface|enum|public|private|protected|internal|static|" +
      "void|int|string|bool|var|new|return|if|else|switch|case|default|break|continue|for|foreach|" +
      "while|do|try|catch|finally|throw|null|true|false|this|base|out|ref|in|is|as|params";
    const patterns = [
      ["comment", String.raw`\/\/[^\n]*`],
      ["string", String.raw`"(?:\\.|[^"\\])*"`],
      ["char", String.raw`'(?:\\.|[^'\\])+'`],
      ["number", String.raw`\b\d+(?:\.\d+)?\b`],
      ["keyword", `\\b(?:${keywords})\\b`],
      ["type", String.raw`\b(?:Console|List|File|Directory|Path|Environment|Exception|ConsoleKeyInfo|ConsoleKey)\b`],
    ];
    return wrapCodeBlock(highlightRegex(code, patterns, "language-csharp"), lang);
  }

  if (["bash", "sh", "zsh", "shell"].includes(lang)) {
    const keywords = "if|then|else|fi|for|in|do|done|case|esac|while|function";
    const patterns = [
      ["comment", String.raw`#[^\n]*`],
      ["string", String.raw`"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'`],
      ["var", String.raw`\$[A-Za-z_][A-Za-z0-9_]*|\$\{[^}]+\}`],
      ["number", String.raw`\b\d+\b`],
      ["keyword", `\\b(?:${keywords})\\b`],
      ["command", String.raw`^(?:\s*)(?:dotnet|git|cd|ls|cat|rg|sed|python3|bash|zsh|mkdir|cp|mv|rm)\b`],
    ];
    return wrapCodeBlock(highlightRegex(code, patterns, "language-shell"), lang);
  }

  if (["htm", "html", "xhtml", "xml"].includes(lang)) {
    const patterns = [
      ["comment", String.raw`<!--[\s\S]*?-->`],
      ["doctype", String.raw`<!DOCTYPE(?:\s+[^>]+)?>|<!doctype(?:\s+[^>]+)?>`],
      ["tag", String.raw`<\/?[A-Za-z][A-Za-z0-9:-]*|<\?[A-Za-z][A-Za-z0-9:-]*`],
      ["attr", String.raw`\b[A-Za-z_:][A-Za-z0-9:._-]*(?=\s*=)`],
      ["string", String.raw`"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'`],
      ["punct", String.raw`\?>|\/?>|=`],
    ];
    return wrapCodeBlock(highlightRegex(code, patterns, "language-html"), lang);
  }

  const languageClass = lang ? `language-${lang}` : "";
  return wrapCodeBlock(renderPlainCode(code, languageClass), lang);
}

function findExecutable(command) {
  const directories = (process.env.PATH ?? "").split(path.delimiter);
  for (const directory of directories) {
    const candidate = path.join(directory, command);
    try {
      fs.accessSync(candidate, fs.constants.X_OK);
      return candidate;
    } catch {
      // Continúa buscando en PATH.
    }
  }
  return null;
}

function mermaidCommand() {
  const mmdc = findExecutable("mmdc");
  if (mmdc) return [mmdc];
  const npx = findExecutable("npx");
  if (npx) return [npx, "-y", "@mermaid-js/mermaid-cli"];
  throw new Error(
    "Hay diagramas Mermaid, pero no se encontró Mermaid CLI. " +
      "Instale @mermaid-js/mermaid-cli o deje disponible el comando mmdc.",
  );
}

function renderMermaidSvg(code, assetName) {
  const command = mermaidCommand();
  const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "publicar-mermaid-"));
  const inputPath = path.join(tempDirectory, `${assetName}.mmd`);
  const outputPath = path.join(tempDirectory, `${assetName}.svg`);
  try {
    fs.writeFileSync(inputPath, code, "utf8");
    const result = spawnSync(
      command[0],
      [...command.slice(1), "-i", inputPath, "-o", outputPath, "--backgroundColor", "transparent"],
      {
        encoding: "utf8",
        timeout: MERMAID_TIMEOUT_SECONDS * 1000,
        maxBuffer: 16 * 1024 * 1024,
      },
    );
    if (result.error?.code === "ETIMEDOUT") {
      throw new Error(
        `Mermaid CLI no terminó en ${MERMAID_TIMEOUT_SECONDS} segundos al renderizar ${assetName}.`,
      );
    }
    if (result.error) throw result.error;
    if (result.status !== 0 || !fs.existsSync(outputPath)) {
      const details = String(result.stderr || result.stdout || "").trim();
      throw new Error(`No se pudo renderizar el diagrama Mermaid ${assetName}: ${details}`);
    }
    return fs.readFileSync(outputPath);
  } finally {
    fs.rmSync(tempDirectory, { force: true, recursive: true });
  }
}

function renderMermaidBlock(code, chapterNumber, assets) {
  const digest = crypto.createHash("sha1").update(code, "utf8").digest("hex").slice(0, 12);
  const assetHref = `images/mermaid-${String(chapterNumber).padStart(2, "0")}-${digest}.svg`;
  const assetName = path.basename(assetHref, path.extname(assetHref));
  assets.push([assetHref, renderMermaidSvg(code, assetName)]);
  return `<figure class="mermaid-diagram"><img src="${assetHref}" alt="Diagrama Mermaid" /></figure>`;
}

function wrapXhtmlPage(title, body) {
  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${BOOK_LANGUAGE}">
  <head>
    <title>${escapeHtml(title)}</title>
    <link rel="stylesheet" type="text/css" href="styles.css" />
  </head>
  <body>
    ${body}
  </body>
</html>
`;
}

function buildCoverPage() {
  const body = `
<section epub:type="cover" class="cover-page">
  <div class="cover-frame">
    <img src="${COVER_FILENAME}" alt="Portada de Apuntes de Programación IV" />
  </div>
</section>
`;
  return wrapXhtmlPage("Portada", body);
}

function markdownToXhtml(markdownText, chapterTitle, chapterNumber) {
  const source = stripLeadingTitle(markdownText, chapterTitle);
  const lines = source.split(/\r?\n/);
  const parts = [];
  const assets = [];
  let paragraph = [];
  let inCode = false;
  let codeLines = [];
  let codeLanguage = "";
  const listStack = [];
  let inBlockquote = false;
  let skippedFirstH1 = false;

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      const joined = paragraph.map((line) => line.trim()).join(" ").trim();
      if (joined) parts.push(`<p>${inlineMarkdown(joined)}</p>`);
    }
    paragraph = [];
  };
  const closeLists = () => {
    while (listStack.length > 0) parts.push(`</${listStack.pop()}>`);
  };
  const closeBlockquote = () => {
    if (inBlockquote) {
      flushParagraph();
      closeLists();
      parts.push("</blockquote>");
      inBlockquote = false;
    }
  };

  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    const stripped = line.trim();
    if (stripped.startsWith("```")) {
      flushParagraph();
      closeLists();
      if (inBlockquote) closeBlockquote();
      if (inCode) {
        const code = codeLines.join("\n");
        parts.push(
          codeLanguage === "mermaid"
            ? renderMermaidBlock(code, chapterNumber, assets)
            : renderCodeBlock(code, codeLanguage),
        );
        codeLines = [];
        codeLanguage = "";
        inCode = false;
      } else {
        inCode = true;
        codeLanguage = stripped.slice(3).trim().toLowerCase();
      }
      index += 1;
      continue;
    }
    if (inCode) {
      codeLines.push(line);
      index += 1;
      continue;
    }
    if (!stripped) {
      flushParagraph();
      closeLists();
      closeBlockquote();
      index += 1;
      continue;
    }
    if (stripped === "---") {
      flushParagraph();
      closeLists();
      closeBlockquote();
      parts.push("<hr />");
      index += 1;
      continue;
    }
    if (stripped.startsWith(">")) {
      flushParagraph();
      closeLists();
      if (!inBlockquote) {
        parts.push("<blockquote>");
        inBlockquote = true;
      }
      parts.push(`<p>${inlineMarkdown(stripped.slice(1).trimStart())}</p>`);
      index += 1;
      continue;
    }
    closeBlockquote();
    if (line.includes("|") && index + 1 < lines.length && isTableSeparator(lines[index + 1])) {
      flushParagraph();
      closeLists();
      const tableRows = [];
      let cursor = index + 2;
      while (cursor < lines.length) {
        const candidate = lines[cursor];
        if (!candidate.trim() || !candidate.includes("|")) break;
        tableRows.push(candidate);
        cursor += 1;
      }
      parts.push(renderTable(line, lines[index + 1], tableRows));
      index = cursor;
      continue;
    }
    const headingMatch = stripped.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      closeLists();
      const level = headingMatch[1].length;
      const title = normalizeHeadingText(headingMatch[2]);
      if (level === 1 && !skippedFirstH1) {
        skippedFirstH1 = true;
        index += 1;
        continue;
      }
      parts.push(`<h${level} id="${slugify(title)}">${inlineMarkdown(title)}</h${level}>`);
      index += 1;
      continue;
    }
    const orderedMatch = stripped.match(/^(\d+)\.\s+(.*)$/);
    const unorderedMatch = stripped.match(/^[-*]\s+(.*)$/);
    if (orderedMatch || unorderedMatch) {
      flushParagraph();
      const tag = orderedMatch ? "ol" : "ul";
      const content = orderedMatch ? orderedMatch[2] : unorderedMatch[1];
      if (listStack.length === 0 || listStack.at(-1) !== tag) {
        closeLists();
        parts.push(`<${tag}>`);
        listStack.push(tag);
      }
      parts.push(`<li>${inlineMarkdown(content.trim())}</li>`);
      index += 1;
      continue;
    }
    paragraph.push(line);
    index += 1;
  }

  flushParagraph();
  closeLists();
  closeBlockquote();
  if (inCode) {
    const code = codeLines.join("\n");
    parts.push(
      codeLanguage === "mermaid"
        ? renderMermaidBlock(code, chapterNumber, assets)
        : renderCodeBlock(code, codeLanguage),
    );
  }
  const chapterBody = `
<section epub:type="chapter">
  <header class="chapter-header">
    <p class="chapter-kicker">Capítulo ${chapterNumber}</p>
    <h1>${inlineMarkdown(chapterTitle)}</h1>
  </header>
  ${parts.join("\n")}
</section>
`;
  return [wrapXhtmlPage(chapterTitle, chapterBody), assets];
}

const CSS = `
:root {
  color-scheme: light;
  --font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Aptos, Helvetica, Arial, sans-serif;
  --font-display: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Aptos, Helvetica, Arial, sans-serif;
}
@page { margin: 7% 8%; }
body {
  background: white;
  background: oklch(100% 0 0);
  color: #2a2d33;
  color: oklch(27% 0.01 260);
  font-family: var(--font-sans);
  font-size: 1em;
  font-kerning: normal;
  line-height: 1.68;
  margin: 7% 8%;
  orphans: 3;
  text-rendering: optimizeLegibility;
  widows: 3;
}
p, ul, ol, blockquote { margin-top: 0; margin-bottom: 1em; max-width: 72ch; }
ul, ol { padding-left: 1.55em; }
li { margin: 0.2em 0; padding-left: 0.12em; }
h1, h2, h3, h4, h5, h6 {
  color: #20242a;
  color: oklch(24% 0.01 260);
  font-family: var(--font-display);
  font-weight: 740;
  line-height: 1.16;
  margin: 1.7em 0 0.46em;
  page-break-after: avoid;
  text-wrap: balance;
}
h1 { font-size: 1.92rem; letter-spacing: -0.02em; }
h2 {
  border-bottom: 1px solid #d9dee6;
  border-bottom-color: oklch(89% 0.008 255);
  font-size: 1.46rem;
  padding-bottom: 0.24em;
}
h3 { font-size: 1.18rem; }
h4, h5, h6 { color: #3a414b; color: oklch(34% 0.012 260); font-size: 1rem; font-weight: 800; }
a {
  color: #225f72;
  color: oklch(43% 0.065 215);
  text-decoration-thickness: 0.08em;
  text-underline-offset: 0.16em;
}
strong { color: #17211a; color: oklch(22% 0.018 145); font-weight: 700; }
code {
  background: #f3f4f7;
  background: oklch(96.5% 0.004 260);
  border: 1px solid #e7e9ee;
  border-color: oklch(91.5% 0.004 260);
  border-radius: 0.38em;
  color: #2e3642;
  color: oklch(31% 0.015 255);
  font-family: "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 0.86em;
  font-variant-ligatures: none;
  padding: 0.08em 0.3em;
}
pre { margin: 0; white-space: pre-wrap; }
pre code { background: transparent; border: 0; border-radius: 0; color: inherit; display: block; line-height: 1.48; padding: 0; }
.code-block {
  background: #f5f6fa;
  background: oklch(97.2% 0.005 260);
  border: 1px solid #e7e9ef;
  border-color: oklch(91.3% 0.004 260);
  border-radius: 0.9em;
  margin: 1.2em 0 1.35em;
  max-width: 100%;
  page-break-inside: avoid;
}
.code-block-header { border-bottom: 1px solid #e5e5e1; border-bottom-color: oklch(91% 0.003 110); padding: 0.46em 0.85em 0.38em; }
.code-block-language {
  color: #52604f;
  color: oklch(46% 0.026 132);
  font-family: var(--font-sans);
  font-size: 0.66em;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}
.code-block pre { padding: 0.88em 1em 0.94em; }
.code-block code { font-size: 0.85em; line-height: 1.56; }
.mermaid-diagram { margin: 1.25em 0 1.45em; max-width: 100%; page-break-inside: avoid; text-align: center; }
.mermaid-diagram img { display: inline-block; height: auto; max-width: 100%; }
table {
  background: transparent;
  border: 0;
  border-collapse: collapse;
  font-family: var(--font-sans);
  font-size: 0.92em;
  line-height: 1.42;
  margin: 1.15em 0 1.35em;
  width: 100%;
}
th, td { border-bottom: 1px solid #d9dee6; border-bottom-color: oklch(89% 0.008 255); padding: 0.56em 0.64em; vertical-align: top; }
th {
  background: transparent;
  color: #2a2f36;
  color: oklch(28% 0.01 260);
  font-size: 0.98em;
  font-weight: 700;
  letter-spacing: 0;
  text-align: left;
  text-transform: none;
}
tr:last-child td { border-bottom: 0; }
.tok-comment { color: #60705d; color: oklch(50% 0.031 132); font-style: italic; }
.tok-string, .tok-char { color: #28623f; color: oklch(45% 0.08 150); }
.tok-number { color: #6d5596; color: oklch(48% 0.071 305); }
.tok-keyword, .tok-directive, .tok-razor { color: #8a3d20; color: oklch(45% 0.094 47); font-weight: 700; }
.tok-expression { color: #225f72; color: oklch(43% 0.065 215); font-weight: 650; }
.tok-type { color: #225f72; color: oklch(43% 0.065 215); }
.tok-var { color: #745b21; color: oklch(47% 0.064 82); }
.tok-command { color: #225f72; color: oklch(43% 0.065 215); font-weight: 700; }
.tok-doctype { color: #6c6177; color: oklch(49% 0.029 305); font-weight: 700; }
.tok-tag, .tok-punct { color: #225f72; color: oklch(43% 0.065 215); }
.tok-attr { color: #8a3d20; color: oklch(45% 0.094 47); }
blockquote {
  background: #f7f8fb;
  background: oklch(97.7% 0.004 260);
  border: 1px solid #e7e9ef;
  border-color: oklch(91.3% 0.004 260);
  border-radius: 0.8em;
  color: #3f4652;
  color: oklch(37% 0.012 260);
  font-style: normal;
  margin-left: 0;
  padding: 0.88em 1em;
}
blockquote p:last-child { margin-bottom: 0; }
hr { border: none; border-top: 1px solid #d9dee6; border-top-color: oklch(89% 0.008 255); margin: 1.45em 0; }
.chapter-header { border-bottom: 1px solid #d9dee6; border-bottom-color: oklch(89% 0.008 255); margin-bottom: 1.85em; padding-bottom: 1em; }
.chapter-header h1 { margin: 0.18em 0 0; }
.chapter-kicker {
  color: #526f5b;
  color: oklch(50% 0.054 145);
  font-family: var(--font-sans);
  font-size: 0.68em;
  font-weight: 700;
  letter-spacing: 0.11em;
  margin: 0;
  text-transform: uppercase;
}
.book-title {
  border-bottom: 2px solid #17211a;
  border-bottom-color: oklch(22% 0.018 145);
  border-top: 1px solid #d8ddd6;
  border-top-color: oklch(87.5% 0.012 125);
  margin: 14% 0 1.7em;
  padding: 0.9em 0 1em;
}
.book-title h1 { margin: 0.16em 0 0.28em; }
.book-kicker, .book-subtitle, .book-author { font-family: var(--font-sans); margin: 0; }
.book-kicker {
  color: #526f5b;
  color: oklch(50% 0.054 145);
  font-size: 0.68em;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.book-subtitle { color: #39443a; color: oklch(36% 0.027 140); font-size: 0.92em; line-height: 1.36; max-width: 42ch; }
.book-author { color: #5b6359; color: oklch(48% 0.014 130); font-size: 0.8em; margin-top: 0.82em; }
.toc-list { font-family: var(--font-sans); font-size: 0.9em; line-height: 1.38; padding-left: 2.4em; }
.toc-list li { border-bottom: 1px solid #e1e4dd; border-bottom-color: oklch(90.5% 0.011 120); margin: 0; padding: 0.42em 0 0.42em 0.18em; }
.cover-page { margin: 0; padding: 0; }
.cover-frame { margin: 0 auto; text-align: center; }
.cover-frame img { display: block; height: auto; width: 100%; }
`;

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let number = 0; number < 256; number += 1) {
    let crc = number;
    for (let bit = 0; bit < 8; bit += 1) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    table[number] = crc >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC32_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()) {
  const year = Math.max(1980, date.getFullYear());
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return [dosTime, dosDate];
}

function writeStoredZip(outputPath, entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const [dosTime, dosDate] = dosDateTime();
  for (const [entryName, entryContent] of entries) {
    const name = Buffer.from(entryName, "utf8");
    const data = Buffer.isBuffer(entryContent) ? entryContent : Buffer.from(entryContent, "utf8");
    const checksum = crc32(data);
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(dosTime, 10);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(data.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(name.length, 26);
    localHeader.writeUInt16LE(0, 28);
    localParts.push(localHeader, name, data);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(dosTime, 12);
    centralHeader.writeUInt16LE(dosDate, 14);
    centralHeader.writeUInt32LE(checksum, 16);
    centralHeader.writeUInt32LE(data.length, 20);
    centralHeader.writeUInt32LE(data.length, 24);
    centralHeader.writeUInt16LE(name.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    centralParts.push(centralHeader, name);
    offset += localHeader.length + name.length + data.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  fs.writeFileSync(outputPath, Buffer.concat([...localParts, centralDirectory, end]));
}

function buildEpub(markdownFiles) {
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, "+00:00");
  const chapters = [];
  const assets = new Map();
  markdownFiles.forEach((filePath, zeroBasedIndex) => {
    const index = zeroBasedIndex + 1;
    const source = fs.readFileSync(filePath, "utf8");
    const title = firstHeading(source, path.basename(filePath, path.extname(filePath)));
    const chapterFile = `chapter-${String(index).padStart(2, "0")}.xhtml`;
    const [xhtml, chapterAssets] = markdownToXhtml(source, title, index);
    chapters.push([chapterFile, title, xhtml]);
    chapterAssets.forEach(([href, content]) => assets.set(href, content));
  });

  const tocItems = chapters
    .map(
      ([filename, title], index) =>
        `        <li><a href="${filename}">Capítulo ${index + 1}: ${inlineMarkdown(title)}</a></li>`,
    )
    .join("\n");
  const indexBody = `
<section epub:type="frontmatter toc">
  <div class="book-title">
    <p class="book-kicker">Programación IV</p>
    <h1>${escapeHtml(BOOK_TITLE)}</h1>
    <p class="book-subtitle">${escapeHtml(BOOK_SUBTITLE)}</p>
    <p class="book-author">${escapeHtml(BOOK_AUTHOR)}</p>
  </div>
  <nav epub:type="toc" id="toc">
    <ol class="toc-list">
${tocItems}
    </ol>
  </nav>
</section>
`;
  const navXhtml = wrapXhtmlPage("Índice", indexBody);
  const coverXhtml = buildCoverPage();

  const manifestItems = [
    '    <item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>',
    `    <item id="cover-image" href="${COVER_FILENAME}" media-type="${COVER_MEDIA_TYPE}" properties="cover-image"/>`,
    '    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>',
    '    <item id="css" href="styles.css" media-type="text/css"/>',
  ];
  chapters.forEach(([filename], index) => {
    manifestItems.push(
      `    <item id="chap${index + 1}" href="${filename}" media-type="application/xhtml+xml"/>`,
    );
  });
  [...assets.keys()].sort().forEach((href, index) => {
    manifestItems.push(
      `    <item id="diagram${index + 1}" href="${href}" media-type="image/svg+xml"/>`,
    );
  });
  const spineItems = ['    <itemref idref="cover"/>', '    <itemref idref="nav"/>'];
  chapters.forEach((_chapter, index) => spineItems.push(`    <itemref idref="chap${index + 1}"/>`));

  const opf = `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">${escapeHtml(BOOK_ID)}</dc:identifier>
    <dc:title>${escapeHtml(BOOK_TITLE)}</dc:title>
    <dc:language>${BOOK_LANGUAGE}</dc:language>
    <dc:creator>${escapeHtml(BOOK_AUTHOR)}</dc:creator>
    <dc:date>${now}</dc:date>
  </metadata>
  <manifest>
${manifestItems.join("\n")}
  </manifest>
  <spine>
${spineItems.join("\n")}
  </spine>
</package>
`;
  const containerXml = `<?xml version="1.0" encoding="utf-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>
`;

  const entries = [
    ["mimetype", "application/epub+zip"],
    ["META-INF/container.xml", containerXml],
    ["OEBPS/styles.css", CSS],
    [`OEBPS/${COVER_FILENAME}`, fs.readFileSync(BOOK_COVER)],
    ["OEBPS/cover.xhtml", coverXhtml],
    ["OEBPS/nav.xhtml", navXhtml],
    ["OEBPS/content.opf", opf],
  ];
  chapters.forEach(([filename, _title, xhtml]) => entries.push([`OEBPS/${filename}`, xhtml]));
  assets.forEach((content, href) => entries.push([`OEBPS/${href}`, content]));
  writeStoredZip(OUTPUT, entries);
}

function markdownRaiz(root) {
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === ".md")
    .map((entry) => path.join(root, entry.name))
    .sort();
}

function capitalize(text) {
  return text ? text[0].toUpperCase() + text.slice(1).toLowerCase() : text;
}

function renumerar(root) {
  const pattern = /^(?<seccion>\d{2,})\.(?<orden>\d{2,})-(?<nombre>.+)\.md$/;
  const files = [];
  for (const filePath of markdownRaiz(root)) {
    const match = path.basename(filePath).match(pattern);
    if (match) {
      files.push([
        Number(match.groups.seccion),
        Number(match.groups.orden),
        match.groups.nombre,
        filePath,
      ]);
    }
  }
  files.sort((left, right) =>
    left[0] - right[0] || left[1] - right[1] || path.basename(left[3]).toLowerCase().localeCompare(path.basename(right[3]).toLowerCase()),
  );

  let actual = 0;
  let siguienteOrden = 0;
  for (const [seccion, _orden, nombre, origen] of files) {
    if (seccion !== actual) {
      actual = seccion;
      siguienteOrden = 0;
    }
    siguienteOrden += 10;
    const destino = `${String(actual).padStart(2, "0")}.${String(siguienteOrden).padStart(3, "0")}-${capitalize(nombre)}.md`;
    if (path.basename(origen) === destino) continue;
    console.log(`     de: ${path.basename(origen).padEnd(60)}\n      a: ${destino.padEnd(60)}\n`);
    fs.renameSync(origen, path.join(path.dirname(origen), destino));
  }
}

function main() {
  console.log("\n\nIniciando proceso de publicacion...\n");
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`No se encontro la carpeta de apuntes: ${path.relative(WORKDIR, SOURCE_DIR)}`);
    return 1;
  }

  console.log("- Paso 1: Renumerar archivos Markdown en apuntes/chatgpt...");
  renumerar(SOURCE_DIR);
  const markdownFiles = markdownRaiz(SOURCE_DIR).filter((filePath) => !isExcluded(filePath));
  if (markdownFiles.length === 0) {
    console.error("No se encontraron archivos Markdown para incluir.");
    return 1;
  }
  if (!fs.existsSync(BOOK_COVER)) {
    console.error(`No se encontro la portada: ${path.basename(BOOK_COVER)}`);
    return 1;
  }

  console.log("- Paso 2: Construir el archivo EPUB...");
  buildEpub(markdownFiles);
  console.log(`     Salida: ${path.basename(OUTPUT)}\n`);
  console.log("- Paso 3: Abrir el libro en Apple Books...");
  spawnSync("osascript", ["-e", 'tell application "Books" to quit'], { stdio: "ignore" });
  const books = spawn("open", ["-a", "Books", OUTPUT], { detached: true, stdio: "ignore" });
  books.unref();
  console.log("\nProceso de publicacion completado.\n");
  return 0;
}

module.exports = {
  buildEpub,
  firstHeading,
  inlineMarkdown,
  isExcluded,
  markdownToXhtml,
  renumerar,
  renderCodeBlock,
  renderTable,
  slugify,
  writeStoredZip,
};

if (require.main === module) {
  try {
    process.exitCode = main();
  } catch (error) {
    console.error(error instanceof Error ? error.stack : error);
    process.exitCode = 1;
  }
}
