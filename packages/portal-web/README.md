## portal-web

This package defines `silverportal.xyz`. Everything's geared toward minimalism.

## Quick Start

```
npm ci
npm test
npm start
```

## Regenerating contract Typescript bindings

After editing the contracts and recompiling with `forge test`, run

```
npm run codegen
```

## Deployment

The app is deployed from `master` automatically via Cloudflare Pages.
