@AGENTS.md

# LiveWith (mobile app)

LiveWith matches au pairs with host families in London. This is the real, native mobile app (iOS and Android), built with Expo/React Native. It is a separate project from `landed-app` (the Next.js website), but they share the same Supabase backend: same database, same accounts, same data.

The owner is Alex (Avi). He is not a developer. Explain what you are doing in plain English, avoid jargon, and do the work for him rather than handing him commands to run. Never use em dashes in anything you write for him.

## Why this project exists

The original plan was a website (`landed-app`, Next.js on Vercel). Alex decided he wants a real downloadable app instead (App Store / Google Play), not a website. Rather than wrapping the website in a native shell, we are building native screens with Expo, while keeping the same Supabase backend (database, auth, storage) that `landed-app` already uses. At the point this project started, only the onboarding wizard existed on the website side; nothing else (matching, messaging, search, etc.) was built yet, so little work was lost by switching.

## Stack and where things live

- Expo (React Router via Expo Router, TypeScript), Supabase (Postgres, Auth, Storage) shared with `landed-app`.
- Sibling project: `../landed-app` (the Next.js website). Its `supabase/schema.sql` is the source of truth for the database schema, and its `src/lib/wizardSteps.ts` is the source of truth for onboarding questions (keep both apps asking the same questions, in the same order).
- Supabase project id: fevuhgsshdnwoaxfwlii (same project as the website)
- Secrets live in `.env.local` (never commit it, never print its contents). Only the publishable/anon key may go in an `EXPO_PUBLIC_` variable, same rule as the website's `NEXT_PUBLIC_` variables. The secret/service_role key must never ship in the app.
- Not yet set up: EAS (Expo's build/submit service), Apple Developer account, Google Play Console account. Needed before the app can actually be published or installed on a real device beyond Expo Go.

## How the app is built

- Routes live in `src/app/` (Expo Router: one file per screen, `_layout.tsx` defines navigators). Keep non-route code (components, hooks, the Supabase client) outside `src/app/`.
- `src/lib/supabase.ts` is the Supabase client, configured with AsyncStorage for session persistence on device.
- Onboarding question *keys* should be ported from `../landed-app/src/lib/wizardSteps.ts` (same keys) rather than re-invented, so data written by one app is readable by the other. The *grouping into pages* is deliberately different here (see the comment at the top of this project's `wizardSteps.ts`): the website's one-or-two-fields-per-page layout left a lot of blank space on a phone screen, so related questions are combined onto fewer, fuller pages instead.
- Expo ships breaking changes often; read `AGENTS.md` in this folder before writing any Expo/EAS/React Native code, it has the rules for checking current docs instead of trusting training data.
- Every field type (text, select, date, chips, ranges, language levels, child list, photo) is hand-built on core React Native, with no native picker/slider/date/image libraries beyond `expo-image-picker` (which Expo Go does bundle). This keeps the whole onboarding flow testable in plain Expo Go, no dev client needed — worth preserving when adding new field types.
- The photo field (`type: 'photo'` in wizardSteps.ts) only stores the local file URI the picker returns. There is no Supabase Storage bucket or upload wired up yet, so a picked photo only ever shows up on the same phone, not on another device or the website. Building real upload is still open work.

## Lessons already paid for (do not repeat)

- Update multi-select and object fields with an updater function, never by reading the current value in a click handler. Fast double taps otherwise silently drop a selection.
- Supabase's built-in email sender is rate limited and locks the confirmation email template. Custom SMTP is needed before turning "Confirm email" on.
- "Is it live?" needs an actual check (EAS build/submit status, or the Vercel Deployments page for the website), never a guess from how the app behaves.
- On this PC, plain `npx <cmd>` fails in PowerShell ("running scripts is disabled") — use `npx.cmd <cmd>` instead.
- This PC is on a work/domain network with Windows Firewall rules that block inbound connections to Node by default, so Expo Go's normal "scan a QR code on the same WiFi" mode doesn't reach it ("internet connection is offline" in Expo Go). Use `npx.cmd expo start --tunnel` instead (needs a one-time `npx.cmd expo login --no-browser`, and the project's `@expo/ngrok` devDependency; the browser-based `--sso`/default login flow fails to auto-open a browser in this environment, so always use `--no-browser` and type the username/password it asks for).
- A slider (or anything else) that calls its `onChange` on every pixel of a drag gesture, when that triggers a big re-render higher up (e.g. the whole wizard step), will visibly stutter on a real device. Buffer the live value in local state during the gesture and only call `onChange` once, on release — see `RangeSlider.tsx`.
- Expo Go (the app from the App Store/Play Store) lags the `expo` npm package by one SDK. Check `npm view expo dist-tags` for the latest version with its own stable `sdk-NN` tag (not just `latest`/`next`) before scaffolding a new project, or Expo Go will reject it with "you need the latest version of the app" even on a freshly-installed copy.

## How to work

- Before saying something is done, run `npx.cmd expo lint` (or `npx.cmd eslint .` if that fails) and `npx.cmd tsc --noEmit`, and fix anything they flag.
- Work on a branch and open a pull request for anything non-trivial.
- Tell Alex plainly what changed and how to see it on his own phone (Expo Go for quick testing; EAS builds for anything needing native modules Expo Go doesn't include).
- Test accounts exist on the shared Supabase project. Leave Alex's own test accounts alone.

## Not built yet

Matching and scoring, search filters, messaging, references and safeguarding checks, community, admin, payments, real photo/video upload to Supabase Storage (the picker works, but nothing is uploaded yet), push notifications, EAS build and app store submission setup.

## Background documents

Two documents carried over from the website project, written before the rename (they still say "Landed"; the product is now called LiveWith):

- `docs/clickable-prototype.md`: what the clickable prototype contains and why. It is the UX reference for every screen, since nothing has been built natively yet.
- `docs/build-history.md`: the full history of the website version, round by round, including bugs found, fixes, deployment lessons and open items. Useful context, but mobile-specific decisions belong in this file, not that one.
