import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const starRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = join(starRoot, 'data', 'links.json');
const linkDirectoryPath = join(starRoot, 'docs', 'LINK_DIRECTORY.md');
const mirrorPaths = [
  join(starRoot, 'starportal', 'data', 'links.json'),
  join(starRoot, 'atlasportal', 'data', 'links.json'),
];
const portalHtmlPaths = {
  atlas: join(starRoot, 'atlasportal', 'index.html'),
  star: join(starRoot, 'starportal', 'index.html'),
};
const portalSeo = {
  atlas: {
    dir: 'atlasportal',
    baseUrl: 'https://atlasportal.pages.dev/',
    firstStaticText: {
      zh: '官方主站,通往遊戲、新聞、法務與各子站的總入口。',
      en: 'The official hub — gateway to the game, news, legal pages and every sub-site.',
    },
  },
  star: {
    dir: 'starportal',
    baseUrl: 'https://starportal.pages.dev/',
    firstStaticText: {
      zh: '把你的鏈上艦隊鑄成可收藏指揮官卡並出戰的唯讀同人遊戲。',
      en: 'A read-only fan game that forges your on-chain fleet into a collectible Commander Card you can take into battle.',
    },
  },
};
const errors = [];
const assert = (condition, message) => {
  if (!condition) errors.push(message);
};
const youtubeCreatorPath = /^\/(?:@[^/]+|channel\/[^/]+|c\/[^/]+|user\/[^/]+)\/?$/;

const sourceBytes = await readFile(sourcePath);
const data = JSON.parse(sourceBytes.toString('utf8'));
const portalHtml = Object.fromEntries(
  await Promise.all(
    Object.entries(portalHtmlPaths).map(async ([portal, path]) => [
      portal,
      await readFile(path, 'utf8'),
    ]),
  ),
);
let linkDirectory = '';
try {
  linkDirectory = await readFile(linkDirectoryPath, 'utf8');
} catch (error) {
  errors.push(`無法讀取完整連結文件：${error.message}`);
}

for (const mirrorPath of mirrorPaths) {
  const mirrorBytes = await readFile(mirrorPath);
  assert(
    sourceBytes.equals(mirrorBytes),
    `${mirrorPath} 已偏離 data/links.json，請先同步資料副本。`,
  );
}

assert(/^\d{4}-\d{2}-\d{2}$/.test(data.meta?.updated ?? ''), 'meta.updated 必須是 YYYY-MM-DD。');
assert(Array.isArray(data.links), 'links 必須是陣列。');

const categoryIds = new Map();
for (const [portal, categories] of Object.entries(data.categories ?? {})) {
  const ids = new Set();
  assert(['atlas', 'star'].includes(portal), `未知 portal 分類：${portal}`);
  assert(Array.isArray(categories), `categories.${portal} 必須是陣列。`);
  for (const category of categories ?? []) {
    assert(!ids.has(category.id), `categories.${portal} 出現重複 id：${category.id}`);
    ids.add(category.id);
  }
  categoryIds.set(portal, ids);
}

const linkIds = new Set();
for (const link of data.links ?? []) {
  assert(typeof link.id === 'string' && /^[a-z0-9-]+$/.test(link.id), `非法 link id：${link.id}`);
  assert(!linkIds.has(link.id), `重複 link id：${link.id}`);
  linkIds.add(link.id);

  const portals = Array.isArray(link.portals) ? link.portals : [];
  assert(portals.length > 0, `${link.id} 至少要屬於一個 portal。`);
  assert(new Set(portals).size === portals.length, `${link.id}.portals 不可重複。`);
  for (const portal of portals) {
    assert(['atlas', 'star'].includes(portal), `${link.id} 使用未知 portal：${portal}`);
    assert(categoryIds.get(portal)?.has(link.category), `${link.id} 的 category ${link.category} 不存在於 ${portal}。`);
    assert(portalHtml[portal]?.includes(`id:'${link.id}'`), `${link.id} 尚未接入 ${portal} 的 UI 投影。`);
  }

  assert(link.official === portals.includes('atlas'), `${link.id} 的 official 與 portal 歸屬不一致。`);
  if (link.url === '') {
    assert(link.verified === false, `${link.id} 尚無 URL 時 verified 必須為 false。`);
  } else {
    try {
      const url = new URL(link.url);
      assert(url.protocol === 'https:', `${link.id} 必須使用 HTTPS。`);
      if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)) {
        assert(
          youtubeCreatorPath.test(url.pathname),
          `${link.id} 的 YouTube 入口必須是創作者主頻道，不可使用單一影片、Shorts、直播、播放清單或頻道分頁：${link.url}`,
        );
      }
    } catch {
      errors.push(`${link.id} 的 URL 無效：${link.url}`);
    }
  }
  if (link.verified) {
    assert(link.url !== '', `${link.id} verified=true 時必須有 URL。`);
    assert(/^\d{4}-\d{2}-\d{2}$/.test(link.checkedAt ?? ''), `${link.id} verified=true 時 checkedAt 必須是日期。`);
  }
  assert(linkDirectory.includes(`\`${link.id}\``), `docs/LINK_DIRECTORY.md 缺少 ${link.id}。`);
  if (link.url) {
    assert(linkDirectory.includes(`](${link.url})`), `docs/LINK_DIRECTORY.md 缺少 ${link.id} 的網址。`);
  }
}

const requiredZinkLinks = new Map([
  ['zink-dashboard', 'https://z.ink/'],
  ['zink-docs', 'https://docs.z.ink/'],
  ['zink-bridge', 'https://bridge.z.ink/'],
]);
for (const [id, url] of requiredZinkLinks) {
  const link = data.links.find((entry) => entry.id === id);
  assert(link?.url === url, `${id} 必須指向 Zink 官方入口 ${url}`);
  assert(link?.category === 'zink', `${id} 必須歸入 Zink 獨立分區。`);
  assert(link?.official === true, `${id} 必須標示為官方入口。`);
  assert(
    link?.portals?.length === 1 && link.portals[0] === 'atlas',
    `${id} 只能出現在 atlasportal，不可混入社群作品星圖。`,
  );
}
const zinkBridge = data.links.find((entry) => entry.id === 'zink-bridge');
assert(
  zinkBridge?.tags?.includes('operator-managed'),
  'zink-bridge 必須保留 operator-managed 信任邊界標記。',
);

const officialYouTube = data.links.find((entry) => entry.id === 'sa-youtube');
assert(
  officialYouTube?.url === 'https://www.youtube.com/channel/UCt-y8Npwje5KDG5MSZ0a9Jw',
  'sa-youtube 必須指向 Star Atlas 官方 YouTube 頻道。',
);
assert(
  officialYouTube?.official === true
    && officialYouTube?.category === 'social'
    && officialYouTube?.portals?.length === 1
    && officialYouTube.portals[0] === 'atlas',
  'sa-youtube 只能保留在 atlasportal 官方社群分區。',
);

const requiredCommunityYouTube = new Map([
  ['cc-youtube-atlas-theory', { url: 'https://www.youtube.com/c/AtlasTheorySA', category: 'video' }],
  ['cc-youtube-star-atlas-tv', { url: 'https://www.youtube.com/@VBTV-77', category: 'video' }],
  ['cc-youtube-intergalactic-herald', { url: 'https://www.youtube.com/@intergalacticherald', category: 'video' }],
  ['cc-youtube-onizuk4-inkichi', { url: 'https://www.youtube.com/@ONIZUK4INKICHI', category: 'series' }],
  ['cc-youtube-kritical-mind', { url: 'https://www.youtube.com/@kritical_mind', category: 'music' }],
  ['cc-youtube-star-atlas-crew-adventures', { url: 'https://www.youtube.com/@StarAtlasCrewAdventures', category: 'series' }],
  ['cc-youtube-sakaleyn', { url: 'https://www.youtube.com/@sakaleynx', category: 'video' }],
  ['cc-youtube-calico-institute', { url: 'https://www.youtube.com/@ProfEarther', category: 'video' }],
  ['cc-youtube-lanzer', { url: 'https://www.youtube.com/@LanzerYT', category: 'video' }],
  ['cc-youtube-chet-roberts', { url: 'https://www.youtube.com/@ChetRoberts1', category: 'series' }],
  ['cc-youtube-winston', { url: 'https://www.youtube.com/@Winston_SA', category: 'video' }],
  ['cc-youtube-tales-of-atlas', { url: 'https://www.youtube.com/@Tales_of_Atlas', category: 'series' }],
  ['cc-youtube-cliper', { url: 'https://www.youtube.com/@Cliper32', category: 'video' }],
  ['cc-youtube-master-kamote', { url: 'https://www.youtube.com/@masterkamote', category: 'video' }],
  ['cc-youtube-hologram-news', { url: 'https://www.youtube.com/@Hologram_News', category: 'video' }],
  ['cc-youtube-fede91roma', { url: 'https://www.youtube.com/@fede91roma', category: 'video' }],
  ['cc-youtube-falkor', { url: 'https://www.youtube.com/@Falkor_ROME', category: 'video' }],
  ['cc-youtube-funjible-games', { url: 'https://www.youtube.com/@FunjibleGames', category: 'video' }],
  ['cc-youtube-metaverse-explorer', { url: 'https://www.youtube.com/c/MetaVerseExplorer', category: 'video' }],
  ['cc-youtube-metaverse-nomads', { url: 'https://www.youtube.com/@MetaverseNomads', category: 'video' }],
  ['cc-youtube-duyo', { url: 'https://www.youtube.com/channel/UCT05LjFkuN1CV93l_11N1wg', category: 'video' }],
  ['cc-youtube-nebular-tv', { url: 'https://www.youtube.com/channel/UCyVv718QM7QKsWHCQssrMFA', category: 'video' }],
  ['cc-youtube-ocg-thor', { url: 'https://www.youtube.com/@OCGThor', category: 'video' }],
  ['cc-youtube-pock', { url: 'https://www.youtube.com/@pockthepirate', category: 'video' }],
  ['cc-youtube-rahmega', { url: 'https://www.youtube.com/channel/UCzeYIsjzrXrF-dG9M60C8oA', category: 'video' }],
  ['cc-youtube-the-club', { url: 'https://www.youtube.com/@theclubguild', category: 'video' }],
  ['cc-music-star-atlas-friends', { url: 'https://www.youtube.com/@StarAtlasFriends', category: 'music' }],
  ['cc-music-varian-velaryn', { url: 'https://www.youtube.com/channel/UCRqUjEdp0jnxZRFiZwutGxg', category: 'music' }],
  ['cc-music-jindo-metamixx', { url: 'https://www.youtube.com/@MetaMixxE', category: 'music' }],
]);
for (const [id, expected] of requiredCommunityYouTube) {
  const link = data.links.find((entry) => entry.id === id);
  assert(link?.url === expected.url, `${id} 的 YouTube 頻道網址已偏離查核結果。`);
  assert(link?.category === expected.category, `${id} 必須歸入 ${expected.category} 創作者分區。`);
  assert(link?.official === false, `${id} 不可標示為 ATMTA 官方頻道。`);
  assert(
    link?.portals?.length === 1 && link.portals[0] === 'star',
    `${id} 只能出現在 starportal，不可混入官方入口星圖。`,
  );
  assert(link?.tags?.includes('youtube'), `${id} 必須保留 youtube 標籤。`);
  assert(link?.verified === true, `${id} 必須保留已查核狀態。`);
}
const creatorCategories = new Set(['video', 'series', 'music']);
const activityTiers = new Set(['activity-core', 'activity-inner', 'activity-outer']);
const youtubeCreatorUrls = new Map();
for (const link of data.links.filter(entry => (
  entry.portals?.includes('star') && entry.tags?.includes('youtube')
))) {
  assert(creatorCategories.has(link.category), `${link.id} 必須歸入唯一的影音創作者分區。`);
  const tiers = (link.tags ?? []).filter(tag => activityTiers.has(tag));
  assert(tiers.length === 1, `${link.id} 必須且只能有一個 YouTube 活躍層級標籤。`);
  assert(
    !(link.tags?.includes('music') && link.tags?.includes('series')),
    `${link.id} 不可同時標記為音樂與影集創作者。`,
  );
  if (link.url) {
    const url = new URL(link.url);
    const identity = `${url.hostname.toLowerCase()}${url.pathname.replace(/\/$/, '').toLowerCase()}`;
    assert(
      !youtubeCreatorUrls.has(identity),
      `${link.id} 與 ${youtubeCreatorUrls.get(identity)} 重複使用同一個 YouTube 主頻道。`,
    );
    youtubeCreatorUrls.set(identity, link.id);
  }
}
/* 應用殼護欄：兩站在桌機與手機都以星圖為主舞台，不退化成介紹型長頁。 */
for (const [portal, html] of Object.entries(portalHtml)) {
  assert(html.includes('class="appdock"'), `${portal}portal 必須保留場景內應用工具艙。`);
  assert(html.includes('class="directory-backdrop"'), `${portal}portal 必須保留目錄遮罩與抽屜層。`);
  assert(html.includes('id="searchresults"'), `${portal}portal 必須保留即時搜尋結果層。`);
  assert(html.includes('function wireAppShell()'), `${portal}portal 必須接上沉浸式應用殼互動。`);
  assert(html.includes('html.app-ready #directory'), `${portal}portal 的目錄必須是漸進增強抽屜。`);
  assert(!html.includes('.stage{display:none;}'), `${portal}portal 手機版不可隱藏星圖主舞台。`);
  assert(!html.includes('data-vibe-work-description'), `${portal}portal 不可重新加入官網式作品介紹段。`);
}
/* 縮放幾何護欄：高倍率已提交後，縮回時不可把滿版 SVG wrapper 壓成中央小框。 */
const scopeBetween = (source, start, end) => {
  const from = source.indexOf(start);
  const to = from < 0 ? -1 : source.indexOf(end, from + start.length);
  return from < 0 || to < 0 ? '' : source.slice(from, to);
};
const appearsBefore = (source, first, second) => {
  const firstAt = source.indexOf(first);
  const secondAt = source.indexOf(second);
  return firstAt >= 0 && secondAt >= 0 && firstAt < secondAt;
};
for (const [portal, html] of Object.entries(portalHtml)) {
  const panZoom = scopeBetween(html, 'function wirePanZoom(){', 'function wireInfocard(){');
  const rebase = scopeBetween(panZoom, 'const rebaseForZoomOut=targetS=>{', 'const commit=()=>{');
  const commit = scopeBetween(panZoom, 'const commit=()=>{', 'const clamp=()=>{');
  const minimumAnchor = scopeBetween(panZoom, 'const anchorMinimumScale=()=>{', 'const freezeHere=()=>{');
  const minimumAnchorCommit = scopeBetween(minimumAnchor, 'tx=Number(tx.toFixed(2));', 'return true;');
  const stopMotion = scopeBetween(panZoom, 'const stopMotion=()=>{', 'const animateTo=');
  const animate = scopeBetween(panZoom, 'const animateTo=(ns,nx,ny,duration)=>{', 'const svgPt=');
  const zoomAt = scopeBetween(panZoom, 'const zoomAt=(f,cx,cy)=>{', 'const focusZone=');
  const focus = scopeBetween(panZoom, 'const focusZone=zone=>{', "plate.addEventListener('wheel'");
  const wheel = scopeBetween(panZoom, "plate.addEventListener('wheel'", 'const zoneAt=');
  const pointer = scopeBetween(panZoom, 'const ptrs=new Map();', 'const resetView=');
  const reset = scopeBetween(panZoom, 'const resetView=()=>{', 'window.__focusZone=');
  const programmaticZoom = scopeBetween(panZoom, 'window.__zoom=(ns,sx,sy)=>{', 'recacheBase();');
  assert(
    rebase.includes('if(targetS>=cs) return false;')
      && rebase.includes("world.setAttribute('transform','translate(0,0) scale(1)');")
      && rebase.includes("wrapEl.style.setProperty('transition','none','important');")
      && appearsBefore(rebase, 'cs=1;ctx=0;cty=0;', 'render();'),
    `${portal}portal 必須在首次縮小時把 committed 基準重建為完整 1x 畫布。`,
  );
  assert(
    appearsBefore(animate, 'rebaseForZoomOut(targetS);', 's=targetS')
      && appearsBefore(zoomAt, 'rebaseForZoomOut(s2);', 's=s2')
      && appearsBefore(programmaticZoom, 'rebaseForZoomOut(targetS);', 's=targetS'),
    `${portal}portal 的 wheel/pinch、運鏡與程式化縮放都必須通過縮小 rebase。`,
  );
  assert(
    appearsBefore(animate, 'const rebased=rebaseForZoomOut(targetS);', 'if(rebased) void wrapEl.getBoundingClientRect();')
      && appearsBefore(animate, 'if(rebased) void wrapEl.getBoundingClientRect();', 's=targetS'),
    `${portal}portal 的運鏡 rebase 必須固定 transition 起點，避免同一 task 合併 style。`,
  );
  assert(
    wheel.includes('zoomAt(Math.exp(')
      && pointer.includes('if(ptrs.size===2)')
      && pointer.includes('zoomAt(d1/d0')
      && focus.includes('animateTo(targetS,targetTx,targetTy,duration);')
      && reset.includes('animateTo(1,0,0,460);'),
    `${portal}portal 的 wheel、pinch、區域聚焦與重設都必須保留共用縮放路由。`,
  );
  assert(
    html.includes('html.reduce-motion .platewrap{transition:none!important;}'),
    `${portal}portal 的減少動態模式不可在 rebase 或 commit 邊界補間滿版 wrapper。`,
  );
  assert(
    panZoom.includes('const k=s/cs')
      && animate.includes('Math.max(1,ns)')
      && zoomAt.includes('Math.max(1,s*f)')
      && programmaticZoom.includes('Math.max(1,ns)')
      && minimumAnchor.includes('if(s!==1) return false;')
      && appearsBefore(minimumAnchor, 'if(rafId){cancelAnimationFrame(rafId);rafId=0;}', 'if(cs===1&&ctx===tx&&cty===ty)')
      && minimumAnchor.includes('if(cs===1&&ctx===tx&&cty===ty){rot=0;render();return true;}')
      && minimumAnchor.includes('cs=1;ctx=tx;cty=ty;')
      && minimumAnchorCommit.includes("world.setAttribute('transform'")
      && appearsBefore(minimumAnchorCommit, "world.setAttribute('transform'", 'render();')
      && appearsBefore(zoomAt, 'anchorMinimumScale()', 'apply()')
      && appearsBefore(programmaticZoom, 'anchorMinimumScale()', 'apply()'),
    `${portal}portal 必須保留相對矩陣與 1x 最小倍率不變量。`,
  );
  assert(
    stopMotion.includes("inlineTransition&&inlineTransition!=='none'")
      && appearsBefore(stopMotion, 'if(gliding){', 'cancelAnimationFrame(rafId)')
      && appearsBefore(stopMotion, 'cancelAnimationFrame(rafId)', 'freezeHere();'),
    `${portal}portal 只能在真正中斷 CSS 運鏡時取消 pending frame。`,
  );
  assert(
    panZoom.includes('let panCommitTx=0, panCommitTy=0;')
      && panZoom.includes('tx-panCommitTx')
      && panZoom.includes('ty-panCommitTy')
      && rebase.includes('panCommitTx=tx;panCommitTy=ty;')
      && commit.includes('panCommitTx=tx; panCommitTy=ty;')
      && pointer.includes('clearTimeout(panPauseT);panPauseT=0;')
      && pointer.includes('if(ptrs.size===1){panCommitTx=tx;panCommitTy=ty;}'),
    `${portal}portal 的平移重繪門檻不可借用 rebase 後歸零的 committed 座標。`,
  );
}
/* 高倍率 SVG 的效能護欄：避免重新引入已實測會造成重繪風暴與灰卡閃爍的效果。 */
assert(
  portalHtml.star.includes("const MAXS=2.2, DETAIL_S=1.12"),
  'starportal 必須保留細節視角門檻與 2.2 倍縮放上限。',
);
assert(
  portalHtml.star.includes("html.detail-view .platewrap *{animation-play-state:paused!important;}"),
  'starportal 放大細節時必須預設暫停盤內裝飾動畫。',
);
assert(
  portalHtml.star.includes("html.detail-view .platewrap:not(.zooming) .detail-spin{animation-play-state:running!important;}"),
  'starportal 放大完成後必須恢復低成本核心旋轉。',
);
assert(
  portalHtml.star.includes('<g id="dial-grat" class="dial-spin detail-spin">')
    && portalHtml.star.includes('<g id="dial-ring" class="dial-spin detail-spin">')
    && portalHtml.star.includes('<g id="skyspin" class="dial-spin">'),
  'starportal 細節旋轉白名單必須保留雙盤環，且不可包含整片星野。',
);
assert(
  !portalHtml.star.includes('backdrop-filter:blur('),
  'starportal 不可重新加入 backdrop blur；高倍率時會造成情報卡灰塊與背景重取樣。',
);
assert(
  !portalHtml.star.includes('animation:linkIdleLeap'),
  'starportal 不可讓所有連結永久微跳；會為每個入口建立常駐動畫。',
);
assert(
  portalHtml.star.includes('setSpinRate(1.25)'),
  'starportal 聚焦時的全域動畫倍率不可回升到高負載設定。',
);
const unavailableBeyondHorizon = data.links.find(
  (entry) => entry.id === 'cc-youtube-beyond-horizon',
);
assert(
  unavailableBeyondHorizon?.url === '' && unavailableBeyondHorizon?.verified === false,
  'cc-youtube-beyond-horizon 的舊頻道已被 YouTube 終止，必須保持無外連的觀測狀態。',
);
assert(
  unavailableBeyondHorizon?.tags?.includes('unavailable')
    && unavailableBeyondHorizon?.tags?.includes('observation'),
  'cc-youtube-beyond-horizon 必須保留 unavailable 與 observation 標記。',
);

const requiredCommunityGames = new Map([
  ['cc-starland', 'https://starland.pages.dev/'],
  ['cc-tufa-attack', 'https://gx.games/games/h5jctu/star-atlas-tufa-attack/tracks/557a4223-d9d5-4976-8bc0-ad85b31bd800/'],
  ['cc-valley-arcade', 'https://arcade.valley.games/'],
  ['cc-battle-for-iris', 'https://battleforiris.com/'],
]);
for (const [id, url] of requiredCommunityGames) {
  const link = data.links.find((entry) => entry.id === id);
  assert(link?.url === url, `${id} 的遊戲入口已偏離查核結果。`);
  assert(link?.category === 'games', `${id} 必須歸入同人遊戲分區。`);
  assert(link?.official === false, `${id} 不可標示為 ATMTA 官方遊戲。`);
  assert(
    link?.portals?.length === 1 && link.portals[0] === 'star',
    `${id} 只能出現在 starportal，不可混入官方入口星圖。`,
  );
  assert(link?.verified === true, `${id} 必須保留已查核狀態。`);
}

const pngDimensions = bytes => {
  const signature = '89504e470d0a1a0a';
  if (bytes.length < 24 || bytes.subarray(0, 8).toString('hex') !== signature) return null;
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  };
};

const jsonLdGraphs = html => [...html.matchAll(
  /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
)].map(match => JSON.parse(match[1]));

for (const [portal, seo] of Object.entries(portalSeo)) {
  const portalRoot = join(starRoot, seo.dir);
  const expectedLinks = data.links.filter(link => link.portals.includes(portal));
  const localePages = {
    zh: {
      path: join(portalRoot, 'index.html'),
      lang: 'zh-Hant',
      canonical: seo.baseUrl,
    },
    en: {
      path: join(portalRoot, 'en', 'index.html'),
      lang: 'en',
      canonical: `${seo.baseUrl}en/`,
    },
  };

  for (const [locale, page] of Object.entries(localePages)) {
    try {
      const html = await readFile(page.path, 'utf8');
      if (locale === 'en') {
        const sourcePanZoom = scopeBetween(portalHtml[portal], 'function wirePanZoom(){', 'function wireInfocard(){');
        const generatedPanZoom = scopeBetween(html, 'function wirePanZoom(){', 'function wireInfocard(){');
        assert(
          generatedPanZoom === sourcePanZoom,
          `${seo.dir}/en 的 pan/zoom runtime 已偏離繁中 source，請重新執行 generator。`,
        );
      }
      assert(
        html.includes(`<html lang="${page.lang}">`),
        `${seo.dir}/${locale} 的 html lang 應為 ${page.lang}。`,
      );
      assert(
        html.includes(`<link rel="canonical" href="${page.canonical}" />`),
        `${seo.dir}/${locale} canonical 錯誤。`,
      );
      for (const [hreflang, href] of [
        ['zh-Hant', seo.baseUrl],
        ['en', `${seo.baseUrl}en/`],
        ['x-default', seo.baseUrl],
      ]) {
        assert(
          html.includes(`<link rel="alternate" hreflang="${hreflang}" href="${href}" />`),
          `${seo.dir}/${locale} 缺少 ${hreflang} hreflang。`,
        );
      }
      for (const requiredMeta of [
        'name="description"',
        'name="robots"',
        'property="og:site_name"',
        'property="og:url"',
        'property="og:image"',
        'property="og:image:alt"',
        'name="twitter:card" content="summary_large_image"',
        'name="twitter:image:alt"',
      ]) {
        assert(html.includes(requiredMeta), `${seo.dir}/${locale} 缺少 metadata：${requiredMeta}`);
      }
      const staticDirectory = html.match(
        /<!-- portal:directory:start -->([\s\S]*?)<!-- portal:directory:end -->/,
      )?.[1] ?? '';
      assert(
        staticDirectory.includes(seo.firstStaticText[locale]),
        `${seo.dir}/${locale} HTML source 缺少可直接爬取的目錄文字。`,
      );

      const schemas = jsonLdGraphs(html);
      assert(schemas.length === 1, `${seo.dir}/${locale} 應只有一份 JSON-LD graph。`);
      const graph = schemas[0]?.['@graph'];
      assert(Array.isArray(graph), `${seo.dir}/${locale} JSON-LD 必須使用 @graph。`);
      const collection = graph?.find(node => node['@type'] === 'CollectionPage');
      const itemList = graph?.find(node => node['@type'] === 'ItemList');
      const image = graph?.find(node => node['@type'] === 'ImageObject');
      assert(collection?.url === page.canonical, `${seo.dir}/${locale} CollectionPage URL 錯誤。`);
      assert(collection?.inLanguage === page.lang, `${seo.dir}/${locale} CollectionPage 語言錯誤。`);
      assert(itemList?.numberOfItems === expectedLinks.length, `${seo.dir}/${locale} ItemList 數量錯誤。`);
      assert(
        itemList?.itemListElement?.length === expectedLinks.length,
        `${seo.dir}/${locale} ItemList 項目數量錯誤。`,
      );
      assert(image?.url === `${seo.baseUrl}og-image.png`, `${seo.dir}/${locale} ImageObject URL 錯誤。`);
      for (const link of expectedLinks) {
        const item = link.url
          ? itemList?.itemListElement?.find(entry => entry.item?.url === link.url)?.item
          : itemList?.itemListElement?.find(entry => entry.item?.['@type'] === 'CreativeWork'
              && entry.item?.name === (locale === 'en' ? link.title : link.titleZh || link.title))?.item;
        assert(item?.name, `${seo.dir}/${locale} ItemList 缺少 ${link.id}。`);
      }
    } catch (error) {
      errors.push(`${seo.dir}/${locale} SEO 驗證無法完成：${error.message}`);
    }
  }

  try {
    const robots = await readFile(join(portalRoot, 'robots.txt'), 'utf8');
    for (const agent of ['OAI-SearchBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Googlebot', 'Bingbot']) {
      assert(robots.includes(`User-agent: ${agent}\nAllow: /`), `${seo.dir}/robots.txt 未明確允許 ${agent}。`);
    }
    assert(robots.includes(`Sitemap: ${seo.baseUrl}sitemap.xml`), `${seo.dir}/robots.txt sitemap 錯誤。`);

    const sitemap = await readFile(join(portalRoot, 'sitemap.xml'), 'utf8');
    for (const url of [seo.baseUrl, `${seo.baseUrl}en/`]) {
      assert(sitemap.includes(`<loc>${url}</loc>`), `${seo.dir}/sitemap.xml 缺少 ${url}。`);
    }
    assert(!/<(?:changefreq|priority)>/i.test(sitemap), `${seo.dir}/sitemap.xml 不應加入 Google 忽略的 changefreq/priority。`);
    assert(sitemap.includes('hreflang="zh-Hant"'), `${seo.dir}/sitemap.xml 缺少 zh-Hant alternate。`);
    assert(sitemap.includes('hreflang="en"'), `${seo.dir}/sitemap.xml 缺少 en alternate。`);
    assert(sitemap.includes(`${seo.baseUrl}og-image.png`), `${seo.dir}/sitemap.xml 缺少 OG image。`);

    const llms = await readFile(join(portalRoot, 'llms.txt'), 'utf8');
    assert(llms.includes(`${seo.baseUrl}en/`), `${seo.dir}/llms.txt 缺少 English canonical。`);
    assert(llms.includes(`${seo.baseUrl}data/links.json`), `${seo.dir}/llms.txt 缺少資料真相連結。`);
    for (const link of expectedLinks) {
      assert(llms.includes(link.title), `${seo.dir}/llms.txt 缺少 ${link.id}。`);
    }

    const manifest = JSON.parse(await readFile(join(portalRoot, 'site.webmanifest'), 'utf8'));
    assert(manifest.id === './', `${seo.dir}/site.webmanifest id 必須為 manifest 相對根目錄。`);
    assert(manifest.icons?.some(icon => icon.sizes === '192x192'), `${seo.dir}/site.webmanifest 缺少 192 圖示。`);
    assert(manifest.icons?.some(icon => icon.sizes === '512x512'), `${seo.dir}/site.webmanifest 缺少 512 圖示。`);

    for (const [file, width, height] of [
      ['og-image.png', 1200, 630],
      ['icon-192.png', 192, 192],
      ['icon-512.png', 512, 512],
      ['apple-touch-icon.png', 180, 180],
    ]) {
      const bytes = await readFile(join(portalRoot, file));
      const dimensions = pngDimensions(bytes);
      assert(
        dimensions?.width === width && dimensions?.height === height,
        `${seo.dir}/${file} 應為 ${width}×${height} PNG。`,
      );
    }

    const catalog = JSON.parse(await readFile(join(portalRoot, 'art', 'assets.json'), 'utf8'));
    for (const asset of catalog.assets ?? []) {
      const files = [asset.source, ...(asset.derivatives ?? [])];
      for (const file of files) {
        const bytes = await readFile(join(portalRoot, file.path));
        const sha256 = createHash('sha256').update(bytes).digest('hex');
        assert(sha256 === file.sha256, `${seo.dir}/${file.path} 與資產清冊 hash 不一致。`);
      }
      assert(asset.licenseStatus, `${seo.dir} 資產 ${asset.id} 缺少授權狀態。`);
      assert(asset.intent, `${seo.dir} 資產 ${asset.id} 缺少用途。`);
    }
  } catch (error) {
    errors.push(`${seo.dir} crawler／資產驗證無法完成：${error.message}`);
  }
}

if (errors.length > 0) {
  console.error(`Portal 檢查失敗（${errors.length}）：`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  const live = data.links.filter((link) => link.url !== '').length;
  const observing = data.links.length - live;
  console.log(`Portal 檢查通過：${data.links.length} 筆連結（${live} 已上線、${observing} 觀測中），2 份部署鏡像、4 個語系頁、JSON-LD、crawler 與分享圖資產一致。`);
}
