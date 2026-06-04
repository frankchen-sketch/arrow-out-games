import fs from "node:fs";
import path from "node:path";

const rootDir = path.resolve(process.cwd(), "site");
const productionMode = process.argv.includes("--production");
const textFiles = [];
const htmlFiles = [];
const indexableHtmlFiles = [];
const issues = [];
const warnings = [];
const requiredSocialTags = [
  { label: "og:title", regex: /<meta\s+property="og:title"\s+content="([^"]+)"/u },
  {
    label: "og:description",
    regex: /<meta\s+property="og:description"\s+content="([^"]+)"/u,
  },
  { label: "og:type", regex: /<meta\s+property="og:type"\s+content="([^"]+)"/u },
  { label: "og:url", regex: /<meta\s+property="og:url"\s+content="([^"]+)"/u },
  { label: "og:image", regex: /<meta\s+property="og:image"\s+content="([^"]+)"/u },
  { label: "twitter:card", regex: /<meta\s+name="twitter:card"\s+content="([^"]+)"/u },
  { label: "twitter:title", regex: /<meta\s+name="twitter:title"\s+content="([^"]+)"/u },
  {
    label: "twitter:description",
    regex: /<meta\s+name="twitter:description"\s+content="([^"]+)"/u,
  },
  { label: "twitter:image", regex: /<meta\s+name="twitter:image"\s+content="([^"]+)"/u },
];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (/\.(html|txt|xml|css|js|webmanifest)$/u.test(entry.name)) {
      textFiles.push(fullPath);
    }
    if (/\.html$/u.test(entry.name)) {
      htmlFiles.push(fullPath);
      if (entry.name !== "404.html") {
        indexableHtmlFiles.push(fullPath);
      }
    }
  }
}

function rel(filePath) {
  return path.relative(rootDir, filePath) || ".";
}

function normalizeSitePath(target) {
  if (!target || target.startsWith("mailto:") || target.startsWith("tel:")) {
    return null;
  }
  if (/^(https?:)?\/\//u.test(target) || target.startsWith("#")) {
    return null;
  }

  return target.split("#")[0].split("?")[0];
}

function resolveLocalTarget(fromFile, rawTarget) {
  const sitePath = normalizeSitePath(rawTarget);
  if (!sitePath) return null;

  if (sitePath.startsWith("/")) {
    return path.join(rootDir, sitePath);
  }

  return path.resolve(path.dirname(fromFile), sitePath);
}

function resolveAbsoluteUrlTarget(rawTarget) {
  try {
    const url = new URL(rawTarget);
    if (url.protocol !== "https:") return null;
    return path.join(rootDir, url.pathname);
  } catch {
    return null;
  }
}

walk(rootDir);

for (const file of htmlFiles) {
  const source = fs.readFileSync(file, "utf8");

  if (!source.includes("<link rel=\"canonical\"")) {
    issues.push(`[canonical] Missing canonical tag in ${rel(file)}`);
  }

  const canonicalMatch = source.match(/<link rel="canonical" href="([^"]+)"/u);
  if (canonicalMatch && !canonicalMatch[1].startsWith("https://")) {
    issues.push(
      `[canonical] Canonical should use https URL in ${rel(file)}: ${canonicalMatch[1]}`
    );
  }

  for (const tag of requiredSocialTags) {
    const match = source.match(tag.regex);
    if (!match) {
      issues.push(`[social] Missing ${tag.label} tag in ${rel(file)}`);
      continue;
    }

    if (!match[1].trim()) {
      issues.push(`[social] Empty ${tag.label} tag in ${rel(file)}`);
    }
  }

  const ogUrlMatch = source.match(/<meta\s+property="og:url"\s+content="([^"]+)"/u);
  if (canonicalMatch && ogUrlMatch && canonicalMatch[1] !== ogUrlMatch[1]) {
    issues.push(
      `[social] og:url should match canonical in ${rel(file)}: ${ogUrlMatch[1]}`
    );
  }

  for (const imageMatch of source.matchAll(
    /<meta\s+(?:property="og:image"|name="twitter:image")\s+content="([^"]+)"/gu
  )) {
    const resolvedImage = resolveAbsoluteUrlTarget(imageMatch[1]);
    if (resolvedImage && !fs.existsSync(resolvedImage)) {
      issues.push(`[social] Missing share image in ${rel(file)} -> ${imageMatch[1]}`);
    }
  }

  const attrRegex = /\b(?:href|src)="([^"]+)"/gu;
  for (const match of source.matchAll(attrRegex)) {
    const target = match[1];
    const resolved = resolveLocalTarget(file, target);
    if (!resolved) continue;

    if (!fs.existsSync(resolved)) {
      issues.push(`[link] Missing local target from ${rel(file)} -> ${target}`);
    }
  }
}

for (const file of textFiles) {
  const source = fs.readFileSync(file, "utf8");
  if (source.includes("https://example.com")) {
    const message = `[domain] Placeholder domain still present in ${rel(file)}`;
    if (productionMode) {
      issues.push(message);
    } else {
      warnings.push(message);
    }
  }
}

const sitemapPath = path.join(rootDir, "sitemap.xml");
if (fs.existsSync(sitemapPath)) {
  const sitemap = fs.readFileSync(sitemapPath, "utf8");
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((m) => m[1]);
  if (locs.length !== indexableHtmlFiles.length) {
    issues.push(
      `[sitemap] Expected ${indexableHtmlFiles.length} URLs but found ${locs.length} <loc> entries`
    );
  }
}

const robotsPath = path.join(rootDir, "robots.txt");
if (fs.existsSync(robotsPath)) {
  const robots = fs.readFileSync(robotsPath, "utf8");
  if (!/Sitemap:\s+https:\/\/.+\/sitemap\.xml/u.test(robots)) {
    issues.push("[robots] robots.txt is missing a full sitemap URL");
  }
}

if (issues.length) {
  console.error("Site verification failed:\n");
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

if (warnings.length) {
  console.warn("Site verification warnings:\n");
  for (const warning of warnings) {
    console.warn(`- ${warning}`);
  }
  console.warn("");
}

console.log(`Site verification passed for ${htmlFiles.length} HTML pages.`);
