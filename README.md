# GitPilot — frontend

Chat with a GitHub repository. GitPilot indexes a repository you connect into
chunks and embeddings, then answers questions from the source code it retrieves
and cites the files and line ranges behind every answer.

This package is the **frontend only** (Next.js). It talks to the separate GitPilot
Spring Boot backend (GitHub OAuth2, PostgreSQL/pgvector, indexing, RAG chat over
server-sent events). The backend is not included here and is not modified by this
project.

**Visual identity: "Pixel RAG Lab".** A dark terminal palette (night `#10151B`,
slate `#202B35`, index green `#B8F58A`, vector cyan `#73D7E9`, retrieval violet
`#C5A5FF`, warm paper `#F4EBD8`), square 2px-edged panels with hard offset
shadows, and two bundled pixel faces used sparingly. A light theme (warm paper)
is supported alongside dark.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · TanStack Query
· Base UI / shadcn components · Lucide icons · next-themes.

## Requirements

- Node.js 20.9 or newer (the minimum for Next.js 16)
- npm (the project ships a `package-lock.json`)
- A running GitPilot backend (see [Backend](#backend))

## Install and run

```bash
npm ci                 # install exactly what package-lock.json specifies
cp .env.example .env.local   # optional; see Environment
npm run dev            # http://localhost:3000
```

| Script          | What it does                    |
| --------------- | ------------------------------- |
| `npm run dev`   | Development server              |
| `npm run build` | Production build                |
| `npm run start` | Serve the production build      |
| `npm run lint`  | ESLint (`eslint-config-next`)   |

`AGENTS.md` notes that this Next.js version has breaking changes from older
releases; after `npm ci`, the relevant guides are in `node_modules/next/dist/docs/`.

## Environment

There is exactly one variable, and it is optional (see `.env.example`):

| Variable                   | Purpose                                                                 |
| -------------------------- | ----------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL for backend calls. Leave empty to use same-origin requests.    |

Never put secrets in `NEXT_PUBLIC_*` variables: they are bundled into browser code.
The frontend never receives or stores a GitHub access token; the backend keeps it
(encrypted) and the browser only holds a session cookie.

## Backend

By default the browser calls its own origin, and `next.config.ts` rewrites three
path prefixes to the backend, which keeps the session cookie first-party:

| Prefix        | Used for                                          |
| ------------- | ------------------------------------------------- |
| `/api/*`      | The REST and SSE API                              |
| `/oauth2/*`   | Starting GitHub OAuth (`/oauth2/authorization/github`) |
| `/login/*`    | GitHub's OAuth return path to the backend         |

The rewrite destination is set in `next.config.ts`. **To use your own backend,
change the destination host there.** The OAuth app's registered callback URL must
resolve through this frontend's origin to the backend (for Spring's default,
`/login/oauth2/code/github`).

Endpoints the frontend uses: `GET /api/auth/me`, `POST /api/auth/logout`,
`GET /api/repos?refresh=…`, `GET /api/repos/{id}`, `POST /api/repos/{id}/index`,
`GET /api/repos/{id}/status`, `POST/GET /api/chat/sessions`,
`GET /api/chat/sessions/{id}`, and `POST /api/chat/sessions/{id}/messages`
(streamed over SSE: `user_message`, `token`, `assistant_message`, `done`).

## Routes

| Route                  | Purpose                                              | Guard |
| ---------------------- | ---------------------------------------------------- | ----- |
| `/`                    | Landing page                                         | public |
| `/login`               | GitHub sign-in                                       | public (redirects to `/dashboard` if signed in) |
| `/auth/callback`       | Post-OAuth session check, then redirect              | public |
| `/dashboard`           | Repositories, sync, indexing                         | signed in |
| `/dashboard/overview`  | Counts and progress derived from your repositories   | signed in |
| `/dashboard/settings`  | Account details, connection facts, theme, log out    | signed in |
| `/chat/[repoId]`       | Sessions, streamed answers, citations                | signed in |

`proxy.ts` redirects unauthenticated visits to `/dashboard/*` and `/chat/*`. Its
`devpilot_auth` cookie is only a navigation hint, not a security boundary: the
backend session and `/api/auth/me` decide who is signed in.

## Project layout

```
app/                  routes, layout, global styles (design tokens), bundled fonts
  fonts/              Pixelify Sans + Silkscreen (SIL OFL licenses included)
components/
  pixel/              shared design system: panel, badge, progress, empty state, …
  landing/ login/     landing page and login pieces, incl. the SVG pipeline scene
  dashboard/          repository tiles, indexing UI, overview, settings
  chat/               session rail, thread, composer, citations, indexing gate
  layout/ ui/         application shell and base primitives
hooks/                React Query hooks (auth, repositories, chat)
lib/                  API client, SSE stream parser, formatting, pixel state map
proxy.ts              route guard (Next.js 16 `proxy`)
```

### Design system in brief

- Tokens live in `app/globals.css` (`:root` for light, `.dark` for dark). The
  original six semantic tokens (`paper`, `ink`, `rule`, `live`, `work`, `fault`)
  keep their names; `vector` and `retrieve` were added.
- State is never colour alone: each of pending / indexing / ready / failed /
  retrieving / streaming / signed-in / signed-out has a hue, a pixel glyph and a
  text label (`lib/pixel-state.ts`, `components/pixel`).
- Motion is restrained and disabled under `prefers-reduced-motion`.
- Pixel faces are for headings and small labels only. Body text, code, paths and
  citations use Geist.

## Verification status

This redesign was built and statically audited without network access, so
**`npm run lint` and `npm run build` have not been run on this code.** What was
checked: every import resolves, every named import exists, syntax-level
TypeScript across all changed files, no unescaped JSX entities, no undefined
design tokens, and WCAG contrast of the colour tokens in both themes. Hooks, API
client, SSE parser, route guard and OAuth entry points are unchanged from the
pre-redesign code.

Please run `npm ci && npx tsc --noEmit && npm run lint && npm run build` first,
then check with a live backend:

1. Sign in with GitHub from `/` and `/login`; confirm the redirect through
   `/auth/callback` to `/dashboard`, and that signed-out visits to `/dashboard`
   or `/chat/*` redirect to `/login`.
2. Sync repositories, start an index, and watch progress go from unknown
   (marching cells) to a determinate bar to Ready; retry a failed index; open chat.
3. In chat: create and switch sessions, send a message (waiting → streaming →
   final answer), press Stop, open citation links, and open a repository that is
   not yet indexed.
4. Overview figures match the dashboard; settings shows your GitHub profile,
   theme persists across reloads, and Log out returns to `/login`.
5. Check 375 / 768 / 1280 px, both themes, reduced motion, and keyboard-only use.

## Notes

- Some pre-redesign landing files (`components/landing/index-scene.tsx`,
  `hero-figure.tsx`, `how-it-works.tsx`, `pipeline-ledger.tsx`,
  `capabilities.tsx`, and helpers) are no longer used by any route. They were left
  in place; removing them would also allow dropping the `three` dependency.
- The scopes GitHub is asked for are `repo` and `read:user`. GitHub's `repo`
  scope can read and write repositories and has no read-only form; the GitPilot
  backend only issues read requests to GitHub. The in-app copy says this.
- Bundled fonts are licensed under the SIL Open Font License; see
  `app/fonts/*-OFL.txt`.
