---
name: file-tech-refs
description: File the publications behind a startup's technology into Tech Refs on its Airtable record, in Portal's house format, each one linked to the copy saved in the company's SharePoint folder. Use this whenever someone wants references put on a company's record — "add these papers to Tech Refs for Silver Labs", "file the references from the deck", "put the literature for Veil Therapeutics in Airtable", "these two preprints should be on the record" — whether the papers come from a triage note, a pitch deck, an email thread or a list they paste. Also run it when the update-triage-notes skill hands off after its own write because the triage note named a paper or preprint.
---

# File a company's references into Tech Refs

Take the publications a source names — a triage note, a deck, an email thread, or a list the user pastes — resolve each one against its own page, find its saved copy in the company's SharePoint folder, and write the set into Tech Refs `fldOK6kGR6kb5XymL` on the company's record in the "Startups" table, grouped and linked the way the team keeps references.

Three things shape every run. **Only papers the source names.** The job is to file what someone cited, never to build a reading list; a paper that would plainly belong but that nobody named stays out. **Every bibliographic detail is read from the paper's own page.** First author, year, journal and exact title come from the DOI landing page, PubMed, bioRxiv or the publisher, opened and read — not from a search snippet, not from memory, never guessed. **The connector may not be able to upload, so no file is "saved" on your say-so.** In the session that prompted this skill, the Microsoft 365 connector could search SharePoint and read it, not write to it. Until an upload tool exists and succeeds, saving is the user's job and the skill says so.

## Configuration

IDs below were taken from the base schema on 2026-10-09. `get_table_schema` on the table is the source of truth — run it if anything here looks wrong, and before the first write of a session.

- AIRTABLE_BASE: "Venture" — `appAX3sMfPtCKv4nB`
- STARTUPS_TABLE: "Startups" — `tblkuk4Fpb1pYp4Ux`, primary field "Name" `fld3itRTH4JpDjbMz`. The table behind the "Deals" interface and the Deal Flow record pages; there is no "Deal Flow" table.
- Record page, to link once you have written: `https://airtable.com/appAX3sMfPtCKv4nB/pagEE4hR4JW5uv0qc/<recId>?home=pag56exCQcCiTSB6z`
- TECH_REFS: "Tech Refs" — `fldOK6kGR6kb5XymL`, rich text. **The only field this skill writes.**
- TECH_FIGURES: "Tech: Figures" — `fld6n2ULEkF52Vi3Q`, attachments. **Never written** — the Airtable connector cannot upload, and attachments can only be set from a URL Airtable fetches for itself. Named at the hand-off as the field the user attaches figures to.
- Records already in the house format, to read if the format below ever looks wrong: Amlysion Therapeutics `recqL6QgpWiGc7rMh` (the closest model — a group heading, a linked title, numbered notes), Amptiv Biosciences `recADFwslzbTmX9qW`, Ensemble Biosystems `recUyBHbntjYvFc9x`.

**SharePoint.** The team's files live on the `teams/vo` site, library "Shared Documents", under `General/3 - Companies/<first letter>/<Company>/`, with one sub-folder per kind of material:

- "1 - Company Materials and Meetings" — non-publication material from the company
- "2 - Literature" — publications. When it fills up the team organises it into sub-folders, so look inside them too.
- "4 - Analysis and Models" — any kind of analysis

A real path, from the Amlysion record: `teams/vo/Shared Documents/General/3 - Companies/A/Amlysion/2 - Literature/`. The team's written rules drop the spaces ("2-Literature"); the real folders have them. **Always use the names as they exist in SharePoint**, found with `sharepoint_folder_search`, and never construct a path or a URL.

Connector tools as seen on 2026-10-09: `sharepoint_search`, `sharepoint_folder_search`, `read_resource` — search and read, no upload. Check what the connector actually exposes at preflight; the names may change.

**Journal abbreviations.** Use the short forms already in Tech Refs on other records first — `Nat Comm`, `Science`, and whatever else a read of the three records above shows — then the standard NLM/ISO abbreviation. Preprints use the server as the journal: `bioRxiv`, `medRxiv`, `arXiv`, `ChemRxiv`. Any abbreviation you are not sure of is shown at the gate, marked as such.

## Pipeline

0. **Preflight — verify the Airtable connector before doing anything else.** Confirm Airtable's tools are in your toolkit, then make one cheap call (`ping`, or `list_bases`). If the tools are missing or the call fails with an auth error, STOP — run no other step — and tell the user to enable or re-authenticate the Airtable connector (in a chat: + menu → Connectors → toggle it on; on first use of this plugin: accept the authentication prompt). Resume only after they confirm.

   Then the Microsoft 365 connector, which this skill needs for SharePoint. List the tools it exposes and say in one line what they allow: search and read only, or upload as well. **If no upload tool is present, never claim to save a file** — step 3 hands saving to the user. If the connector is missing altogether, say so and carry on: papers can still be resolved and titles filed, but every link then waits on the user pasting one from SharePoint, and the gate names each unlinked title and why.

1. **Collect the references.** From whatever the user gave you, or from the triage run that handed off: the triage note, the deck, the email thread, a pasted list — several at once is fine. Make one list, each entry as the source gives it (a title, a DOI, "Moore et al. 2026", "the Nature paper from the Chan lab"), with the source beside it. **Only publications the source actually names.** Do not add a paper because it would plainly belong, because the founder has others, or because a cited paper cites it. If the sources name none, say so and stop.

2. **Resolve each reference.** Open the paper's page — the DOI landing page, PubMed, bioRxiv, or the publisher's — and read from it the first author's last name, the year, the journal and the exact title. A search result's snippet is not enough; open the page. A PubMed or bioRxiv connector in the session is fine to use; otherwise fetch the page. When the source clearly means the published paper, file that; when it cites the preprint, file the preprint. Any paper you cannot identify with confidence goes on an **unresolved** list with whatever you did find, and you ask — never fill in an author, a year or a journal you did not read.

3. **Find the files in SharePoint.**
   1. Locate the company folder with `sharepoint_folder_search` on the company name under "3 - Companies". Show the path you found; several matches, ask which.
   2. Look in "2 - Literature", and in any sub-folders, for each paper — by the house filename first (below), then by title or first author.
   3. **File found:** take the link the connector returns for it. That link, and only that link, goes on the record.
   4. **File not found:** put the paper on the **to save** list with the exact filename, the destination folder as it exists, and the open-access PDF link when the page offers one (the publisher's PDF, PMC, or the preprint server). The user saves it. When they say it is saved, search again and take the link. No link goes on the record for a file you have not found.
   5. **User would rather not save it:** they choose between leaving the title unlinked and linking the DOI page as a temporary link, labelled as one on the record (format below).

   Never build a SharePoint URL from the path pattern, and never report a file as saved unless an upload tool actually succeeded.

4. **Notes under each paper.** If the author's note says something about a paper — why it matters, what it shows, a caveat — copy it verbatim as the note under that paper; layout only, as update-triage-notes does. If the author wrote nothing about it, you may offer **one to three short notes per paper, taken from the paper's abstract**, shown at the gate as drafts the way update-triage-notes offers a Secret Sauce draft: clearly labelled, kept apart from the block, every fact from the abstract. The user adopts them, edits them, or declines. A draft is filed only once the user has made it theirs; declined means the paper goes in with no notes. Never present a draft as though it came from the note.

5. **Proposal gate.** Find the record — search Name `fld3itRTH4JpDjbMz`, show the match with its current Pipeline Stage, confirm; never create one — then read the current Tech Refs and show three things:

   - **The block exactly as it will appear** — grouped, linked, notes underneath, the marker at the end.
   - **The current Tech Refs content beside it**, in full, so an earlier colleague's references are read next to the new ones rather than buried.
   - **The files still to save**, each with its folder and filename, and any temporary links.

   Tech Refs is a field like any other. When it already has content, the new block is **appended** underneath a `**Triage — <Author>, <YYYY-MM-DD>**` header — ask for the author and date if they are not obvious, defaulting to the person running the skill and today — and an empty field gets no header. A **replace** needs its own explicit yes, with the current content shown first. Any abbreviation you are unsure of and any paper still unresolved are named here. **Write nothing until the user confirms or edits the block.**

6. **Write and verify.** One `update_records_for_table` call setting Tech Refs. Then read the field back and check, link by link, that each one wraps only the words before the dash and points at a link the connector returned, or a labelled temporary one. Report what was written and link the record page. Then hand off what you could not do: the to-save list, and — if the source had figures — that they belong in Tech: Figures `fld6n2ULEkF52Vi3Q`, which the user attaches themselves.

## The reference block

**File and title format** — `[First author last name] [Year] [Journal, abbreviated] - [Article title]`, with a space, a hyphen and a space before the title, and the title as the page gives it:

- `Schultz 2020 Nat Comm - Age and life expectancy clocks based on machine learning analysis of mouse frailty`
- `Moore 2026 bioRxiv - Lacuna: Cryptic Binding Pocket Discovery via Conformational Ensemble Analysis`

The same string is the filename in SharePoint and the title on the record.

**The link covers only the words before the dash** — never the whole line, never the title:

```
[Schultz 2020 Nat Comm](<SharePoint link>) - Age and life expectancy clocks based on machine learning analysis of mouse frailty
```

**Grouped, one bold heading per group** — the lab, the founder's own work, foundational science, competing methods, or whatever the papers themselves suggest. One group is fine when there is one kind of paper; "Other" is not a group.

**Notes go below each paper, numbered, one point per line.** The shape, after Amlysion:

```
**Chan Lab**

[Harvey 2025 Science](<SharePoint link>) - <title as the page gives it>

1. <what the author's note says about it, verbatim>
2. <next point>

**Founder's own work**

[Moore 2026 bioRxiv](<SharePoint link>) - Lacuna: Cryptic Binding Pocket Discovery via Conformational Ensemble Analysis

1. <note>

_(copied by Claude <model name>, <YYYY-MM-DD>)_
```

A paper with no notes is the title line alone. Keep the order the user confirmed at the gate.

**Temporary link**, only when the user has chosen not to save the file: `[Moore 2026 bioRxiv](https://doi.org/…) - <title> *(DOI link until the file is in SharePoint)*`.

## Marking what Claude placed

One marker, `_(copied by Claude <model name>, <YYYY-MM-DD>)_`, as the last line of the block — once per block, never per paper. It means the plugin placed the block as the user approved it at the gate: titles read from the papers' pages, links the connector returned, the author's remarks word for word, and any abstract notes the user adopted or edited, which are theirs by then. Nothing in Tech Refs carries *drafted by*: a draft the user did not take is not filed, and one they did take is no longer a draft. Use the model actually running this session — do not hard-code a version string — and the date only, no clock time.

## Rules

- Never claim a file was saved to SharePoint unless an upload tool actually succeeded. Until then saving is the user's job, and the to-save list says so.
- Never construct a SharePoint link or path. Use only links returned by the connector; find folders with `sharepoint_folder_search` and use their names as they exist.
- The link covers only the text before the dash.
- No paper the sources do not name, and no bibliographic detail that was not read from the paper's own page. Unresolved means listed and asked about, not guessed.
- Tech Refs is appended to under the dated header, never overwritten, without its own yes. Nothing is written before the user confirms the block.
- Tech Refs `fldOK6kGR6kb5XymL` is the only field this skill writes. Figures go in Tech: Figures `fld6n2ULEkF52Vi3Q` by the user's hand; never write it.
- The author's remarks are copied verbatim, layout only. Abstract notes are drafts until the user adopts or edits them; declined means no notes.
- One record per run. Never create a startup record — new companies go in through the new-startup-form plugin first.
- Never skip step 0. If a connector drops mid-run, stop, say so, and re-run the preflight before continuing.
- When unsure — which company, which paper, which abbreviation, which folder — ask instead of guessing.
