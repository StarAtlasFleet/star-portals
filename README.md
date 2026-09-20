# Star Portals

Two unofficial, bilingual star maps for finding Star Atlas destinations and community creations.

| Site | Purpose | Open |
|---|---|---|
| **starportal** | Community games, tools, guides, video, stories and music | [繁中](https://starportal.pages.dev/) · [English](https://starportal.pages.dev/en/) |
| **atlasportal** | Official Star Atlas destinations, organized by a community maintainer | [繁中](https://atlasportal.pages.dev/) · [English](https://atlasportal.pages.dev/en/) |

Both sites are independent community projects, not official ATMTA services. A listing is not an endorsement. You can explore the map, search, filter categories, switch themes, or use the complete directory. The directory remains readable without JavaScript.

## Run locally

Use Node.js **22.23.1**. No dependency installation, account, wallet, API key, or build service is required.

```sh
node scripts/serve-portals.mjs 4178
```

Open [starportal](http://127.0.0.1:4178/starportal/?sound=0) or [atlasportal](http://127.0.0.1:4178/atlasportal/?sound=0). Automated previews must use `?sound=0`.

## Contribute a link or correction

You do not need to write code: [open an issue](https://github.com/StarAtlasFleet/star-portals/issues/new/choose) with the public homepage, creator name, category and evidence of relevance. English and Traditional Chinese are welcome. Maintainers review submissions; do not upload private conversations, credentials, or unlicensed artwork.

Read [CONTRIBUTING.md](CONTRIBUTING.md) and [directory rules](docs/DIRECTORY_POLICY.md) for the full workflow. Existing creators and the maintainer's own projects follow the same rules.

## Project structure

- `data/links.json`: shared source of truth; each entry retains its own `checkedAt` date.
- `data/links.schema.json`: data contract.
- `starportal/` and `atlasportal/`: independently hostable sites, each with Traditional Chinese `/` and generated English `/en/`.
- `scripts/`: dependency-free Node preview, generator and checks.
- `docs/LINK_DIRECTORY.md`: generated directory of every entry.

After editing the shared data and, for new entries, adding a map node in the relevant Chinese `index.html`:

```sh
node scripts/generate-portal-seo.mjs
node scripts/generate-portal-seo.mjs --check
node scripts/check-portals.mjs
```

The generator synchronizes both data mirrors, locale pages, static directories and SEO files. Do not edit generated files directly. A successful consistency check does **not** mean every external destination was rechecked today; review each entry's date and evidence.

## Hosting a fork

Serve each site's directory as a separate static site. Change the base and sibling URLs in the generator and checker for your own domains, regenerate, and verify before publishing. The repository includes no deployment credentials or automatic deployment. The live demo can differ from the newest source release.

Fonts are requested from Google Fonts at runtime; the interface includes fallback fonts. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## License

Original software, original Portal artwork and original directory descriptions are available under [MIT](LICENSE). Star Atlas and creator trademarks, linked projects and remotely loaded fonts retain their own rights. This license does not grant rights to the works being linked.

## 繁體中文

這是一組非官方、可共同維護的 Star Atlas 入口星圖：starportal 收錄社群作品，atlasportal 整理官方目的地。歡迎補充作品、修正失效連結、協助翻譯；不會寫程式也可以用 Issue 表單參與。

本 repo 是獨立的公開發行，僅包含兩站及必要共用檔案。私人維護工作區、歷史、研究原檔、帳密與其他專案不屬於此 repo。所有提交須經審查；不承諾固定回覆時限或無限期維護。
