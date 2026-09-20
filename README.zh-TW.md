<div align="center">

# Star Portals

**下一站，探索 Star Atlas 的哪一顆星？**

兩張可以探索的星圖，一張收錄社群創作，一張整理官方入口。

**[探索社群作品](https://starportal.pages.dev/)** · **[尋找官方入口](https://atlasportal.pages.dev/)**

[English](README.md) · [推薦作品或回報問題](https://github.com/StarAtlasFleet/star-portals/issues/new/choose) · [參與貢獻](CONTRIBUTING.md)

</div>

[![Star Portal 桌機星圖：社群遊戲、音樂、故事與創作者組成的群星](docs/screenshots/starportal-desktop.png)](https://starportal.pages.dev/)

*Star Portal，把社群做出來的作品連成星座。點圖片就能進入網站；上圖為英文介面。*

## 從哪裡開始？

| | 你可以找到 | 網站入口 |
|---|---|---|
| **Star Portal · 社群群星** | 同人遊戲、工具、攻略、報導、故事與原創音樂 | [繁中](https://starportal.pages.dev/) · [English](https://starportal.pages.dev/en/) |
| **Atlas Portal · 官方入口星圖** | 遊戲、市場、DAO、開發文件、支援與官方社群連結 | [繁中](https://atlasportal.pages.dev/) · [English](https://atlasportal.pages.dev/en/) |

兩站都是 [StarAtlasFleet](https://github.com/StarAtlasFleet) 維護的**獨立、非官方社群專案**。Atlas Portal 收錄官方目的地，但入口網站本身並非官方服務；兩站皆與 ATMTA, Inc. 無隸屬或背書關係，收錄也不代表推薦或保證。

## 可以逛，也可以直接找

拖曳、縮放星圖，點進感興趣的星區；已經知道要找什麼時，就用搜尋或打開「星艙」目錄。

- **像逛星圖一樣探索：**社群作品連成星座，官方目的地圍繞天文儀器排列。
- **查找入口更直接：**搜尋名稱、切換分類，先讀簡介再前往網站。
- **繁中與英文：**可以切換語言，也能在兩個姊妹站之間往返。
- **選擇喜歡的氛圍：**五種配色、可開關音效，也能減少動態效果。
- **容易自行維護：**以 HTML、CSS、JavaScript 製作；即使沒有 JavaScript，仍可閱讀完整目錄。

[![Atlas Portal 桌機星圖：遊戲、治理、開發與支援入口環繞天文儀器排列](docs/screenshots/atlasportal-desktop.png)](https://atlasportal.pages.dev/)

*Atlas Portal，由社群整理的官方目的地星圖。點圖片就能進入網站；上圖為英文介面。*

### 手機上的星艙

打開目錄，分類、簡介與連結就會出現在星圖上方。以下是繁中手機版的實際畫面。

<table>
  <tr>
    <th>Star Portal · 社群作品</th>
    <th>Atlas Portal · 官方入口</th>
  </tr>
  <tr>
    <td align="center"><a href="https://starportal.pages.dev/"><img src="docs/screenshots/starportal-mobile.png" width="270" alt="Star Portal 繁中手機目錄，展示社群遊戲與介紹"></a></td>
    <td align="center"><a href="https://atlasportal.pages.dev/"><img src="docs/screenshots/atlasportal-mobile.png" width="270" alt="Atlas Portal 繁中手機目錄，展示官方遊戲入口與介紹"></a></td>
  </tr>
</table>

截圖直接擷取自上線網站，未後製；分別使用桌機與手機尺寸的瀏覽器視窗。[尺寸、來源與擷取紀錄](docs/screenshots/manifest.json)。

## 一起把更多作品點亮

你做了 Star Atlas 相關作品？發現遺漏的創作者、失效連結，或需要修正的介紹？**[開一張 Issue 告訴我們](https://github.com/StarAtlasFleet/star-portals/issues/new/choose)**，不會寫程式也能參與。

附上公開首頁、作者、分類，以及和 Star Atlas 相關的簡短說明即可，繁中與英文都歡迎。投稿會經過審查，維護者自己的作品也適用相同標準。

想協助程式、翻譯或資料整理，可以閱讀[貢獻方式](CONTRIBUTING.md)和[收錄原則](docs/DIRECTORY_POLICY.md)。請勿在公開投稿中放入私人對話、憑證或授權不明的素材。

## 在自己的電腦執行

使用 **Node.js 22.23.1**。執行入口網站不需要安裝套件，也不需要帳號、錢包或 API 金鑰。

```sh
git clone https://github.com/StarAtlasFleet/star-portals.git
cd star-portals
node scripts/serve-portals.mjs 4178
```

開啟 [Star Portal](http://127.0.0.1:4178/starportal/?sound=0) 或 [Atlas Portal](http://127.0.0.1:4178/atlasportal/?sound=0)。自動化預覽使用 `?sound=0`，保持靜音。

### 更新資料與檢查

| 路徑 | 用途 |
|---|---|
| `data/links.json` | 共用入口資料，保留各筆實際核對日期 |
| `data/links.schema.json` | 資料格式規格 |
| `starportal/` · `atlasportal/` | 各自可部署的靜態網站；`/` 為繁中、`/en/` 為英文 |
| `scripts/` | 不需額外套件的預覽、產生與檢查工具 |
| [docs/LINK_DIRECTORY.md](https://github.com/StarAtlasFleet/star-portals/blob/main/docs/LINK_DIRECTORY.md) | 自動產生的完整目錄 |

修改共用資料；新增入口時，也要在對應站的繁中 `index.html` 加上星圖節點與位置。接著執行：

```sh
node scripts/generate-portal-seo.mjs
node scripts/generate-portal-seo.mjs --check
node scripts/check-portals.mjs
```

產生器會同步部署用資料、英文頁、靜態目錄與 SEO 檔案，請勿直接修改這些產出。檢查通過代表資料一致，不表示當天重新查證過所有外部網站；請參考各筆 `checkedAt` 和佐證。

### 部署自己的版本

兩個站的目錄可以分別部署到靜態網站服務。先在產生器與檢查工具中換成自己的主網址及姊妹站網址，再重新產生、檢查後發布。Repo 不含部署憑證或自動部署；線上展示與最新原始碼可能存在版本差異。

## 授權與致謝

原創程式、Portal 圖像與目錄介紹採用 [MIT 授權](LICENSE)。Star Atlas 和創作者的商標、被連結的作品與字型保留各自權利，不會跟著套用 MIT；Repo 未附帶官方艦船美術。

介面透過 Google Fonts 載入 Cinzel、Noto Serif TC 和 Space Mono，並提供備用字型。詳細來源與授權界線見[第三方聲明](THIRD_PARTY_NOTICES.md)。

由 [GJLMoTea](https://github.com/gjlmotea) 建立與維護，收錄於 [StarAtlasFleet](https://github.com/StarAtlasFleet)。每一筆補充，都能幫下一位探索者更快找到方向。
