# ivon.dev

Personal site of Evgeniy Ivon — iOS, Android and Firebase developer. Built with [Astro](https://astro.build) and deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `master`.

## Development

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
```

## Content

- `src/content/blog/` — English posts, served at `/blog/<file-name>/`.
- `src/content/archive/` — posts migrated from the old blog bibobo.ru, served at `/archive/<slug>/` (slugs match the old `bibobo.ru/all/<slug>/` URLs).
- `src/content/pages/apps-privacy-en.md` — privacy policy for the apps, served at `/apps-privacy/en/`. App store listings link to this URL, so keep it stable.
- `src/data/` — site settings and landing page copy.
- `src/pages/pilot/` — the [Xcode Pilot](https://github.com/ivoneug/xcode-pilot) landing at `/pilot/` and `/pilot/ru/`, copy in `src/data/pilot.ts`, app and menu bar icons in `src/assets/pilot/`, link previews in `public/pilot/`. Panel screenshots live in `public/pilot/shots/` as lossless WebP (1292px and 646px wide): they are opaque, captured over `#ffffff` / `#15171d` to match the surface they sit on, and lossy encoding would shift that background. `pilot.ivon.dev` redirects here from the `gh-pages` branch of the xcode-pilot repository, so keep these URLs stable.
- `public/` — static files served as is (`CNAME`, images).

Old Jekyll URLs are redirected in `astro.config.mjs`.
