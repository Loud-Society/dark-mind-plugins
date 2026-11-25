# Format recipes – developing and publishing with the editor

Reference for the editing skill ([SKILL.md](../SKILL.md)). A **format recipe** is the base pattern of a format: concept,
briefing questions, material needs, sections, blocks and their order, technical frame, rules (`hard` = part of the
format, `recommended`) and the reviews of "done". Recipes are **data**, kept in the Dark Mind recipe catalog; the
Dark Mind web app only lists them (*Formats*). Using a recipe in a project: [BRAND.md](BRAND.md#workflow-with-a-recipe).

## Rules

1. **Develop together with the editor**, in this conversation – never invent a format on your own. The editor decides
   what the format is; you structure it, try it and show the result.
2. **Publish only when the editor explicitly asks for it** ("publish it", "put it in the catalog"). There is no approval
   step in the tool: the request of the editor (role Editor in Dark Mind) is the decision. Never publish to "save work".
3. **A recipe is data only.** Blocks, profiles, caption styles, checks and capabilities come from the brand pack's
   catalog (`darkmind-agent recipe validate` names unknown ones). If the format needs a new block or a new check, say
   so: that is a brand pack release or an extension (EXTENSIONS.md), never part of the recipe.
4. **Generalise.** Names, quotes, dates and content of one episode never belong into a recipe – they belong into the
   brief of a project.
5. **The document never passes through the chat** as the authoritative copy: you edit `recipe.draft.json` in the project
   folder; `darkmind-agent` uploads it byte-exact with a ticket.

## Where you work

In a **test project** – an ordinary cut project with existing material (`project_create("Recipe test: <format>")`, or a
duplicate of a real project with `project_duplicate` so the original stays untouched). `recipe.draft.json` lives in the
project folder and is pushed with it, so the work can continue on another machine. A draft without a test render is
allowed; a test render with existing material is usually the best way to show the editor what the recipe does.

## Two ways in

| | From a format concept | From a cut project |
|---|---|---|
| Start | The editor gives you a concept document (Word, PDF, Markdown … – read it with your client) | A finished or running cut session |
| First draft | Write `recipe.draft.json` from the concept (schema `schemas/recipe.schema.json`; a recipe from the catalog as example: `recipe_get` → `darkmind-agent recipe use <ticket> --draft`). Ask about the gaps: material, hard rules, duration, captions, deliverables | `darkmind-agent recipe derive --id <slug>` writes a skeleton from the project (profile, length, blocks, sections, order, hook, end); complete concept, briefing, material and rules with the editor |
| Focus of the conversation | "How do we turn the concept into a cut?" | "What of this is the format, what was only this episode?" |

A new version of an existing recipe: `recipe_get(slug)` → `darkmind-agent recipe use <ticket> --draft` → change it with
the editor → publish with `basedOnVersion` = that version.

## The loop

1. `darkmind-agent recipe validate` – schema, own references and every name against the brand pack; it also counts the
   `TODO:` texts that are left.
2. `darkmind-agent recipe try` – applies the draft to the test project (`recipe.lock.json` with `source: "draft"`,
   `project.json` profile, duration frame, loudness step).
3. Build the cut as with every recipe ([BRAND.md](BRAND.md#workflow-with-a-recipe)): material coverage in
   `material.json`, blocks, `darkmind-agent recipe check`, proxy.
4. Show the editor the proxy and the recipe (`darkmind-agent recipe show recipe.draft.json`, in Markdown); write down the
   changes the editor wants, change the draft, back to 1. A second test project with other material shows whether the
   recipe is general enough.

## Publishing (only on the editor's request)

1. `project_push_begin` … push the test project if the editor wants it kept (it is then named in the recipe's
   `provenance.testProjects`, optional).
2. `recipe_publish_begin(slug, basedOnVersion?, changeNote?)` – a new recipe without `basedOnVersion`; a new version with
   the latest version and a change note (what changed and why). Errors: `recipe-exists` (choose another slug or publish
   a version), `recipe-version-conflict` (someone published meanwhile: fetch the latest, merge, try again), `forbidden`
   (the editor needs the role Editor in Dark Mind).
3. `darkmind-agent recipe submit <ticket>` – uploads `recipe.draft.json` (no `TODO:` left); Dark Mind validates it again
   and answers with the version. A test project that tried exactly this draft now uses the published version.
4. Tell the editor the slug and version; it appears in the Dark Mind *Formats* list.

Status changes (`recipe_set_status`): `deprecated` (not offered for new projects), `withdrawn` (no new use; projects keep
their copy) or `published` again – only when the editor asks, always with a reason. Versions are never deleted.

## Errors

| Message | Action |
|---------|--------|
| `recipe-unknown-block`, `recipe-unknown-check`, `recipe-unknown-capability` | the brand pack has no such name – choose an existing one or tell the editor that it needs a pack release / extension |
| `recipe-brand-incompatible` | `brand.versions` does not include the pack of Dark Mind: use the range of the catalog's recipes |
| `recipe-todo` | complete the `TODO:` texts with the editor |
| `recipe-unchanged` | the draft equals the version it is based on – nothing to publish |
| `recipe-slug-mismatch` | `meta.id` of the draft and the slug of `recipe_publish_begin` differ |
