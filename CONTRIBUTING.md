# Contributing

Small corrections are useful. Use the link request or bug report issue template; English and Traditional Chinese are welcome. Please keep public discussions specific and considerate.

## Directory submissions

Include the creator/project name, canonical public homepage, category, a short description in either language, and public evidence connecting it to Star Atlas. Explain your relationship to the project. A maintainer can help with translation and the map layout.

Read [directory rules](docs/DIRECTORY_POLICY.md). Listings are reviewed, not automatically published. Private Discord exports, personal contact information, access tokens and sensitive reports must not be submitted in issues or pull requests. Arrange a private contact channel with the maintainer for sensitive security reports before sharing details.

## Code and data

1. Fork this public repository; make a focused branch in your fork. Discuss large changes before implementing them.
2. Edit `data/links.json`; preserve historical verification dates except for destinations you actually checked.
3. For a new entry, add its matching map node/layout in the relevant site's Chinese `index.html`. The generator does not invent node positions. Do not edit `en/index.html` or deployment data mirrors directly.
4. Run the generator and both checks from [README.md](README.md).
5. For visible changes inspect both languages, desktop 1440×900 and mobile 390×844, keyboard/touch, search and directory, console/network and first paint. Use `?sound=0` in automated previews. A viewport emulation is not a real-device test.
6. Open a pull request with the problem, resulting behavior, sources and checks actually run. Keep screenshots free of personal data.

Preserve the full-screen map, no-JavaScript directory and existing zoom/performance guards. Do not add dependencies or unrelated refactors for a directory correction. Original contributions use MIT; external material needs explicit provenance and appropriate permission.

## Review and credit

Maintainers review changes and preserve contributor attribution. Public history advances with ordinary commits. Release preparation can occur in a separate private workspace; accepted public contributions must be integrated before the next release. Public issues and PRs remain the community entry point.

## 繁體中文

新增／修正入口請附公開網址、作者、分類、簡介與相關性證據，並說明是否為自己的作品。可以直接開 Issue，維護者協助翻譯和星圖位置。不要上傳私人訊息、憑證或授權不明素材。大型變更先討論；公開 PR 經審查後整合並保留署名。
