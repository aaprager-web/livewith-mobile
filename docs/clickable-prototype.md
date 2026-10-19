> Note: the app was renamed from Landed to LiveWith in October 2026. This is a saved copy of a project document written before the rename, so it still says "Landed" throughout.

# Landed — Clickable Prototype

**Live prototype:** https://claude.ai/code/artifact/b7405ca9-36b2-4a38-abb2-b824f2022131

## What this is
A working, tappable phone-frame prototype of the Landed au pair marketplace, built directly from the 7 source documents uploaded to this project:
- Master Product Blueprint v2.0 — Full Detail
- Au Pair Journey — Product Experience
- Host Family Journey — Product Experience
- Community Journey
- References & Trust User Journey
- Master Screen Inventory
- Clickable Prototype Specification (the direct build brief for this prototype)

It implements the ~25-screen sequence the Clickable Prototype Specification called for: Welcome → Choose account type → onboarding → Discover → full profile with match explanation → reference detail/"what checked means" → message → conversation → placement confirmation (both directions) → placement secured → marketplace-to-community transition → Community home → social profile, plus Search, Shortlist (family)/Interested (au pair), Messages inbox, private address collection, and profile-completion/search-status screens for both sides.

Brand name used throughout: **Landed** (the blueprint left this TBC; confirmed with Alex to use the project name).

## v2 — added depth
The first version deliberately kept several areas light, per the spec's own "what we are not building yet" list. This pass filled four of them in:
- **Full onboarding questionnaires** for both sides — a real step-by-step wizard (16 steps for au pairs, 19 for host families) covering identity, location, visa/right-to-work, dates, languages (with a proficiency level per language, see v2.1), childcare experience and age-comfort preference strength, driving, working preferences, family preferences, dynamic child add/remove for families, photo/face-blur, pay & benefits, accommodation, and a review-and-edit screen before going live.
- **A real filter library** on Search — grouped, multi-section filters (area, driving, pay, references, pets, smoking, weekends/host experience for au pairs looking at families; languages, experience, driving, smoking, references, availability, video for families looking at au pairs) that actually filter the underlying dataset, replacing the original 3 quick-toggle chips.
- **Groups & activities depth** — group detail pages with posts and a member preview, an activity detail screen (date/time/location/organiser, I'm Going/Interested RSVP, and the public-place safety note the Community journey calls for), and a working "create an activity" form that posts back into the group.
- **An admin dashboard** — built as a separate desktop-style panel outside the phone frame (per the Screen Inventory's own note that admin is a web dashboard, not part of the mobile app), with Users (suspend/reinstate), a Moderation Queue (report status workflow), a Reference Queue (mark references as checked — this is what makes "checked by Landed" appear on a profile), and a Community overview.

## v2.1 — usability fixes
Two gaps Alex found while testing the v2 build:
- **Au pair "Interested" list.** Marking a family "Interested" from Discover had no way to come back to later — only the host-family side had a persistent Shortlist. Au pairs now get their own equivalent list (accessible from My Profile), and marking "Interested" from a Discover card now correctly feeds both that list (au pair side) and the existing Shortlist (family side) rather than only showing a one-off confirmation.
- **Language proficiency level.** The au pair onboarding Languages step only let you pick which languages you speak, not how well. It now shows a level selector (Native / Fluent / Very Good / Good / Conversational) for each language you select, matching the levels already used in the seeded au pair profiles, and this shows correctly on the Review screen.

## Data used
Two fictional personas match the spec exactly — Giada C. (Italian au pair, Milan→London, 94% match with Family Smith) and Family Smith (Hendon, North London). Around them sit 9 more varied au pair profiles and 9 more varied family profiles covering the deliberate mismatches the spec asked for (poor dates, wrong hours, driving mismatch, pay mismatch, religious/lifestyle difference, different child experience, no references yet, multiple checked references) so Discover/Search don't feel artificially perfect.

## Still deliberately excluded
Full account settings, real AI-driven onboarding, real reference/ID checks and phone verification, payments/subscriptions, partner services (banking/SIM/travel), agency accounts, translation, and any real backend (messaging, matching and notifications are all simulated client-side; the admin dashboard's data is local to this session, not a real database).

## How to use it for testing
Open the artifact, use "Play: Au Pair (Giada)" or "Play: Host Family (Smith)" to start a walkthrough, or the "Jump →" buttons to skip straight to the post-placement/community screens. "Admin dashboard" (top right) opens the separate admin view. The "Moderator script" panel reproduces the persona briefs, test tasks and interview questions from the Clickable Prototype Specification (sections 42–51) so it can be run directly with real au pairs/host families without the original doc.

## Status and next steps
Alex has decided to keep building out the prototype now and gather feedback from real au pairs/host families at a later stage, rather than pausing for that testing round yet. Open items whenever that testing does happen:
1. Run the moderator script with a handful of real prospective au pairs and host families (the spec's own suggested approach — Clickable Prototype Specification sections 42–51).
2. Consolidate feedback into Keep / Change / Remove / Add per the spec's own process (section 55).
3. Resolve the still-open TBCs before freezing a V1 spec: brand name (now tentatively Landed, since renamed LiveWith), host-family pricing/paywall, 16–17-year-old safeguarding review, reference-checking process and legal wording, video at launch.
