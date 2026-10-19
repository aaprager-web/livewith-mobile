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
- Onboarding questions should be ported from `../landed-app/src/lib/wizardSteps.ts` (same keys, same order) rather than re-invented, so the two apps stay consistent and data written by one is readable by the other.
- Expo ships breaking changes often; read `AGENTS.md` in this folder before writing any Expo/EAS/React Native code, it has the rules for checking current docs instead of trusting training data.

## Lessons already paid for on the website (do not repeat)

- Update multi-select and object fields with an updater function, never by reading the current value in a click handler. Fast double taps otherwise silently drop a selection.
- Supabase's built-in email sender is rate limited and locks the confirmation email template. Custom SMTP is needed before turning "Confirm email" on.
- "Is it live?" needs an actual check (EAS build/submit status, or the Vercel Deployments page for the website), never a guess from how the app behaves.

## How to work

- Before saying something is done, run `npx expo lint` and `npx tsc --noEmit`, and fix anything they flag (some pre-existing template type errors in `*.web.tsx` files and `global.css` imports are known and unrelated to mobile code; ignore those).
- Work on a branch and open a pull request for anything non-trivial.
- Tell Alex plainly what changed and how to see it on his own phone (Expo Go for quick testing; EAS builds for anything needing native modules Expo Go doesn't include).
- Test accounts exist on the shared Supabase project. Leave Alex's own test accounts alone.

## Not built yet

Any screens at all beyond the scaffold. Onboarding wizard, matching and scoring, search filters, messaging, references and safeguarding checks, community, admin, payments, photo/video upload, push notifications, EAS build and app store submission setup.

## Background documents

Two documents carried over from the website project, written before the rename (they still say "Landed"; the product is now called LiveWith):

- `docs/clickable-prototype.md`: what the clickable prototype contains and why. It is the UX reference for every screen, since nothing has been built natively yet.
- `docs/build-history.md`: the full history of the website version, round by round, including bugs found, fixes, deployment lessons and open items. Useful context, but mobile-specific decisions belong in this file, not that one.
