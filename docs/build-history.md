> Note: the app was renamed from Landed to LiveWith in October 2026. This is a saved, lightly condensed copy of the "real app" project document, written before the rename, so older text still says "Landed". The web address, GitHub repo and Vercel project still use the old "landed" name.

# Moving from prototype to a real app: build history

Related: docs/clickable-prototype.md (the clickable prototype this build takes its onboarding questions and screen flow from).

## Decisions

After the clickable prototype was feature-complete and tested by Alex, he decided to build the real, database-backed app rather than keep deepening the prototype.

- Stack: Next.js (TypeScript, App Router), Supabase (Postgres, Auth, Storage), Vercel deployed from GitHub. Chosen to avoid the Replit-credit and Railway free-tier friction hit on an earlier project, and because auth, database and file storage sit in one place.
- Scope: thin vertical slice first. Real accounts, real persisted onboarding and basic real profile browsing before matching, messaging, trust and references, community or payments.
- Code home: git repository, saved into Alex's OneDrive via the linked-PC bridge. Claude's sandbox has no GitHub credentials, so creating the Supabase and Vercel projects and pushing to GitHub were steps Alex did himself.

## v1: what was built

- Supabase schema: a single `profiles` table (role, display_name, `profile_data` JSONB, `onboarding_complete`) with row-level security. It mirrors the prototype's own `wizard.data` shape on purpose, so the whole onboarding question set was reused rather than needing a column per question.
- Real signup (role choice, email and password via Supabase Auth) and login.
- The full onboarding wizard for both sides, ported field for field from the prototype, saving to the database on every step so someone can refresh or come back and resume.
- A basic Discover page listing other real accounts on the opposite side who have finished onboarding. No matching score, filters or messaging yet.

## v1.1: bugs from Alex's first real run-through

- Login bounced back to Join. Cause: with "Confirm email" on in Supabase Auth there is no session at signup, so the profile row can't be created (row-level security correctly blocks it), and nothing recovered later. Fix: role and name are also stored on the auth user at signup (`options.data`), and the onboarding page creates the missing profile row on first login.
- Signup's name label switches live between "Your name" and "Family name" depending on role (small `SignupForm` client component).
- "Could not find the table 'public.profiles' in the schema cache": a stale cache after running `schema.sql` (fixed with `notify pgrst, 'reload schema';`), and then it turned out `schema.sql` had never been run at all on Alex's project.
- Supabase now calls the anon key the "publishable key". Both work.
- Supabase's built-in confirmation email has a very low free-tier rate limit, so "Confirm email" was switched off for testing.

## v1.2: onboarding content round

Name typed at signup pre-fills the wizard name question. Au pair nationality became a dropdown (`NATIONALITIES`), age became date of birth (Discover computes age, falling back to the old `age` field). Destination became multi-select with more London areas plus "Flexible / any area". Right to work gained "N/A". Languages gained a "Basic" level. Host family start-date options were simplified to ASAP / Within 3 months / 3-6 months / Flexible, and right to work gained "Not fussed". Wizard header shows Back on the left and "Step X of Y" on the right.

Not built, flagged as bigger work: a real photo step (selfie or gallery upload) and a recorded or uploaded video of up to 60 seconds. Both need Supabase Storage and browser media capture. The current "Use suggested profile photo" is a placeholder from the prototype.

## v1.3: first live deployment

Alex pushed to a private GitHub repo and deployed on Vercel, using Command Prompt rather than PowerShell to avoid a script-execution-policy block on `npm install`.

- Vercel's New Project import flow silently dropped the environment variables, so the live site returned 500 ("Your project's URL and Key are required"). Fix: add both variables under Settings, Environment Variables (type "Config"), then redeploy.
- The first deployment can be created with zero builds run. Fix: Deployments, "...", Create Deployment, branch main, Deploy to Production.
- Standing security check: before any key goes into a `NEXT_PUBLIC_` variable, confirm it is the public publishable/anon key and never the secret/service_role key, which would bypass row-level security.

Live URLs: app at https://landed-app-three.vercel.app. Vercel project landed9/landed-app. GitHub repo aaprager-web/landed-app. Supabase project fevuhgsshdnwoaxfwlii.

## v1.4: test data and a stale-closure bug

Eight test accounts were created on production (au pairs: Giulia Ferrari, Anna Kowalska, Sophie Laurent, Marta Novak; host families: The Bennett, Osei, Whitfield and Hussain families). Alex's own earlier test accounts ("Au Pair1", "Alexa Prager") were left alone.

Bug found and fixed: rapid clicks on multi-select chips could silently drop a selection, because handlers read the field's value from the last render and two quick clicks overwrote each other. Fixed with `updateField(key, updater)` in `Wizard.tsx`, which computes the next value from the current one at apply time. Used for `chipMulti`, `strength`, `languageLevels` and `childList`.

## v1.5 to v1.8: feedback rounds (all implemented and live)

- Hours per week is a sliding scale on both sides, 0 to 50 in steps of 5, shown as "50+ hrs/week" at the top. The two-handle control is one bar built from two stacked native range inputs (`DualRangeSlider` in `Wizard.tsx`, `.dual-range-thumb` styles in `globals.css`). Keep both inputs' min and max fixed at the full range and stop crossing with clamping in the change handlers, because setting one input's min equal to its max makes Chromium pin its handle to the far left.
- Weekly pay is a range on both sides, £0 to £500 in £5 steps, "£500+/week" at the top. Au pairs got a new "Pay expectations" step after "Working preferences".
- Duration ("How long are you looking to stay?" for au pairs, "How long is the placement?" for families) is a range, 0 to 24 months in 1-month steps, "Under 1 month" at the bottom and "24m+" at the top. `underMinLabel` and `overMaxLabel` on a range field override the end labels.
- Au pair "Languages" with "Other" shows a searchable language input (about 75 world languages). Host family "Language" step gained an optional second-language dropdown.
- Au pair Driving options are Full licence / Learning or provisional / No licence.
- Single-choice and strength chips toggle off when clicked again.
- Review step highlights skipped questions with a "Skipped" badge and a count banner.
- Email confirmation: `src/app/auth/confirm/route.ts` verifies a `token_hash` server-side and redirects to `/login`. The Supabase email template still needs pointing at it, which is blocked on custom SMTP (see open items).
- Au pair "When can you start?" is one "Earliest start date" date field (cannot be in the past).
- Au pair required fields: full name, nationality, date of birth, earliest start date, length of stay. Unanswered required fields block Continue and the final Review button, with a red asterisk on each label. Nothing is required on the host family side.
- "Select all that apply" subtitle on the au pair multi-select steps: "Where do you want to au pair?" and "Childcare experience". Alex also named "step 6", which is now a slider, so it was not applied there. Still unconfirmed which other step he meant.
- The generic `date` field takes optional `dateMin` and `dateMax` set to `'today'`, used on date of birth (no future dates) and earliest start date (no past dates).

Deploy lesson: a successful `git commit` does not mean it was pushed. Check the Vercel Deployments page for the commit hash and a Ready status instead of guessing from how the site behaves.

## Question-matching audit (au pair against host family)

Matches cleanly today: right to work (au pair status against family requirement), length of stay, hours per week, weekly pay, English and language level, driving, smoking.

Asymmetries to design around when matching is built:
- The au pair start date is an exact date, but the family's is a bucket (ASAP, within 3 months, 3-6 months, flexible). The family's bucket will need translating into a date range.
- Families list benefits (language course contribution, travel card, use of a car) that au pairs are never asked about.
- Au pairs rate how important "similar religion / values" is, but families never state theirs.
- The family weekly pattern (early mornings, school run, after school, evenings, occasional weekends) is more detailed than the au pair's evenings and weekends question, so there is no au pair answer on early starts.

## Not built yet

Matching and scoring, search filters, messaging, references and trust, community, admin, payments, and real photo and video upload. The prototype remains the UX reference for all of these.

## Open items

- Supabase's "Confirm signup" email template is locked while the project uses Supabase's built-in email sender. Editing it needs custom SMTP (for example Resend, which has a free tier). Once editable, change the link to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/login`, then switch "Confirm email" back on. Claude can explain provider setup but must not paste API keys into forms for Alex.
- Supabase Authentication, URL Configuration (Site URL and Redirect URLs) was set up for local testing (`http://localhost:3001`) and has not been confirmed to include the live Vercel domain.
- Safeguarding for 16 and 17 year olds, reference and ID checks, and data protection are real legal obligations now that real people's and children's data is stored. Settle before opening the app beyond Alex's own testing.
- Which au pair step should get the third "Select all that apply" subtitle.
- Decide the scope of real photo and video upload, then what comes after the vertical slice: matching, messaging, or trust and references.
