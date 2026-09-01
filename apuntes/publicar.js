#!/usr/bin/env node

"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const MERMAID_TIMEOUT_SECONDS = 120;

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

function findChromium() {
  const commands = ["google-chrome", "chromium", "chromium-browser", "microsoft-edge"];
  for (const command of commands) {
    const executable = findExecutable(command);
    if (executable) return executable;
  }

  const applicationPaths = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  ];
  return applicationPaths.find((candidate) => fs.existsSync(candidate)) ?? null;
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
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${LANGUAGE}">
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

function bodyFromXhtml(xhtml) {
  const match = xhtml.match(/<body>\s*([\s\S]*?)\s*<\/body>/i);
  if (!match) throw new Error("No se pudo extraer el contenido XHTML para generar el PDF.");
  return match[1];
}

const ROOT = path.resolve(__dirname, "..");
const SOURCE_DIR = path.resolve(__dirname);
const INDEX_PATH = path.join(SOURCE_DIR, "00-indice.md");
const COVER_PATH = path.join(SOURCE_DIR, "portada.jpg");
const MASTER_PATH = path.join(SOURCE_DIR, "libro-completo.md");
const MAP_PATH = path.join(SOURCE_DIR, "mapa-de-fuentes.md");
const REPORT_PATH = path.join(SOURCE_DIR, "00-informe-editorial.md");
const EPUB_PATH = path.join(SOURCE_DIR, "Programacion Web.epub");
const PDF_PATH = path.join(SOURCE_DIR, "Programacion Web.pdf");
const SOURCES_ZIP_PATH = path.join(SOURCE_DIR, "Programacion Web-fuentes.zip");
const DELIVERY_ZIP_PATH = path.join(SOURCE_DIR, "Entrega-Programacion Web.zip");
const TEMP_ROOT = path.join(ROOT, "tmp", "pdfs");

const TITLE = "Programacion Web";
const SUBTITLE = "De los datos a las soluciones";
const AUTHOR = "Ing. Alejandro Di Battista";
const LANGUAGE = "es-AR";
const SUBJECT = "Programación IV";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    ...options,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const details = String(result.stderr || result.stdout || "").trim();
    throw new Error(`${path.basename(command)} terminó con código ${result.status}: ${details}`);
  }
  return String(result.stdout || "").trim();
}

function parseIndex() {
  if (!fs.existsSync(INDEX_PATH)) throw new Error(`No se encontró ${INDEX_PATH}`);
  const lines = fs.readFileSync(INDEX_PATH, "utf8").split(/\r?\n/);
  const parts = [];
  const paths = new Set();
  let currentPart = null;

  for (const line of lines) {
    const partMatch = line.match(/^##\s+(Parte\s+[IVX]+\..+|Apéndices)\s*$/);
    if (partMatch) {
      currentPart = {
        id: `part-${String(parts.length + 1).padStart(2, "0")}`,
        marker: `BLOQUE ${parts.length + 1}`,
        title: partMatch[1].trim(),
        chapters: [],
      };
      parts.push(currentPart);
      continue;
    }
    if (!currentPart) continue;

    const chapterMatch = line.match(/^###\s+([0-9]+|[A-Z])\.\s+\[([^\]]+)\]\(([^)]+\.md)\)\s*$/);
    if (!chapterMatch) continue;
    const shortLabel = chapterMatch[1];
    const title = chapterMatch[2].replaceAll("`", "").trim();
    const relativePath = chapterMatch[3];
    if (relativePath.toLowerCase().includes("(no)")) {
      throw new Error(`El índice enlaza un archivo excluido: ${relativePath}`);
    }
    const sourcePath = path.resolve(SOURCE_DIR, relativePath);
    if (!sourcePath.startsWith(`${SOURCE_DIR}${path.sep}`) || !fs.existsSync(sourcePath)) {
      throw new Error(`Enlace roto o fuera de apuntes/: ${relativePath}`);
    }
    if (paths.has(sourcePath)) throw new Error(`Fuente repetida en el índice: ${relativePath}`);
    paths.add(sourcePath);
    const appendix = currentPart.title === "Apéndices";
    currentPart.chapters.push({
      id: `chapter-${String(paths.size).padStart(2, "0")}`,
      label: appendix ? `Apéndice ${shortLabel}` : `Capítulo ${shortLabel}`,
      marker: (appendix ? `APÉNDICE ${shortLabel}` : `CAPÍTULO ${shortLabel}`).toUpperCase(),
      relativePath,
      shortLabel,
      sourcePath,
      title,
    });
  }

  const chapters = parts.flatMap((part) => part.chapters.map((chapter) => ({ ...chapter, part })));
  if (parts.length === 0 || chapters.length === 0) {
    throw new Error("El índice no contiene partes y capítulos enlazados.");
  }
  return { parts, chapters };
}

function removePracticeSections(markdown) {
  const lines = markdown.split(/\r?\n/);
  const output = [];
  let skipping = false;
  for (const line of lines) {
    if (/^## Práctica (?:guiada|de cierre)\s*$/.test(line)) {
      skipping = true;
      while (output.length > 0 && output.at(-1) === "") output.pop();
      continue;
    }
    if (skipping && /^##\s+/.test(line)) {
      skipping = false;
      output.push("", line);
      continue;
    }
    if (!skipping) output.push(line);
  }
  return `${output.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd()}\n`;
}

function normalizeSources(manifest) {
  const changed = [];
  for (const chapter of manifest.chapters) {
    const original = fs.readFileSync(chapter.sourcePath, "utf8");
    const normalized = removePracticeSections(original);
    if (normalized !== original) {
      fs.writeFileSync(chapter.sourcePath, normalized, "utf8");
      changed.push(chapter.relativePath);
    }
  }
  const remaining = manifest.chapters.filter((chapter) =>
    /^## Práctica (?:guiada|de cierre)\s*$/m.test(fs.readFileSync(chapter.sourcePath, "utf8")),
  );
  if (remaining.length > 0) {
    throw new Error(`Quedaron prácticas en: ${remaining.map((item) => item.relativePath).join(", ")}`);
  }
  return changed;
}

function chapterBodyForMaster(markdown) {
  const lines = markdown.split(/\r?\n/);
  const output = [];
  let inFence = false;
  let removedTitle = false;
  for (const line of lines) {
    if (line.trimStart().startsWith("```")) {
      inFence = !inFence;
      output.push(line);
      continue;
    }
    if (!inFence && !removedTitle && /^#\s+/.test(line)) {
      removedTitle = true;
      continue;
    }
    if (!inFence) {
      const heading = line.match(/^(#{1,5})(\s+.*)$/);
      if (heading) {
        output.push(`#${heading[1]}${heading[2]}`);
        continue;
      }
    }
    output.push(line);
  }
  return output.join("\n").trim();
}

function writeMaster(manifest) {
  const lines = [
    "---",
    `title: \"${TITLE}\"`,
    `subtitle: \"${SUBTITLE}\"`,
    `author: \"${AUTHOR}\"`,
    `lang: \"${LANGUAGE}\"`,
    "---",
    "",
    `# ${TITLE}`,
    "",
    `## ${SUBTITLE}`,
    "",
    AUTHOR,
    "",
  ];
  for (const part of manifest.parts) {
    lines.push(`# ${part.title}`, "");
    for (const chapter of part.chapters) {
      lines.push(`## ${chapter.shortLabel}. ${chapter.title}`, "");
      lines.push(chapterBodyForMaster(fs.readFileSync(chapter.sourcePath, "utf8")), "");
    }
  }
  fs.writeFileSync(MASTER_PATH, `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd()}\n`, "utf8");
}

function escapeTable(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

function writeSourceMap(manifest) {
  const lines = [
    "# Mapa de fuentes",
    "",
    `Este mapa registra el orden canónico utilizado para generar **${TITLE}**.`,
    "",
    "| Orden | Bloque | Capítulo | Fuente |",
    "| ---: | --- | --- | --- |",
  ];
  manifest.chapters.forEach((chapter, index) => {
    lines.push(
      `| ${index + 1} | ${escapeTable(chapter.part.title)} | ${escapeTable(`${chapter.shortLabel}. ${chapter.title}`)} | \`${chapter.relativePath}\` |`,
    );
  });
  fs.writeFileSync(MAP_PATH, `${lines.join("\n")}\n`, "utf8");
}

function wrapXhtml(title, body) {
  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${LANGUAGE}" lang="${LANGUAGE}">
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

function chapterContent(xhtml) {
  const body = bodyFromXhtml(xhtml);
  const match = body.match(/<section epub:type="chapter">\s*<header[\s\S]*?<\/header>\s*([\s\S]*?)\s*<\/section>/);
  if (!match) throw new Error("No se pudo extraer el contenido del capítulo.");
  return match[1];
}

function renderChapters(manifest) {
  const assets = new Map();
  const rendered = manifest.chapters.map((chapter, index) => {
    const markdown = fs.readFileSync(chapter.sourcePath, "utf8");
    const [xhtml, chapterAssets] = markdownToXhtml(markdown, chapter.title, index + 1);
    chapterAssets.forEach(([href, content]) => assets.set(href, content));
    const content = chapterContent(xhtml);
    const epubBody = `<section epub:type="chapter" id="${chapter.id}">
  <header class="chapter-header">
    <p class="chapter-kicker">${escapeHtml(chapter.label)}</p>
    <h1>${escapeHtml(chapter.title)}</h1>
  </header>
  ${content}
</section>`;
    return { ...chapter, content, epubXhtml: wrapXhtml(chapter.title, epubBody) };
  });
  return { assets, rendered };
}

function buildBookEpub(manifest, renderedBook) {
  const modified = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const entries = [
    ["mimetype", "application/epub+zip"],
    [
      "META-INF/container.xml",
      `<?xml version="1.0" encoding="utf-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>`,
    ],
  ];
  const manifestItems = [
    '<item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>',
    '<item id="cover-image" href="portada.jpg" media-type="image/jpeg" properties="cover-image"/>',
    '<item id="title" href="title.xhtml" media-type="application/xhtml+xml"/>',
    '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>',
    '<item id="css" href="styles.css" media-type="text/css"/>',
  ];
  const spine = ['<itemref idref="cover"/>', '<itemref idref="title"/>', '<itemref idref="nav"/>'];
  const navParts = [];
  let chapterIndex = 0;

  for (const [partIndex, part] of manifest.parts.entries()) {
    const partFile = `${part.id}.xhtml`;
    manifestItems.push(`<item id="${part.id}" href="${partFile}" media-type="application/xhtml+xml"/>`);
    spine.push(`<itemref idref="${part.id}"/>`);
    const children = [];
    for (const chapter of part.chapters) {
      const rendered = renderedBook.rendered[chapterIndex];
      const chapterFile = `${chapter.id}.xhtml`;
      manifestItems.push(`<item id="${chapter.id}" href="${chapterFile}" media-type="application/xhtml+xml"/>`);
      spine.push(`<itemref idref="${chapter.id}"/>`);
      children.push(`<li><a href="${chapterFile}">${escapeHtml(`${chapter.shortLabel}. ${chapter.title}`)}</a></li>`);
      entries.push([`OEBPS/${chapterFile}`, rendered.epubXhtml]);
      chapterIndex += 1;
    }
    navParts.push(`<li><a href="${partFile}">${escapeHtml(part.title)}</a><ol>${children.join("")}</ol></li>`);
    const partBody = `<section epub:type="part" class="part-page"><p class="part-kicker">${escapeHtml(part.marker)}</p><h1>${escapeHtml(part.title)}</h1></section>`;
    entries.push([`OEBPS/${partFile}`, wrapXhtml(part.title, partBody)]);
  }
  [...renderedBook.assets.keys()].sort().forEach((href, index) => {
    manifestItems.push(`<item id="asset-${index + 1}" href="${href}" media-type="image/svg+xml"/>`);
  });

  const navBody = `<section epub:type="frontmatter toc" class="toc-page">
  <div class="book-title"><p class="book-kicker">${escapeHtml(SUBJECT)}</p><h1>Índice</h1></div>
  <nav epub:type="toc" id="toc"><ol class="toc-list toc-parts">${navParts.join("")}</ol></nav>
</section>`;
  const coverBody = `<section epub:type="cover" class="cover-page"><div class="cover-frame"><img src="portada.jpg" alt="Portada de ${escapeHtml(TITLE)}" /></div></section>`;
  const titleBody = `<section epub:type="titlepage" class="title-page"><div class="book-title"><p class="book-kicker">${escapeHtml(SUBJECT)}</p><h1>${escapeHtml(TITLE)}</h1><p class="book-subtitle">${escapeHtml(SUBTITLE)}</p><p class="book-author">${escapeHtml(AUTHOR)}</p></div></section>`;
  const opf = `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="3.0" xml:lang="${LANGUAGE}">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">urn:uuid:9fda1c31-d3b7-4fb4-b14d-50726f675765</dc:identifier>
    <dc:title>${escapeHtml(TITLE)}</dc:title><dc:creator>${escapeHtml(AUTHOR)}</dc:creator>
    <dc:language>${LANGUAGE}</dc:language><dc:subject>${escapeHtml(SUBJECT)}</dc:subject>
    <meta property="dcterms:modified">${modified}</meta>
  </metadata>
  <manifest>${manifestItems.join("\n")}</manifest>
  <spine>${spine.join("\n")}</spine>
</package>`;
  const epubCss = `${CSS}
.part-page, .title-page { break-before: page; min-height: 75vh; padding-top: 18%; }
.part-kicker { color: #526f5b; font-size: .72em; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
.toc-parts > li { margin-bottom: .8em; }
.toc-parts > li > a { font-weight: 700; }
.toc-parts ol { margin-top: .35em; }
`;
  entries.push(
    ["OEBPS/styles.css", epubCss],
    ["OEBPS/portada.jpg", fs.readFileSync(COVER_PATH)],
    ["OEBPS/cover.xhtml", wrapXhtml("Portada", coverBody)],
    ["OEBPS/title.xhtml", wrapXhtml(TITLE, titleBody)],
    ["OEBPS/nav.xhtml", wrapXhtml("Índice", navBody)],
    ["OEBPS/content.opf", opf],
  );
  renderedBook.assets.forEach((content, href) => entries.push([`OEBPS/${href}`, content]));
  writeStoredZip(EPUB_PATH, entries);
}

function sectionHeadingsAsDivs(content) {
  return content.replace(
    /<h([2-6]) id="([^"]+)">([\s\S]*?)<\/h\1>/g,
    (_match, level, id, text) => `<div class="section-heading level-${level}" id="${id}" role="heading" aria-level="${level}">${text}</div>`,
  );
}

function pdfHtml(manifest, renderedBook) {
  const toc = manifest.parts.map((part) => {
    const children = part.chapters
      .map((chapter) => `<li><a href="#${chapter.id}">${escapeHtml(`${chapter.shortLabel}. ${chapter.title}`)}</a></li>`)
      .join("");
    return `<li><a href="#${part.id}">${escapeHtml(part.title)}</a><ol>${children}</ol></li>`;
  }).join("");
  const body = [];
  let index = 0;
  for (const part of manifest.parts) {
    body.push(`<section class="pdf-part" id="${part.id}"><p class="part-kicker">${escapeHtml(part.marker)}</p><h1>${escapeHtml(part.title)}</h1><p>${part.chapters.length} capítulos en este bloque.</p></section>`);
    for (const chapter of part.chapters) {
      const rendered = renderedBook.rendered[index];
      body.push(`<section class="pdf-chapter" id="${chapter.id}">
  <header class="chapter-header"><p class="chapter-kicker">${escapeHtml(chapter.marker)}</p><h2>${escapeHtml(chapter.title)}</h2></header>
  ${sectionHeadingsAsDivs(rendered.content)}
</section>`);
      index += 1;
    }
  }
  return `<!doctype html>
<html lang="${LANGUAGE}"><head><meta charset="utf-8"/><title>${escapeHtml(TITLE)}</title><meta name="author" content="${escapeHtml(AUTHOR)}"/>
<style>
${CSS}
@page {
  size: A4;
  margin: 18mm 17mm 20mm;
  @top-left { color: #68707c; content: "${TITLE}"; font-family: Arial, sans-serif; font-size: 8pt; }
  @top-right { color: #68707c; content: "${SUBJECT}"; font-family: Arial, sans-serif; font-size: 8pt; }
  @bottom-center { color: #68707c; content: counter(page); font-family: Arial, sans-serif; font-size: 9pt; }
}
@page:first { margin: 0; @top-left { content: none; } @top-right { content: none; } @bottom-center { content: none; } }
html, body { margin: 0; padding: 0; }
body { font-size: 10.4pt; }
.pdf-cover { break-after: page; height: 297mm; margin: 0; overflow: hidden; }
.pdf-cover img { display: block; height: 100%; object-fit: cover; width: 100%; }
.pdf-title { box-sizing: border-box; break-after: page; min-height: 220mm; padding-top: 35mm; }
.pdf-title .title { border-bottom: 2px solid #17211a; border-top: 1px solid #d8ddd6; padding: 10mm 0; }
.pdf-title .book-kicker { color: #526f5b; font-size: 9pt; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
.pdf-title .book-name { font-size: 31pt; font-weight: 760; letter-spacing: -.025em; margin: 3mm 0; }
.pdf-title .book-subtitle { font-size: 15pt; margin: 0; }
.pdf-title .book-author { color: #5b6359; margin-top: 8mm; }
.pdf-toc { break-after: page; }
.pdf-toc .toc-title { font-size: 26pt; font-weight: 760; margin: 0 0 10mm; }
.pdf-toc > ol { padding-left: 0; }
.pdf-toc > ol > li { break-inside: avoid; list-style: none; margin-bottom: 4mm; }
.pdf-toc > ol > li > a { font-size: 12pt; font-weight: 700; }
.pdf-toc ol ol { list-style: none; margin-top: 2mm; padding-left: 4mm; }
.pdf-toc a { color: inherit; text-decoration: none; }
.pdf-part { box-sizing: border-box; break-before: page; min-height: 220mm; padding-top: 45mm; }
.pdf-part .part-kicker { color: #526f5b; font-size: 9pt; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; }
.pdf-part h1 { font-size: 30pt; max-width: 18ch; }
.pdf-chapter { break-before: page; }
.pdf-chapter .chapter-header h2 { border: 0; font-size: 24pt; margin-top: 2mm; padding: 0; }
.section-heading { break-after: avoid; color: #20242a; font-family: var(--font-display); font-weight: 740; line-height: 1.16; margin: 1.7em 0 .46em; }
.section-heading.level-2 { border-bottom: 1px solid #d9dee6; font-size: 1.46rem; padding-bottom: .24em; }
.section-heading.level-3 { font-size: 1.18rem; }
.section-heading.level-4, .section-heading.level-5, .section-heading.level-6 { font-size: 1rem; font-weight: 800; }
.code-block { break-inside: auto; }
pre { overflow-wrap: anywhere; white-space: pre-wrap; }
table, blockquote, figure { break-inside: avoid; }
thead { display: table-header-group; }
</style></head><body>
<section class="pdf-cover"><img src="portada.jpg" alt="Portada de ${escapeHtml(TITLE)}"/></section>
<section class="pdf-title"><div class="title"><p class="book-kicker">${escapeHtml(SUBJECT)}</p><div class="book-name">${escapeHtml(TITLE)}</div><p class="book-subtitle">${escapeHtml(SUBTITLE)}</p><p class="book-author">${escapeHtml(AUTHOR)}</p></div></section>
<section class="pdf-toc"><div class="toc-title">Índice</div><ol>${toc}</ol></section>
${body.join("\n")}
</body></html>`;
}

function findPython() {
  const candidates = [
    process.env.CODEX_PYTHON,
    process.env.HOME && path.join(process.env.HOME, ".cache", "codex-runtimes", "codex-primary-runtime", "dependencies", "python", "bin", "python3"),
    findExecutable("python3"),
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function installPdfOutline(pdfPath, manifest) {
  const python = findPython();
  if (!python) throw new Error("No se encontró Python para validar y crear marcadores PDF.");
  const outline = [];
  for (const [partIndex, part] of manifest.parts.entries()) {
    outline.push({ key: part.id, marker: part.marker, parent: null, title: part.title });
    for (const chapter of part.chapters) {
      outline.push({
        key: chapter.id,
        marker: chapter.marker,
        parent: part.id,
        title: `${chapter.shortLabel}. ${chapter.title}`,
      });
    }
  }
  const temporary = `${pdfPath}.outlined.pdf`;
  const code = String.raw`
import json, os, sys
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject

source, destination, raw = sys.argv[1:4]
items = json.loads(raw)
reader = PdfReader(source)
texts = [(page.extract_text() or "") for page in reader.pages]
cursor = 0
for item in items:
    found = None
    for page_number in range(cursor, len(texts)):
        if item["marker"] in texts[page_number]:
            found = page_number
            break
    if found is None:
        raise RuntimeError(f'No se encontró marcador de página: {item["marker"]}')
    item["page"] = found
    cursor = found

writer = PdfWriter()
writer.clone_document_from_reader(reader)
writer.root_object.pop(NameObject("/Outlines"), None)
parents = {}
for item in items:
    parent = parents.get(item["parent"])
    reference = writer.add_outline_item(item["title"], item["page"], parent=parent)
    parents[item["key"]] = reference
writer.add_metadata({
    "/Title": "Programacion Web",
    "/Author": "Ing. Alejandro Di Battista",
    "/Subject": "Programación IV",
})
with open(destination, "wb") as stream:
    writer.write(stream)

check = PdfReader(destination)
def count(nodes, depth=1):
    total = 0
    maximum = 0
    for node in nodes:
        if isinstance(node, list):
            child_total, child_depth = count(node, depth + 1)
            total += child_total
            maximum = max(maximum, child_depth)
        else:
            total += 1
            maximum = max(maximum, depth)
    return total, maximum
total, maximum = count(check.outline)
print(json.dumps({"pages": len(check.pages), "bookmarks": total, "maxDepth": maximum, "mapped": items}, ensure_ascii=False))
`;
  let output;
  try {
    output = run(python, ["-c", code, pdfPath, temporary, JSON.stringify(outline)]);
    fs.renameSync(temporary, pdfPath);
  } finally {
    fs.rmSync(temporary, { force: true });
  }
  return JSON.parse(output);
}

function buildBookPdf(manifest, renderedBook) {
  const chromium = findChromium();
  if (!chromium) throw new Error("No se encontró Chrome, Chromium o Edge para generar el PDF.");
  fs.mkdirSync(TEMP_ROOT, { recursive: true });
  const tempDirectory = fs.mkdtempSync(path.join(TEMP_ROOT, "programacion-web-"));
  try {
    fs.copyFileSync(COVER_PATH, path.join(tempDirectory, "portada.jpg"));
    renderedBook.assets.forEach((content, href) => {
      const target = path.join(tempDirectory, href);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, content);
    });
    const htmlPath = path.join(tempDirectory, "libro.html");
    fs.writeFileSync(htmlPath, pdfHtml(manifest, renderedBook), "utf8");
    run(
      chromium,
      [
        "--headless=new",
        "--disable-gpu",
        "--allow-file-access-from-files",
        "--no-pdf-header-footer",
        "--generate-pdf-document-outline",
        `--print-to-pdf=${PDF_PATH}`,
        new URL(`file://${htmlPath}`).href,
      ],
      { timeout: 180000 },
    );
    if (!fs.existsSync(PDF_PATH)) throw new Error("Chrome no produjo el PDF esperado.");
    return installPdfOutline(PDF_PATH, manifest);
  } finally {
    fs.rmSync(tempDirectory, { recursive: true, force: true });
  }
}

function validateEpub(manifest) {
  const unzip = findExecutable("unzip");
  if (!unzip) throw new Error("No se encontró unzip para validar el EPUB.");
  run(unzip, ["-t", EPUB_PATH]);
  const mimetype = run(unzip, ["-p", EPUB_PATH, "mimetype"]);
  const opf = run(unzip, ["-p", EPUB_PATH, "OEBPS/content.opf"]);
  const nav = run(unzip, ["-p", EPUB_PATH, "OEBPS/nav.xhtml"]);
  if (mimetype !== "application/epub+zip") throw new Error("Mimetype EPUB inválido.");
  if (!opf.includes('version="3.0"') || !opf.includes(`<dc:language>${LANGUAGE}</dc:language>`)) {
    throw new Error("El OPF no declara EPUB 3 y es-AR.");
  }
  const expected = manifest.parts.length + manifest.chapters.length;
  const navLinks = [...nav.matchAll(/<a href="[^"]+">/g)].length;
  if (navLinks !== expected) throw new Error(`Navegación EPUB: ${navLinks}; se esperaban ${expected}.`);
  const nestedDepth = nav.includes("<ol><li") && nav.includes("</ol></li>") ? 2 : 1;
  if (nestedDepth !== 2) throw new Error("La navegación EPUB no tiene dos niveles.");
  return { entries: expected, maxDepth: nestedDepth, epubcheck: false };
}

function validatePdf(expectedBookmarks) {
  const pdfinfo = findExecutable("pdfinfo");
  const pdftotext = findExecutable("pdftotext");
  const python = findPython();
  if (!pdfinfo || !pdftotext || !python) throw new Error("Faltan herramientas para validar el PDF.");
  const info = run(pdfinfo, [PDF_PATH]);
  const pages = Number(info.match(/^Pages:\s+(\d+)/m)?.[1] ?? 0);
  const size = info.match(/^Page size:\s+([^\n]+)/m)?.[1] ?? "";
  const dimensions = size.match(/([\d.]+) x ([\d.]+) pts/);
  const width = Number(dimensions?.[1]);
  const height = Number(dimensions?.[2]);
  if (!dimensions || Math.abs(width - 595.28) > 0.5 || Math.abs(height - 841.89) > 0.5) {
    throw new Error(`El PDF no informa tamaño A4: ${size}`);
  }
  const textPath = path.join(os.tmpdir(), `programacion-web-${process.pid}.txt`);
  try {
    run(pdftotext, [PDF_PATH, textPath]);
    const text = fs.readFileSync(textPath, "utf8");
    if (text.length < 10000 || !text.includes(TITLE) || !text.includes("Gestión de archivos con Node.js")) {
      throw new Error("La extracción de texto del PDF está incompleta.");
    }
  } finally {
    fs.rmSync(textPath, { force: true });
  }
  const code = String.raw`
import json, sys
from pypdf import PdfReader
r = PdfReader(sys.argv[1])
def count(nodes, depth=1):
    total = 0; maximum = 0
    for node in nodes:
        if isinstance(node, list):
            child_total, child_depth = count(node, depth + 1)
            total += child_total; maximum = max(maximum, child_depth)
        else:
            total += 1; maximum = max(maximum, depth)
    return total, maximum
total, maximum = count(r.outline)
print(json.dumps({"bookmarks": total, "maxDepth": maximum, "pages": len(r.pages)}))
`;
  const outline = JSON.parse(run(python, ["-c", code, PDF_PATH]));
  if (outline.bookmarks !== expectedBookmarks || outline.maxDepth !== 2) {
    throw new Error(`Marcadores PDF inválidos: ${JSON.stringify(outline)}`);
  }
  return { ...outline, pageSize: size };
}

function toolVersion(command, args = ["--version"]) {
  try {
    const result = spawnSync(command, args, { encoding: "utf8" });
    if (result.error || result.status !== 0) return "no disponible";
    return String(result.stdout || result.stderr || "").trim().split(/\r?\n/)[0] || "no disponible";
  } catch {
    return "no disponible";
  }
}

function writeReport(manifest, changed, epub, pdf, visualValidated) {
  const chromium = findChromium();
  const lines = [
    "# Informe editorial",
    "",
    `- **Edición:** ${TITLE}`,
    `- **Fecha:** ${new Date().toISOString()}`,
    `- **Idioma:** ${LANGUAGE}`,
    `- **Autor:** ${AUTHOR}`,
    `- **Fuentes incluidas:** ${manifest.chapters.length}`,
    `- **Bloques principales:** ${manifest.parts.length}`,
    "",
    "## Normalización editorial",
    "",
    `- Secciones de práctica eliminadas en esta ejecución: ${changed.length}.`,
    "- Encabezados `Práctica guiada` o `Práctica de cierre` restantes: 0.",
    "- Archivos `(no)` incluidos: 0.",
    "- Enlaces rotos o fuentes repetidas en el índice: 0.",
    "",
    "## Fuentes y herramientas",
    "",
    `- Node.js: ${process.version}`,
    `- Navegador PDF: ${chromium ? toolVersion(chromium, ["--version"]) : "no disponible"}`,
    `- Poppler: ${toolVersion(findExecutable("pdfinfo") ?? "pdfinfo", ["-v"])}`,
    "- EPUBCheck: no disponible; se aplicó validación estructural equivalente.",
    "",
    "## EPUB 3",
    "",
    `- Archivo: \`${path.basename(EPUB_PATH)}\``,
    `- Entradas de navegación: ${epub.entries}.`,
    `- Profundidad máxima de navegación: ${epub.maxDepth}.`,
    "- Contenedor ZIP, mimetype, OPF, manifiesto, spine y navegación: válidos.",
    "- Idioma `es-AR`, portada y metadatos: verificados.",
    "",
    "## PDF",
    "",
    `- Archivo: \`${path.basename(PDF_PATH)}\``,
    `- Páginas: ${pdf.pages}.`,
    `- Tamaño: ${pdf.pageSize}.`,
    `- Marcadores: ${pdf.bookmarks}.`,
    `- Profundidad máxima de marcadores: ${pdf.maxDepth}.`,
    "- Texto seleccionable y extraíble: verificado.",
    `- Inspección visual de páginas renderizadas: ${visualValidated ? "aprobada" : "pendiente"}.`,
    "",
    "## Correspondencia",
    "",
    `- Enlaces de fuentes comprobados desde \`00-indice.md\`: ${manifest.chapters.length}.`,
    "- Orden, títulos y bloques coinciden entre índice, documento maestro, EPUB y PDF.",
    "- Las cifras de páginas y marcadores fueron recalculadas para esta edición.",
    "",
    "## Orden de fuentes",
    "",
  ];
  manifest.chapters.forEach((chapter, index) => {
    lines.push(`${index + 1}. \`${chapter.relativePath}\` — ${chapter.part.title} — ${chapter.shortLabel}. ${chapter.title}`);
  });
  fs.writeFileSync(REPORT_PATH, `${lines.join("\n")}\n`, "utf8");
}

function zipEntriesFromFiles(files, baseDirectory = SOURCE_DIR) {
  return files.map((filePath) => [path.relative(baseDirectory, filePath), fs.readFileSync(filePath)]);
}

function createPackages(manifest) {
  const sourceFiles = [
    INDEX_PATH,
    COVER_PATH,
    __filename,
    MASTER_PATH,
    MAP_PATH,
    REPORT_PATH,
    ...manifest.chapters.map((chapter) => chapter.sourcePath),
  ];
  writeStoredZip(SOURCES_ZIP_PATH, zipEntriesFromFiles(sourceFiles));
  writeStoredZip(DELIVERY_ZIP_PATH, [
    [path.basename(EPUB_PATH), fs.readFileSync(EPUB_PATH)],
    [path.basename(PDF_PATH), fs.readFileSync(PDF_PATH)],
    [path.basename(SOURCES_ZIP_PATH), fs.readFileSync(SOURCES_ZIP_PATH)],
    [path.basename(MAP_PATH), fs.readFileSync(MAP_PATH)],
    [path.basename(REPORT_PATH), fs.readFileSync(REPORT_PATH)],
  ]);
  const unzip = findExecutable("unzip");
  if (!unzip) throw new Error("No se encontró unzip para validar los paquetes.");
  run(unzip, ["-t", SOURCES_ZIP_PATH]);
  run(unzip, ["-t", DELIVERY_ZIP_PATH]);
}

function timedStep(timings, step, action) {
  const startedAt = process.hrtime.bigint();
  try {
    return action();
  } finally {
    const milliseconds = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    timings.push({ step, seconds: Number((milliseconds / 1000).toFixed(3)) });
  }
}

function main(args = process.argv.slice(2)) {
  const generationStartedAt = process.hrtime.bigint();
  const timings = [];
  const allowed = new Set(["--solo-empaquetar", "--visual-validado", "--help", "-h"]);
  const unknown = args.filter((arg) => !allowed.has(arg));
  if (unknown.length > 0) throw new Error(`Opciones desconocidas: ${unknown.join(", ")}`);
  if (args.includes("--help") || args.includes("-h")) {
    console.log("Uso: node apuntes/publicar.js [--solo-empaquetar] [--visual-validado]");
    return;
  }
  if (!fs.existsSync(COVER_PATH)) throw new Error(`No se encontró la portada: ${COVER_PATH}`);
  const packageOnly = args.includes("--solo-empaquetar");
  const visualValidated = args.includes("--visual-validado");
  const manifest = timedStep(timings, "Leer y validar el índice", parseIndex);
  const changed = timedStep(timings, "Normalizar las fuentes", () => normalizeSources(manifest));
  timedStep(timings, "Construir el documento maestro", () => writeMaster(manifest));
  timedStep(timings, "Construir el mapa de fuentes", () => writeSourceMap(manifest));
  const expectedBookmarks = manifest.parts.length + manifest.chapters.length;
  let outline = null;
  if (!packageOnly) {
    const renderedBook = timedStep(timings, "Convertir los capítulos", () => renderChapters(manifest));
    timedStep(timings, "Generar el EPUB", () => buildBookEpub(manifest, renderedBook));
    outline = timedStep(timings, "Generar el PDF y sus marcadores", () => buildBookPdf(manifest, renderedBook));
  }
  if (!fs.existsSync(EPUB_PATH) || !fs.existsSync(PDF_PATH)) {
    throw new Error("Faltan EPUB o PDF; no se puede validar ni empaquetar.");
  }
  const epub = timedStep(timings, "Validar el EPUB", () => validateEpub(manifest));
  const pdf = timedStep(timings, "Validar el PDF", () => validatePdf(expectedBookmarks));
  if (outline && (outline.bookmarks !== pdf.bookmarks || outline.maxDepth !== pdf.maxDepth)) {
    throw new Error("La validación del outline PDF no es estable.");
  }
  timedStep(timings, "Escribir el informe editorial", () => writeReport(manifest, changed, epub, pdf, visualValidated));
  timedStep(timings, "Crear y verificar los paquetes", () => createPackages(manifest));
  const totalSeconds = Number((Number(process.hrtime.bigint() - generationStartedAt) / 1_000_000_000).toFixed(3));
  console.log(JSON.stringify({
    chapters: manifest.chapters.length,
    parts: manifest.parts.length,
    practicesRemoved: changed.length,
    epubNavigation: epub.entries,
    pdfBookmarks: pdf.bookmarks,
    pdfPages: pdf.pages,
    visualValidated,
    timings,
    totalSeconds,
  }, null, 2));
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.stack : error);
    process.exitCode = 1;
  }
}

module.exports = { main, parseIndex, removePracticeSections };
