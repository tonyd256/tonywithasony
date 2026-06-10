#!/usr/bin/env node
/**
 * Import Substack newsletter posts into _posts/ as Markdown files.
 *
 * - Pulls the full archive from Substack's public JSON API (all posts, not just
 *   the ~6 the RSS feed exposes).
 * - Keeps only `type === "newsletter"` (skips podcasts/threads).
 * - Skips any slug already present in _posts/ (idempotent — safe to re-run).
 * - Re-hosts every image (cover, inline, and galleries) to ImageKit so the site
 *   doesn't depend on Substack's CDN.
 * - Native video embeds (no downloadable URL) become a "watch on Substack" link.
 * - Strips Substack subscribe/share widgets.
 *
 * Env (from .env locally, or repo secrets in CI):
 *   IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT
 *
 * Usage: node scripts/import-substack.js
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const ImageKit = require("imagekit");

const PUB = "https://tonywithasony.substack.com";
const POSTS_DIR = path.join(__dirname, "..", "_posts");
// Look like a real browser. Substack's Cloudflare 403s obvious bots — which
// matters from CI (datacenter IPs are scrutinized more than residential ones).
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const SUBSTACK_HEADERS = {
  "User-Agent": UA,
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: `${PUB}/archive`,
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Fetch with retry/backoff on bot-block (403), rate-limit (429), and 5xx.
async function fetchRetry(url, headers, attempts = 4) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { headers });
      if (res.ok) return res;
      lastErr = new Error(`GET ${url} -> ${res.status}`);
      if (![403, 429, 500, 502, 503, 520, 522].includes(res.status)) throw lastErr;
    } catch (e) {
      lastErr = e;
    }
    if (i < attempts - 1) await sleep(1500 * 2 ** i); // 1.5s, 3s, 6s
  }
  throw lastErr;
}

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

async function fetchJson(url) {
  const res = await fetchRetry(url, SUBSTACK_HEADERS);
  return res.json();
}

async function fetchText(url) {
  const res = await fetchRetry(url, SUBSTACK_HEADERS);
  return res.text();
}

// Pull the entire archive, paginating until exhausted.
async function getArchive() {
  const all = [];
  const limit = 50;
  for (let offset = 0; ; offset += limit) {
    const batch = await fetchJson(
      `${PUB}/api/v1/archive?sort=new&limit=${limit}&offset=${offset}`
    );
    if (!Array.isArray(batch) || batch.length === 0) break;
    all.push(...batch);
    if (batch.length < limit) break;
  }
  return all;
}

// RSS fallback: the /feed endpoint carries every recent post WITH full body HTML,
// and (unlike api/v1) is served to datacenter IPs, so it works from CI where the
// API is bot-blocked. Podcasts are identified by their audio enclosure and skipped.
async function getViaRss() {
  const xml = await fetchText(`${PUB}/feed`);
  const $ = cheerio.load(xml, { xmlMode: true });
  const posts = [];
  $("item").each((_, el) => {
    const $it = $(el);
    const link = $it.find("link").first().text().trim();
    const slug = (link.split("/p/")[1] || "").split(/[?#]/)[0];
    if (!slug) return;
    const encl = $it.find("enclosure").first();
    const enclType = encl.attr("type") || "";
    if (/^audio\//i.test(enclType)) return; // podcast — skip
    posts.push({
      slug,
      title: $it.find("title").first().text(),
      subtitle: $it.find("description").first().text(),
      post_date: new Date($it.find("pubDate").first().text()).toISOString(),
      canonical_url: link,
      cover_image: /^image\//i.test(enclType) ? encl.attr("url") || null : null,
      body_html: $it.find("encoded").first().text(),
    });
  });
  return posts;
}

// Prefer the API (full archive, richest data); fall back to RSS when it's blocked.
// Set SUBSTACK_SOURCE=rss to skip the API entirely (used in CI, where it's
// bot-blocked, to avoid wasting retry/backoff time on a request we know will fail).
async function getNewsletters() {
  if (process.env.SUBSTACK_SOURCE !== "rss") {
    try {
      const archive = await getArchive();
      const list = archive
        .filter((p) => p.type === "newsletter")
        .map((p) => ({ slug: p.slug, canonical_url: p.canonical_url, body_html: null }));
      return { source: "Substack API", list };
    } catch (e) {
      console.warn(`  ! API archive unavailable (${e.message}). Falling back to RSS feed.`);
    }
  }
  return { source: "RSS feed", list: await getViaRss() };
}

// Substack CDN URLs embed the URL-encoded original after the transform segment.
function originalSrc(url = "") {
  const i = url.indexOf("https%3A");
  return i >= 0 ? decodeURIComponent(url.slice(i)) : url;
}

function imgOriginal($img) {
  const da = $img.attr("data-attrs");
  if (da) {
    try {
      const j = JSON.parse(da);
      if (j.src) return j.src;
    } catch {}
  }
  return originalSrc($img.attr("src"));
}

const uploadCache = new Map();
async function rehost(originalUrl, slug) {
  if (!originalUrl) return null;
  if (uploadCache.has(originalUrl)) return uploadCache.get(originalUrl);
  const res = await fetchRetry(originalUrl, { "User-Agent": UA });
  const buf = Buffer.from(await res.arrayBuffer());
  let fileName = path.basename(new URL(originalUrl).pathname) || "image";
  if (!path.extname(fileName)) fileName += ".jpg";
  let url;
  try {
    const up = await imagekit.upload({
      file: buf,
      fileName,
      folder: `blog/${slug}`,
      useUniqueFileName: false,
      overwriteFile: false,
    });
    url = up.url;
  } catch (e) {
    // Already uploaded on a previous run — reuse the deterministic URL.
    if (/already exists/i.test(e && e.message)) {
      url = `${process.env.IMAGEKIT_URL_ENDPOINT.replace(/\/$/, "")}/blog/${slug}/${fileName}`;
    } else {
      throw e;
    }
  }
  uploadCache.set(originalUrl, url);
  return url;
}

const escAttr = (s = "") =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

async function processBody(html, post) {
  const $ = cheerio.load(html, null, false);
  const slug = post.slug;
  const flags = { video: false, firstImage: null };

  // Strip Substack-only widgets.
  $(
    [
      ".subscription-widget-wrap",
      ".subscription-widget",
      ".subscribe-widget",
      ".preview-link-wrap",
      ".poll-embed",
      ".share-dialog",
      ".footer",
      ".digest-post-embed",
      ".hide-text",
      "label",
      '[data-component-name="SubscribeWidgetToDOM"]',
    ].join(", ")
  ).remove();

  // Button CTAs: Substack uses one component for both subscribe prompts and real
  // link buttons. Keep genuine links (e.g. a Google Form); drop subscribe ones.
  for (const el of $(
    '.button-wrapper, .captioned-button-wrap, [data-component-name="ButtonCreateButton"]'
  ).toArray()) {
    const $b = $(el);
    let url = "";
    let text = "";
    let action = null;
    try {
      const j = JSON.parse($b.attr("data-attrs") || "{}");
      url = j.url || "";
      text = j.text || "";
      action = j.action;
    } catch {}
    if (!url) url = $b.find("a").attr("href") || "";
    if (!text) text = $b.find("a").text().trim();
    const isSubscribe =
      action === "subscribe" ||
      !url ||
      /\/subscribe(\?|$)|substack\.com\/subscribe|\/signup/i.test(url);
    if (isSubscribe) {
      $b.remove();
      continue;
    }
    $b.replaceWith(
      `<p class="not-prose my-6 text-center"><a class="inline-block px-5 py-3 rounded bg-blue-500 text-white font-sans font-bold no-underline hover:bg-blue-400" href="${url}" target="_blank" rel="noopener noreferrer">${
        text || "Open"
      }</a></p>`
    );
  }

  // Cross-post embeds (another author's post) -> keep as a simple link card.
  for (const el of $('[data-component-name="EmbeddedPostToDOM"]').toArray()) {
    const $e = $(el);
    const href = ($e.find("a.embedded-post").attr("href") ||
      $e.find("a").attr("href") ||
      "").split("?")[0];
    let title = $e.find(".embedded-post-title").text().trim();
    if (!title) {
      try {
        title = (JSON.parse($e.attr("data-attrs")).title || "").trim();
      } catch {}
    }
    if (href) {
      $e.replaceWith(
        `<p class="not-prose my-6"><a class="inline-block border border-gray-300 rounded px-4 py-3 font-sans no-underline text-gray-800 hover:border-blue-500" href="${href}" target="_blank" rel="noopener noreferrer">&#8599; ${
          title || "Referenced post"
        } <span class="text-gray-400">(on Substack)</span></a></p>`
      );
    } else {
      $e.remove();
    }
  }

  // Single images: <div class="captioned-image-container"> ... </div>
  for (const el of $(".captioned-image-container").toArray()) {
    const $c = $(el);
    const $img = $c.find("img").first();
    if (!$img.length) {
      $c.remove();
      continue;
    }
    const ik = await rehost(imgOriginal($img), slug);
    if (ik && !flags.firstImage) flags.firstImage = ik;
    const captionHtml = ($c.find("figcaption").first().html() || "").trim();
    const href = $c.find("a.image-link, a").first().attr("href") || "";
    const external = href && !/substack/i.test(href);
    let img = `<img src="${ik}?tr=w-1456" alt="${escAttr(
      $c.find("figcaption").first().text() || post.title
    )}" loading="lazy">`;
    if (external)
      img = `<a href="${href}" target="_blank" rel="noopener noreferrer">${img}</a>`;
    const fig = `<figure>${img}${
      captionHtml ? `<figcaption>${captionHtml}</figcaption>` : ""
    }</figure>`;
    $c.replaceWith(fig);
  }

  // Galleries: <div class="image-gallery-embed" data-attrs="{gallery:{images:[]}}">
  for (const el of $(".image-gallery-embed").toArray()) {
    const $g = $(el);
    let imgs = [];
    let caption = "";
    try {
      const j = JSON.parse($g.attr("data-attrs"));
      imgs = (j.gallery && j.gallery.images) || [];
      caption = (j.gallery && j.gallery.caption) || "";
    } catch {}
    const tags = [];
    for (const im of imgs) {
      const ik = await rehost(im.src, slug);
      if (ik && !flags.firstImage) flags.firstImage = ik;
      if (ik) tags.push(`<img src="${ik}?tr=w-900" alt="" loading="lazy">`);
    }
    if (!tags.length) {
      $g.remove();
      continue;
    }
    const cols = tags.length === 1 ? "grid-cols-1" : "grid-cols-2";
    const grid = `<figure class="not-prose my-6"><div class="grid ${cols} gap-2">${tags.join(
      ""
    )}</div>${
      caption ? `<figcaption class="text-center text-sm text-gray-500 mt-2">${caption}</figcaption>` : ""
    }</figure>`;
    $g.replaceWith(grid);
  }

  // Native video: no downloadable URL -> link out to the original post.
  for (const el of $(".native-video-embed").toArray()) {
    flags.video = true;
    $(el).replaceWith(
      `<p class="not-prose my-8 text-center"><a class="inline-flex items-center gap-2 px-5 py-3 rounded bg-gray-900 text-white font-sans font-bold no-underline hover:bg-gray-700" href="${post.canonical_url}" target="_blank" rel="noopener noreferrer">&#9658; Watch this video on Substack</a></p>`
    );
  }

  // Any remaining bare Substack images (rare) -> re-host in place.
  for (const el of $("img").toArray()) {
    const $img = $(el);
    const src = $img.attr("src") || "";
    if (/substackcdn|substack-post-media/.test(src)) {
      const ik = await rehost(imgOriginal($img), slug);
      if (ik) {
        $img.attr("src", `${ik}?tr=w-1456`);
        $img.removeAttr("srcset").removeAttr("data-attrs");
      }
    }
  }
  $("source").remove(); // leftover <picture><source> entries

  // Strip leftover Substack editor attributes for clean markup.
  $("[data-attrs]").removeAttr("data-attrs");
  $("[data-component-name]").removeAttr("data-component-name");
  $("[contenteditable]").removeAttr("contenteditable");
  $("[native]").removeAttr("native");

  return { body: $.html().trim(), flags };
}

function frontMatter(post, coverUrl) {
  const lines = ["---"];
  lines.push(`title: ${JSON.stringify(post.title)}`);
  lines.push(`date: ${post.post_date}`);
  lines.push(`slug: ${post.slug}`);
  if (post.subtitle) lines.push(`subtitle: ${JSON.stringify(post.subtitle)}`);
  if (coverUrl) lines.push(`thumbnail: ${coverUrl}`);
  lines.push(`substack_url: ${post.canonical_url}`);
  lines.push("---");
  return lines.join("\n");
}

async function main() {
  for (const k of [
    "IMAGEKIT_PUBLIC_KEY",
    "IMAGEKIT_PRIVATE_KEY",
    "IMAGEKIT_URL_ENDPOINT",
  ]) {
    if (!process.env[k]) {
      console.error(`Missing env var: ${k}`);
      process.exit(1);
    }
  }

  fs.mkdirSync(POSTS_DIR, { recursive: true });
  const existing = new Set(
    fs
      .readdirSync(POSTS_DIR)
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, ""))
  );

  const { source, list } = await getNewsletters();
  console.log(`Source: ${source}. ${list.length} newsletter post(s) available.`);

  let imported = 0;
  const videoPosts = [];
  for (const item of list) {
    if (existing.has(item.slug)) {
      console.log(`  = skip (exists): ${item.slug}`);
      continue;
    }
    process.stdout.write(`  + importing ${item.slug} ... `);
    let { slug, title, subtitle, post_date, canonical_url, cover_image, body_html } =
      item;
    // API source provides only metadata — fetch the full post. RSS already has it.
    if (!body_html) {
      const d = await fetchJson(`${PUB}/api/v1/posts/${slug}`);
      ({ title, subtitle, post_date, canonical_url, cover_image, body_html } = d);
    }
    const coverUrl = cover_image
      ? await rehost(originalSrc(cover_image), slug)
      : null;
    const { body, flags } = await processBody(body_html || "", {
      slug,
      title,
      canonical_url,
    });
    const post = { title, subtitle, post_date, slug, canonical_url };
    const datePrefix = post_date.slice(0, 10);
    const file = path.join(POSTS_DIR, `${datePrefix}-${slug}.md`);
    fs.writeFileSync(
      file,
      `${frontMatter(post, coverUrl || flags.firstImage)}\n\n${body}\n`
    );
    imported++;
    if (flags.video) videoPosts.push(slug);
    console.log("done");
  }

  console.log(`\nImported ${imported} new post(s).`);
  if (videoPosts.length)
    console.log(
      `Note: linked out to Substack for native video in: ${videoPosts.join(", ")}`
    );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
