import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const starRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDataText = (await readFile(join(starRoot, 'data', 'links.json'), 'utf8')).replaceAll('\r\n', '\n');
const data = JSON.parse(sourceDataText);
const checkOnly = process.argv.includes('--check');
const pageModified = data.meta.updated;

const portals = [
  {
    key: 'atlas',
    dir: 'atlasportal',
    baseUrl: 'https://atlasportal.pages.dev/',
    siblingUrl: 'https://starportal.pages.dev/',
    accent: '#5fb3a8',
    categoryOrder: ['play', 'zink', 'market', 'build', 'info', 'gov', 'support', 'social', 'legal'],
    categoryLatin: {
      play: 'NAVIS',
      zink: 'RETICVLVM',
      market: 'LIBRA',
      build: 'CIRCINUS',
      info: 'COMETES',
      gov: 'CORONA',
      support: 'ANCORA',
      social: 'CATENA',
      legal: 'COLUMNAE',
    },
    titles: {
      zh: 'atlasportal｜Star Atlas 官方入口索引（非官方整理）',
      en: 'atlasportal | Star Atlas Official Links, Unofficial Index',
    },
    names: {
      zh: 'atlasportal — Star Atlas 官方入口索引',
      en: 'atlasportal — Unofficial Star Atlas Official Links Index',
    },
    descriptions: {
      zh: 'atlasportal 是非官方的 Star Atlas 官方入口索引，整理遊戲、SAGE Labs、Zink 網路、市場、開發者資源、治理、支援、新聞、官方 YouTube 與社群連結。',
      en: 'atlasportal is an unofficial index of official Star Atlas destinations for the game, SAGE Labs, the Zink network, marketplace, developers, governance, support, news, the official YouTube channel and social channels.',
    },
    ogDescriptions: {
      zh: '一張可探索的 Star Atlas 官方入口星圖：遊戲、Zink 網路、市場、開發、治理、支援、新聞、官方 YouTube 與社群。',
      en: 'An explorable, unofficial chart of official Star Atlas destinations: play, Zink network, market, build, governance, support, news, official YouTube and social.',
    },
    keywords: {
      zh: 'Star Atlas,Zink,z.ink,zProfile,zXP,Zink Bridge,官方入口,官方 YouTube,SAGE Labs,Galactic Marketplace,Star Atlas DAO,開發者資源,遊戲連結,非官方索引',
      en: 'Star Atlas,Zink,z.ink,zProfile,zXP,Zink Bridge,official links,official YouTube,SAGE Labs,Galactic Marketplace,Star Atlas DAO,developer resources,game links,unofficial index',
    },
    imageAlt: {
      zh: 'atlasportal 黃銅太陽系儀風格的 Star Atlas 官方入口索引',
      en: 'atlasportal brass orrery chart of official Star Atlas destinations',
    },
    llmsSummary: 'An unofficial, bilingual directory of official Star Atlas destinations. It separates the community-made index from ATMTA and links only to official game, Zink network, marketplace, developer, governance, support, news, YouTube, social and legal destinations.',
    shellReplacements: [
      ['aria-label="Star Atlas 官方連結太陽系儀"', 'aria-label="Star Atlas official links orrery"'],
      ['atlasportal — star atlas 官方星圖 · 太陽系儀', 'atlasportal — the official star atlas chart · orrery'],
      ['非官方索引 · UNOFFICIAL INDEX', 'UNOFFICIAL INDEX · FAN-MADE'],
      ['aria-label="姊妹站切換"', 'aria-label="Sister site navigation"'],
      ['<b>官方星圖</b>', '<b>Official Atlas</b>'],
      ['<b>社群群星</b>', '<b>Community Stars</b>'],
      ['aria-label="應用工具"', 'aria-label="App tools"'],
      ['<span>尋星</span>', '<span>Find</span>'],
      ['<span>星艙</span>', '<span>Directory</span>'],
      ['<span>總覽</span>', '<span>Overview</span>'],
      ['aria-label="星際導航艙"', 'aria-label="Navigation deck"'],
      ['aria-label="關閉星艙"', 'aria-label="Close directory"'],
      ['aria-label="星區分類"', 'aria-label="Sectors"'],
      ['>官方星圖</text>', '>OFFICIAL ATLAS</text>'],
      ['點框聚焦 · 拖曳平移 · 滾輪縮放 · 雙擊還原 ── 非官方 · 社群整理 · <a href="#directory">↓ 完整清單</a>', 'click a frame to focus · drag to pan · scroll to zoom · double-click to reset ── unofficial · community-made · <a href="#directory">↓ full index</a>'],
      ['star atlas 官方星圖 · 九道軌道 · <span id="dir-count">—</span> 枚座標 · 非官方社群整理', 'the official star atlas chart · nine orbits · <span id="dir-count">—</span> ports · unofficial community index'],
      ['社群群星 → starportal ↗', 'Community Stars → starportal ↗'],
    ],
  },
  {
    key: 'star',
    dir: 'starportal',
    baseUrl: 'https://starportal.pages.dev/',
    siblingUrl: 'https://atlasportal.pages.dev/',
    accent: '#d96a52',
    categoryOrder: ['games', 'tools', 'guides', 'media', 'video', 'series', 'music'],
    categoryLatin: {
      games: 'LVDVS',
      tools: 'TELESCOPIVM',
      guides: 'CODEX',
      media: 'NVNTIVS',
      video: 'RADIO',
      series: 'FABVLAE',
      music: 'MVSICA',
    },
    titles: {
      zh: 'starportal｜Star Atlas 社群作品群星圖（非官方）',
      en: 'starportal | Unofficial Star Atlas Community Directory',
    },
    names: {
      zh: 'starportal — Star Atlas 社群作品群星圖',
      en: 'starportal — Star Atlas Community Stars',
    },
    descriptions: {
      zh: 'starportal 是非官方的 Star Atlas 社群作品索引，整理玩家製作的遊戲、工具、攻略、媒體、YouTube 報導、敘事影集與原創音樂，並清楚標示已上線與觀測中項目。',
      en: 'starportal is an unofficial directory of player-made Star Atlas games, tools, guides, media, YouTube coverage, narrative series and original music, with live and observing projects clearly distinguished.',
    },
    ogDescriptions: {
      zh: '探索玩家為 Star Atlas 製作的遊戲、工具、攻略、媒體、YouTube 報導、敘事影集與原創音樂；創作者不跨類重複。',
      en: 'Explore player-made Star Atlas games, tools, guides, media, YouTube coverage, narrative series and original music, with creators kept in one clear category.',
    },
    keywords: {
      zh: 'Star Atlas,社群作品,同人遊戲,玩家工具,攻略,媒體,YouTube,影集,敘事短片,原創音樂,影音創作者,StarLand,Tufa Attack,Battle for Iris,非官方索引',
      en: 'Star Atlas,community projects,fan games,player tools,guides,media,YouTube,series,narrative shorts,original music,video creators,StarLand,Tufa Attack,Battle for Iris,unofficial directory',
    },
    imageAlt: {
      zh: 'starportal 黃銅群星圖風格的 Star Atlas 社群作品索引',
      en: 'starportal brass star chart of player-made Star Atlas community projects',
    },
    llmsSummary: 'An unofficial, bilingual directory of player-made Star Atlas community work. YouTube coverage, narrative series and original music are separate, mutually exclusive creator categories. It distinguishes live destinations from projects still being observed and keeps official ATMTA destinations on the sibling atlasportal site.',
    shellReplacements: [
      ['aria-label="Star Atlas 社群作品星圖"', 'aria-label="Star Atlas community projects star chart"'],
      ['starportal — star atlas 社群群星 · 摹刻星版', 'starportal — the community sky of star atlas · engraved plate'],
      ['非官方索引 · UNOFFICIAL INDEX', 'UNOFFICIAL INDEX · FAN-MADE'],
      ['aria-label="姊妹站切換"', 'aria-label="Sister site navigation"'],
      ['<b>官方星圖</b>', '<b>Official Atlas</b>'],
      ['<b>社群群星</b>', '<b>Community Stars</b>'],
      ['aria-label="應用工具"', 'aria-label="App tools"'],
      ['<span>尋星</span>', '<span>Find</span>'],
      ['<span>星艙</span>', '<span>Directory</span>'],
      ['<span>總覽</span>', '<span>Overview</span>'],
      ['aria-label="星際導航艙"', 'aria-label="Navigation deck"'],
      ['aria-label="關閉星艙"', 'aria-label="Close directory"'],
      ['aria-label="星區分類"', 'aria-label="Sectors"'],
      ['<span class="dot"></span>已上線', '<span class="dot"></span>live'],
      ['<span class="ring"></span>觀測中 · 即將', '<span class="ring"></span>observing · soon'],
      ['點框聚焦 · 拖曳平移 · 滾輪縮放 · 雙擊還原 ── 非官方 · 社群整理 · <a href="#directory">↓ 完整清單</a>', 'click a frame to focus · drag to pan · scroll to zoom · double-click to reset ── unofficial · community-made · <a href="#directory">↓ full index</a>'],
      ['star atlas 社群群星 · <span id="dir-count">—</span> 顆星 · 每顆星都是玩家做的 · 非官方社群整理', 'the community sky of star atlas · <span id="dir-count">—</span> stars · every star is player-made · unofficial community index'],
      ['這張星圖還有大片未記錄的天區——你也做了 Star Atlas 的作品?歡迎在社群裡讓我們知道,替你把星點上去。', 'Large regions of this chart are still uncharted — built something for Star Atlas? Tell us in the community and we will chart your star.'],
      ['官方星圖 → atlasportal ↗', 'Official Atlas → atlasportal ↗'],
    ],
  },
];

const localeInfo = {
  zh: { html: 'zh-Hant', hreflang: 'zh-Hant', og: 'zh_TW', alternateOg: 'en_US', route: '' },
  en: { html: 'en', hreflang: 'en', og: 'en_US', alternateOg: 'zh_TW', route: 'en/' },
};

const escapeHtml = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const escapeXml = escapeHtml;

const escapeMarkdownCell = value => String(value)
  .replaceAll('|', '\\|')
  .replace(/\s+/g, ' ')
  .trim();

const replaceRegion = (source, name, replacement) => {
  const startMarker = `<!-- portal:${name}:start -->`;
  const endMarker = `<!-- portal:${name}:end -->`;
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`Missing ${name} generation markers.`);
  }
  return `${source.slice(0, start + startMarker.length)}\n${replacement.trim()}\n${source.slice(end)}`;
};

const portalLinks = portal => {
  const order = new Map(portal.categoryOrder.map((id, index) => [id, index]));
  return data.links
    .filter(link => link.portals.includes(portal.key))
    .sort((left, right) => {
      const categoryDelta = (order.get(left.category) ?? 999) - (order.get(right.category) ?? 999);
      if (categoryDelta !== 0) return categoryDelta;
      return data.links.indexOf(left) - data.links.indexOf(right);
    });
};

const localizedTitle = (link, locale, bilingual = false) => {
  if (locale === 'en') return link.title;
  const primary = link.titleZh || link.title;
  return bilingual && link.title && link.title !== primary ? `${primary} · ${link.title}` : primary;
};

const localizedDescription = (link, locale) => locale === 'en' ? link.descEn || link.desc || '' : link.desc || '';

const categoryLabel = (portal, categoryId, locale) => {
  const category = data.categories[portal.key].find(item => item.id === categoryId);
  return locale === 'en' ? category?.labelEn || category?.label || categoryId : category?.label || categoryId;
};

const staticDirectory = (portal, locale) => {
  const links = portalLinks(portal);
  const sections = [];
  for (const categoryId of portal.categoryOrder) {
    const entries = links.filter(link => link.category === categoryId);
    if (entries.length === 0) continue;
    const rows = entries.map(link => {
      const title = localizedTitle(link, locale, portal.key === 'atlas');
      const description = localizedDescription(link, locale);
      const status = link.url
        ? `${new URL(link.url).hostname.replace(/^www\./, '')} ↗`
        : locale === 'en' ? 'observing · soon' : portal.key === 'star' ? '觀測中 · 即將上線' : '即將上線';
      const tag = link.url ? 'a' : 'div';
      const attrs = link.url
        ? ` href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer"`
        : '';
      return `      <${tag} class="dir-link${link.url ? '' : ' coming'}"${attrs}>
        <span class="t">${escapeHtml(title)}</span><span class="h">${escapeHtml(status)}</span>
        ${description ? `<p class="d">${escapeHtml(description)}</p>` : ''}
      </${tag}>`;
    }).join('\n');
    sections.push(`    <section class="dir-sec">
      <h2>${escapeHtml(categoryLabel(portal, categoryId, locale))}<span class="lat">${escapeHtml(portal.categoryLatin[categoryId] || categoryId.toUpperCase())}</span></h2>
${rows}
    </section>`);
  }
  return sections.join('\n');
};

const structuredData = (portal, locale) => {
  const info = localeInfo[locale];
  const pageUrl = `${portal.baseUrl}${info.route}`;
  const imageUrl = `${portal.baseUrl}og-image.png`;
  const entries = portalLinks(portal);
  const itemListElement = entries.map((link, index) => {
    const item = {
      '@type': link.url ? 'WebPage' : 'CreativeWork',
      name: localizedTitle(link, locale),
      description: localizedDescription(link, locale),
    };
    if (link.url) item.url = link.url;
    if (!link.url) item.creativeWorkStatus = locale === 'en' ? 'Observing; URL not yet published' : '觀測中；網址尚未發布';
    return {
      '@type': 'ListItem',
      position: index + 1,
      item,
    };
  });

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${portal.baseUrl}#website`,
        url: portal.baseUrl,
        name: portal.dir,
        alternateName: [portal.names.zh, portal.names.en],
        description: portal.descriptions[locale],
        inLanguage: ['zh-Hant', 'en'],
      },
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: portal.names[locale],
        description: portal.descriptions[locale],
        inLanguage: info.html,
        isPartOf: { '@id': `${portal.baseUrl}#website` },
        mainEntity: { '@id': `${pageUrl}#directory` },
        primaryImageOfPage: { '@id': `${portal.baseUrl}#primaryimage` },
        dateModified: pageModified,
        lastReviewed: data.meta.updated,
        isAccessibleForFree: true,
        keywords: portal.keywords[locale].split(','),
        about: {
          '@type': 'Thing',
          name: 'Star Atlas ecosystem',
        },
      },
      {
        '@type': 'ImageObject',
        '@id': `${portal.baseUrl}#primaryimage`,
        url: imageUrl,
        contentUrl: imageUrl,
        width: 1200,
        height: 630,
        caption: portal.imageAlt[locale],
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#directory`,
        name: portal.names[locale],
        numberOfItems: entries.length,
        itemListOrder: 'https://schema.org/ItemListUnordered',
        itemListElement,
      },
    ],
  };
};

const seoHead = (portal, locale) => {
  const info = localeInfo[locale];
  const pageUrl = `${portal.baseUrl}${info.route}`;
  const imageUrl = `${portal.baseUrl}og-image.png`;
  const relativeRoot = locale === 'en' ? '../' : './';
  const jsonLd = JSON.stringify(structuredData(portal, locale), null, 2);
  return `<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(portal.titles[locale])}</title>
<meta name="description" content="${escapeHtml(portal.descriptions[locale])}" />
<meta name="keywords" content="${escapeHtml(portal.keywords[locale])}" />
<meta name="author" content="GJLMoTea" />
<meta name="application-name" content="${portal.dir}" />
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
<meta name="referrer" content="strict-origin-when-cross-origin" />
<meta name="color-scheme" content="dark" />
<meta name="theme-color" content="#0a0f1c" />
<link rel="canonical" href="${pageUrl}" />
<link rel="alternate" hreflang="zh-Hant" href="${portal.baseUrl}" />
<link rel="alternate" hreflang="en" href="${portal.baseUrl}en/" />
<link rel="alternate" hreflang="x-default" href="${portal.baseUrl}" />
<link rel="icon" type="image/svg+xml" href="${relativeRoot}logo.svg" />
<link rel="apple-touch-icon" sizes="180x180" href="${relativeRoot}apple-touch-icon.png" />
<link rel="manifest" href="${relativeRoot}site.webmanifest" />
<link rel="sitemap" type="application/xml" href="${relativeRoot}sitemap.xml" />
<link rel="alternate" type="text/plain" href="${relativeRoot}llms.txt" title="AI-readable site summary" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="${portal.dir}" />
<meta property="og:title" content="${escapeHtml(portal.titles[locale])}" />
<meta property="og:description" content="${escapeHtml(portal.ogDescriptions[locale])}" />
<meta property="og:url" content="${pageUrl}" />
<meta property="og:image" content="${imageUrl}" />
<meta property="og:image:secure_url" content="${imageUrl}" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${escapeHtml(portal.imageAlt[locale])}" />
<meta property="og:locale" content="${info.og}" />
<meta property="og:locale:alternate" content="${info.alternateOg}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(portal.titles[locale])}" />
<meta name="twitter:description" content="${escapeHtml(portal.ogDescriptions[locale])}" />
<meta name="twitter:image" content="${imageUrl}" />
<meta name="twitter:image:alt" content="${escapeHtml(portal.imageAlt[locale])}" />
<script id="portal-structured-data" type="application/ld+json">
${jsonLd}
</script>`;
};

const localizeEnglishShell = (source, portal) => {
  const scriptMarker = '\n<script>\nconst SVG=';
  const scriptAt = source.indexOf(scriptMarker);
  if (scriptAt === -1) throw new Error(`${portal.dir}: unable to locate runtime script.`);
  let shell = source.slice(0, scriptAt);
  const runtime = source.slice(scriptAt);
  shell = shell.replace('<html lang="zh-Hant">', '<html lang="en">');
  shell = shell.replaceAll(`href="${portal.siblingUrl}"`, `href="${portal.siblingUrl}en/"`);
  for (const [from, to] of portal.shellReplacements) shell = shell.replaceAll(from, to);
  return `${shell}${runtime}`;
};

const sitemap = portal => {
  const urls = ['zh', 'en'].map(locale => {
    const info = localeInfo[locale];
    const pageUrl = `${portal.baseUrl}${info.route}`;
    return `  <url>
    <loc>${escapeXml(pageUrl)}</loc>
    <lastmod>${pageModified}</lastmod>
    <xhtml:link rel="alternate" hreflang="zh-Hant" href="${escapeXml(portal.baseUrl)}" />
    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(`${portal.baseUrl}en/`)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(portal.baseUrl)}" />
    <image:image>
      <image:loc>${escapeXml(`${portal.baseUrl}og-image.png`)}</image:loc>
      <image:title>${escapeXml(portal.titles[locale])}</image:title>
    </image:image>
  </url>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>
`;
};

const robots = portal => `# Search and answer-engine crawlers are intentionally allowed.
User-agent: OAI-SearchBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: *
Allow: /

Sitemap: ${portal.baseUrl}sitemap.xml
`;

const llmsText = portal => {
  const sections = portal.categoryOrder.map(categoryId => {
    const entries = portalLinks(portal).filter(link => link.category === categoryId);
    if (entries.length === 0) return '';
    const rows = entries.map(link => {
      const title = link.titleZh && link.titleZh !== link.title ? `${link.title} / ${link.titleZh}` : link.title;
      const description = link.descEn || link.desc || '';
      return link.url
        ? `- [${title}](${link.url}): ${description}`
        : `- ${title}: ${description} Status: observing; URL not yet published.`;
    }).join('\n');
    return `### ${categoryLabel(portal, categoryId, 'en')} / ${categoryLabel(portal, categoryId, 'zh')}\n\n${rows}`;
  }).filter(Boolean).join('\n\n');

  return `# ${portal.dir}

> ${portal.llmsSummary}

## Canonical pages

- [Traditional Chinese](${portal.baseUrl})
- [English](${portal.baseUrl}en/)
- [Sibling portal](${portal.siblingUrl})
- [Machine-readable link data](${portal.baseUrl}data/links.json)

## Directory

${sections}

## Provenance and affiliation

- Directory data was last reviewed on ${data.meta.updated}.
- ${data.meta.disclaimerEn}
- This file is a supplementary machine-readable summary. The canonical HTML pages and data/links.json remain authoritative.
`;
};

const manifest = portal => JSON.stringify({
  id: './',
  name: portal.names.en,
  short_name: portal.dir,
  description: portal.descriptions.en,
  start_url: './',
  scope: './',
  display: 'standalone',
  background_color: '#0a0f1c',
  theme_color: '#0a0f1c',
  categories: ['education', 'utilities'],
  icons: [
    { src: './icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: './icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
  ],
  shortcuts: [
    { name: 'English', short_name: 'EN', url: './en/' },
  ],
}, null, 2) + '\n';

const linkDirectoryDoc = () => {
  const portalSections = portals.map(portal => {
    const categorySections = portal.categoryOrder.map(categoryId => {
      const entries = portalLinks(portal).filter(link => link.category === categoryId);
      if (entries.length === 0) return '';
      const rows = entries.map(link => {
        const title = localizedTitle(link, 'zh', true);
        const destination = link.url
          ? `[${escapeMarkdownCell(title)}](${link.url})`
          : escapeMarkdownCell(title);
        const status = link.url
          ? link.verified ? '已核對' : '待複核'
          : '觀測中';
        return `| \`${link.id}\` | ${destination} | ${status} | ${escapeMarkdownCell(link.desc || link.descEn || '')} |`;
      }).join('\n');
      return `### ${categoryLabel(portal, categoryId, 'zh')} / ${categoryLabel(portal, categoryId, 'en')}

| ID | 入口 | 狀態 | 說明 |
|---|---|---|---|
${rows}`;
    }).filter(Boolean).join('\n\n');

    const boundary = portal.key === 'atlas'
      ? '本區只收錄 ATMTA／Star Atlas 官方目的地；本站本身仍是非官方索引。'
      : '本區收錄玩家、創作者與社群作品，不代表 ATMTA 背書。';
    return `## ${portal.dir}

- 繁中入口：[${portal.baseUrl}](${portal.baseUrl})
- English：[${portal.baseUrl}en/](${portal.baseUrl}en/)
- 機器資料：[${portal.baseUrl}data/links.json](${portal.baseUrl}data/links.json)
- 邊界：${boundary}

${categorySections}`;
  }).join('\n\n');

  return `# Star portals 完整連結目錄

> 本文件由 \`scripts/generate-portal-seo.mjs\` 依 \`data/links.json\` 生成，請勿直接編輯。

- 最後核對：${data.meta.updated}
- 總筆數：${data.links.length}
- 已有網址：${data.links.filter(link => link.url).length}
- 觀測中：${data.links.filter(link => !link.url).length}

${portalSections}

## 關係與來源

- \`data/links.json\` 是連結、描述、官方性、查核狀態與 provenance 的單一資料真相。
- \`atlasportal/data/links.json\` 與 \`starportal/data/links.json\` 是部署必要鏡像。
- ${data.meta.disclaimer}
`;
};

const outputs = new Map();
for (const portal of portals) {
  const rootIndexPath = join(starRoot, portal.dir, 'index.html');
  let rootHtml = (await readFile(rootIndexPath, 'utf8')).replaceAll('\r\n', '\n');
  rootHtml = replaceRegion(rootHtml, 'seo', seoHead(portal, 'zh'));
  rootHtml = replaceRegion(rootHtml, 'directory', staticDirectory(portal, 'zh'));
  if (!rootHtml.endsWith('\n')) rootHtml += '\n';

  let englishHtml = replaceRegion(rootHtml, 'seo', seoHead(portal, 'en'));
  englishHtml = replaceRegion(englishHtml, 'directory', staticDirectory(portal, 'en'));
  englishHtml = localizeEnglishShell(englishHtml, portal);
  englishHtml = englishHtml.replace(
    '<!doctype html>\n',
    `<!doctype html>\n<!-- Generated from ../index.html by ../../scripts/generate-portal-seo.mjs; do not edit directly. -->\n`,
  );

  outputs.set(rootIndexPath, rootHtml);
  outputs.set(join(starRoot, portal.dir, 'en', 'index.html'), englishHtml);
  outputs.set(join(starRoot, portal.dir, 'sitemap.xml'), sitemap(portal));
  outputs.set(join(starRoot, portal.dir, 'robots.txt'), robots(portal));
  outputs.set(join(starRoot, portal.dir, 'llms.txt'), llmsText(portal));
  outputs.set(join(starRoot, portal.dir, 'site.webmanifest'), manifest(portal));
}
outputs.set(join(starRoot, 'docs', 'LINK_DIRECTORY.md'), linkDirectoryDoc());
outputs.set(join(starRoot, 'starportal', 'data', 'links.json'), sourceDataText);
outputs.set(join(starRoot, 'atlasportal', 'data', 'links.json'), sourceDataText);

const mismatches = [];
for (const [path, expected] of outputs) {
  if (checkOnly) {
    let actual = '';
    try {
      actual = (await readFile(path, 'utf8')).replaceAll('\r\n', '\n');
    } catch {
      mismatches.push(`${path} 不存在`);
      continue;
    }
    if (actual !== expected) mismatches.push(`${path} 尚未由 generate-portal-seo.mjs 同步`);
    continue;
  }
  await mkdir(dirname(path), { recursive: true });
  let actual = null;
  try {
    actual = await readFile(path, 'utf8');
  } catch {
    // New generated file.
  }
  if (actual !== expected) await writeFile(path, expected, 'utf8');
}

if (mismatches.length > 0) {
  console.error(`Portal SEO 生成檢查失敗（${mismatches.length}）：`);
  for (const mismatch of mismatches) console.error(`- ${mismatch}`);
  process.exitCode = 1;
} else {
  console.log(checkOnly
    ? `Portal SEO 生成檢查通過：${outputs.size} 個文字產物一致。`
    : `Portal SEO 已生成：${outputs.size} 個文字產物（雙站 × 雙語）。`);
}
