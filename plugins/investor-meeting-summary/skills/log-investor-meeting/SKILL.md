---
name: log-investor-meeting
description: Log an investor meeting into Portal's Airtable VC CRM using the Otter.ai transcript. Use this whenever someone says they just met with, spoke to, or had a call with a VC firm or investor and wants it logged, summarized, or added to Airtable — e.g. "I just met with Accel, check Otter and update Airtable", "log my Benchmark call", "pull my Otter notes from the Sequoia meeting into the CRM". Also use it when someone asks to update an investor's Airtable record with meeting notes, even if they don't mention Otter by name.
---

# Log an investor meeting

Turn an Otter.ai meeting transcript into a structured, investor-focused note and file it by **submitting the "New meeting or firm updates" form**. Notes in this base are individual records — never a text field appended on the firm record itself.

**Submit the form. Do not create the record directly.** This is not a style preference. Two automations on the notes table fire on `formSubmitted`, not on `recordCreated`, so an API-created record skips them silently:

- `wflo60JS5K7kpVp4S` "VC Updater Form 2 – Update Portal Contacts" — for each person in "Your contacts", finds them in the people table and tags the submitter as their **Portal Contact**. This is how the base records who at Portal owns the relationship. The form promises it: *"You will be tagged as a 'Portal Contact' with people added"*.
- `wflTD0M9GP7VmkQ6h` "Send notification email".

Create the record through the API and the note lands looking perfect while the submitter is never tagged — a failure with no visible symptom. Submitting the form also fires the `recordCreated` automations, so form submission is strictly a superset.

## Configuration (verified against the live base and form schema on 17 Sep 2026)

- AIRTABLE_BASE: "Venture" — baseId `appAX3sMfPtCKv4nB`
- **FORM**: "New meeting or firm updates" — pageId `pagSKVK0ORMV9iKWR`. Standalone (`interfaceId` is null, so omit `interfaceId` when submitting). Creates records in "Investor Viewer Updater" (`tblQbKYkiNx3rckpj`).
- INVESTORS_TABLE: "Organizations from Hubspot CRM" — tableId `tbl5bYS4WIAr3BFWK`, primary field "Name" (`fldXgesU5mz8YB1kq`). All orgs synced from HubSpot; the "VCs" view filters to VC firms. Rolls up its people's emails in "Email Address (from HubSpot CRM)" (`fldckjoCBQTJKf3js`).
- PEOPLE_TABLE: "HubSpot CRM" — tableId `tbllMLUVkBlg2lUzI`, with "Email Address" (`fldhEDQv17zK4g23p`) and "Portal Contact" (`fldx3TJySJFMRpydK`).

Run `get_form_schema` on the form if you need to confirm anything below; it is the source of truth.

### Fields the workflow always sets

| Form field | Field ID | Notes |
| --- | --- | --- |
| Submitted by (**required**) | `fldDQHFvDkufQwQJ7` | Collaborators. See "Submitted by" below. |
| Firm (**required**) | `fldykXuyEBmt5x3JI` | Link → the ONE firm record. |
| Your contacts | `fldTMbg0UURqCWThF` | Link → PEOPLE_TABLE. The investor-side attendees. Driving the Portal Contact tagging, so fill it whenever you can. |
| Update type (**required**) | `fldmYGIR7nhmYm6xV` | "Meeting" or "Non-meeting update (eg by email)". |
| Notes (**required**) | `fldOScuBxvOVfMrlJ` | Rich text. The note. |
| Notes cateogry (**required**) | `fldgGaFP0AYf3y7l8` | Multi-select; spelling is intentional. See definitions below. |

**"Submitted by"** takes more than one collaborator. Include the other Portal people who were actually on the call — it credits them and gets them Portal-Contact-tagged too. The record's title is the formula `{Submitted by}, {Created as MM/DD/YY}`, so every name renders in the title; that is expected. The field only accepts base collaborators, so anyone who is not one has to be named in the note text instead. Offer the Otter `get_user_info` name/email as the default, confirming the first time.

**"Notes cateogry"** — use these definitions, lifted from the form's own helper text, so tagging is consistent across the team. Submit the option names exactly as written:

- `Portfolio company diligence status update` — you updated the status of one of the companies above and added notes describing the change.
- `Fund thesis/updates` — what areas a fund invests in or does not, raising a new fund, etc.
- `Personnel bios and changes` — people hired or leaving the firm, their career background, etc.
- `Other dealflow` — non-portfolio companies you share with this firm, and companies this firm shares with you.

### Fields to offer when the meeting produced them

Do not fill these silently, and do not pretend they do not exist — ask when the conversation warrants it.

- **Send reminder email?** (`fld7TPL44VroZKv58`, checkbox) and **Follow-up reminder (weeks)** (`fldrqHJMJFHJT83HM`, "1"–"4"). Schedules a real follow-up email. The weeks field is only visible when the checkbox is true, so submit it **only** alongside `true`, and never on its own. Offer this when the user mentions wanting to circle back — "want a reminder in two weeks?"
- **Notification email** (`fldqndV0CqIK9EKr6`, collaborators). Emails the people listed. Offer when a colleague should see the note.
- **People no longer at firm** (`fldcnskmnRS0zFFnR`, link → PEOPLE_TABLE). Whenever someone mentions a person has left, this is a free CRM cleanup — flag it and it hides them from the firm's people list.
- **Diligence status** — if you log a status change for a Portal company, write the six form link fields, NOT the per-company single selects. The single selects are the base's internal representation that scripts consume; the link fields are what a human submitting the form fills in:
  `1 ⚫ Non-con sent` `fld2q82osNmGSbvDN` · `2 🟡 Intro meeting` `fldXAUAiALG5hfw4Z` · `3 🟣 In diligence` `fldYaePXBygs8qvvH` · `4 🔵 Likely in syndicate` `fldvB0aadLUK8luaz` · `5 🟢 Investment made` `fldcQkkGFegS3Ozlu` · `6 🔴 Passed` `fld9eOL5Xgs6a49ss`
- **Investor stats**, when the investor stated them: AUM `fldd1BMtlReW1uLQi` · Min check `fld9GjoWQa9DPNz0E` · Max check `fldjgHxqm8Ecjothv` · Lead deals? `fldL5D98jxNs7VKLJ` · Fund stage `fldWbF0PhnXslmggc` · Fund focus `fldS6O2QK1r0j3d31`. Only from what they actually said.

Be aware: submitting the form sends the notification email automation regardless of whether you set "Notification email".

## Pipeline

0. **Preflight — verify both connectors before doing anything else.** Check that Otter.ai's tools (search, fetch, get_user_info) and Airtable's tools are present, then make one cheap call to each: Otter `get_user_info` and Airtable `ping` (or `list_bases`). If either connector's tools are missing or a call fails with an auth error, STOP immediately — run no other step — and tell the user exactly which connector to enable or re-authenticate (in a chat: + menu → Connectors → toggle it on; on first use of this plugin: accept the authentication prompt when it appears). Resume only after they confirm. Keep the name/email from Otter's `get_user_info` for "Submitted by".

1. **Find the meeting in Otter.ai.** Search the user's Otter conversations for the firm name (and the date, if given). Prefer the most recent match. If more than one is plausible, list the candidates and ask. Otter search runs against the signed-in user's own Otter account.

2. **Fetch the transcript** and pull out the attendees, their email addresses or domain if any appear, and the substance for the note.

3. **Resolve the firm — the highest-risk step.** Filing a note against the wrong company is worse than filing a duplicate, and Otter renders proper nouns unreliably. One real transcript gave "Wushi", "Wuji" and "Wu Xi" for a firm that exists in this base as three genuinely separate records (WuXi Biologics, WuXi AppTec, WuXi STA) whose CDAs do not cover each other.
   - **Prefer the email domain over the name heard in the transcript.** Search PEOPLE_TABLE "Email Address" (`fldhEDQv17zK4g23p`) for the attendee's domain and follow to their firm; or check the firm's "Email Address (from HubSpot CRM)" rollup (`fldckjoCBQTJKf3js`). The domain is usually the only thing in the meeting that resolves it.
   - **Normalise a trailing suffix** (Inc, LLC, LP, Ltd, Capital, Ventures, Partners) before comparing names, so a suffix difference does not read as two candidates.
   - **Use linked contacts as the tie-breaker. Do NOT use note count.** Linked contacts is a real signal. "This record already has recent notes" only means it has been used before, which is exactly how a wrong match becomes self-reinforcing.
   - Show the user the record you chose and confirm. If there is no clean match, list the closest candidates and ask — never guess, and never create a firm record.

4. **Write the note.** Use the skeleton and rules below.

5. **Confirm, then submit.** Show the user the draft note, the category tags, the firm record, and every optional field you propose to set — including anything that sends mail. Only after they confirm, call `submit_form` with `baseId`, `pageId: "pagSKVK0ORMV9iKWR"`, no `interfaceId`, and the fields object.

6. **Optional close — promised sends.** If the note records a commitment by the user to send something (a company, a deck, a non-confidential summary) and this session has a mail tool available, offer: *"You offered to send them X — want me to check whether it went?"* Only offer it if you can actually check; never claim to have checked when you have not.

## The note

Twelve possible sections. **A section exists only if the conversation actually produced it.** Most notes use four or five. A heading with "none" or "not discussed" under it is worse than no heading, and stretching a thin meeting to fill the skeleton is the failure mode to design against.

1. **Since last time** — only when a prior note exists and something changed. Read the previous note and lead with the delta.
2. **Key highlights** — 2–4 bullets; what is worth remembering in six months.
3. **Fund and thesis** — fund status and timing, where they are in their own raise, stages, check sizes and ranges, deals per year, whether they lead, thesis or sector shifts, geography and whether our regions fit their mandate.
4. **Companies they are working on** — diligencing, closing, or recently invested.
5. **Companies they are sharing with us.**
6. **Companies we are sharing with them.** Keep 4, 5 and 6 separate — they are different obligations, and collapsing them loses which one you owe.
7. **Passes and negatives** — what they passed on, declined, or were cool about, and the stated reason. High value, and the first thing lost in a summary.
8. **Their process** — how they decide, IC cadence, time from intro to term sheet, who else has to say yes.
9. **Co-investors they named** — this is how syndicates get built.
10. **People and personal** — team moves, departures, new partners, plus rapport detail worth remembering.
11. **Follow-ups** — only commitments actually made, by either side, owner named. A "might" is not a follow-up.
12. **Next contact** — any agreed date or cadence.

**Style**

- **Bullets only.** No prose blocks, no play-by-play. The test for each line: would the reader want it before walking into the next meeting with this firm?
- **No word cap.** A cap makes you drop facts to fit, which is backwards. The discipline is structural: if a note runs long the cause is narration, so cut the narration, not the facts. Notes land naturally around 150–350 words.
- Open with a header line: `<Firm>, <YYYY-MM-DD>. <Attendees and titles>. <Update type>.`

**Exclusions.** Include nothing about Portal itself — our fundraising, metrics, product — with three exceptions:

- commitments the investor made to us;
- their reaction to something of ours, where the reaction *is* the information ("the New Jersey angle is what interests them");
- a company we committed to send them, which is the whole point of the note in that case.

The filter is relevance to the investor, not caution. It is never licence to write a thinner note about something sensitive.

### Worked example

Invented firm, invented people. Note the shape as much as the content: only eight of the twelve sections appear, because that conversation did not produce the others. That is the correct output, not an incomplete one.

> **Redpine Ventures, 2026-08-26. Dana Whitfield (Partner). Meeting.**
>
> **Key highlights**
> - Fund III is closing early next year and Dana said they will be writing bigger first checks out of it.
> - They are actively looking at ADC platforms following two portfolio exits.
> - Dana is moving back to Chicago in the spring, which makes her materially easier to see in person.
>
> **Fund and thesis**
> - Fund III targeting a close in Q1, size not disclosed.
> - First checks moving up from roughly $1M–$2M to $3M–$5M.
> - Stays at seed and Series A, does not follow into B.
> - Leads about half the time, and Dana said they are comfortable either way.
> - Roughly eight to ten new investments a year.
> - Thesis has shifted toward ADC platforms after the two exits; previously more diagnostics-weighted.
> - Invests nationally, and Dana was specific that non-coastal is not a barrier for them.
>
> **Companies they are working on**
> - Two oncology startups in diligence, both pre-Series A, names not given.
> - One diagnostics company closing this month, which Dana described as their last deal out of Fund II.
>
> **Companies they are sharing with us**
> - Dana offered to send the two oncology startups once she has cleared it with the founders.
>
> **Companies we are sharing with them**
> - Our non-confidential summary on the cardiovascular device company, which Dana asked for directly.
>
> **Co-investors they named**
> - Frequently alongside Harbor Point and Kestrel Bio at seed.
> - Dana mentioned they have co-invested with Lakeshore three times and would do it again.
>
> **People and personal**
> - Hired a new principal in July, focused on tools and platforms, name not mentioned.
> - Their operating partner left in the spring and has not been replaced.
> - Dana is moving back to Chicago in the spring. She offered to introduce us to a co-investor she rates highly.
>
> **Follow-ups**
> - Ignacio: send the non-confidential summary on the cardiovascular device company.
> - Dana: send the two oncology startups once cleared with the founders.
> - Dana: make the co-investor introduction.
>
> **Next contact**
> - Coffee once Dana is back in Chicago, no date set. She suggested we not wait for that if the summary raises questions.

## Rules

- Submit the form (`pagSKVK0ORMV9iKWR`). Never create the record directly in `tblQbKYkiNx3rckpj` — it skips the Portal Contact tagging silently.
- Never skip an approval checkpoint. The user confirms the firm record, and confirms the note and every field before submission — especially any field that sends mail.
- Do not modify records in INVESTORS_TABLE or PEOPLE_TABLE — this workflow only reads them; all writes go through the form.
- One submission per meeting; never edit or overwrite existing note records.
- Select values must exactly match the option names in the form schema — never invent or reword them.
- Submit "Follow-up reminder (weeks)" only when "Send reminder email?" is true; it is hidden otherwise.
- Never skip step 0. If a connector drops mid-run, stop, tell the user, and re-run the preflight — don't improvise around a dead connection.
- If a submission fails on validation, re-check with `get_form_schema`, adjust, and confirm with the user before retrying.
- When unsure about anything — which meeting, which firm, which category — ask instead of guessing.
