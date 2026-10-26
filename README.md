This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Panorama pipeline

The tour uses four WebP tiers generated from the original 6080×3040 JPEGs:

- `preview` (1024×512) — first frame, preloaded in the document head
- `mid` (2560×1280) — immediate quality upgrade on all devices
- `mobile` (4096×2048) — touch-device high tier, loaded after pointer quiet
- `high` (6080×3040) — native desktop quality, loaded after pointer quiet

Regenerate the assets with:

```bash
pnpm panoramas
```

The script reads the originals from git history
(`fa1191e:public/locations/BALVR`), writes `public/panoramas/v2`, and updates
the manifest. Assets are served with immutable caching, so bump
`PANORAMA_VERSION` in `lib/panoramas.ts` and `OUTPUT_VERSION` in
`scripts/build-panoramas.mjs` whenever the generated tier output changes.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
