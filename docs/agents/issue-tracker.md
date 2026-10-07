# Issue tracker: GitHub (central tracker on For-Hives/ForVoyez)

Issues and specs for all three ForVoyez repos (ForVoyez, ForVoyez-Doc, ForVoyez-Wordpress-plugin) live as GitHub issues on **For-Hives/ForVoyez**. Use the `gh` CLI for all operations and pass `-R For-Hives/ForVoyez` to every `gh issue` command: from a Doc or plugin clone, `gh` would otherwise target that clone's own repo.

## Target repo

A ticket about ForVoyez-Doc carries the label `repo:doc`; a ticket about ForVoyez-Wordpress-plugin carries `repo:wp-plugin`. A ticket with neither label is about the app (ForVoyez). Create a label on first use: `gh label create repo:doc -R For-Hives/ForVoyez`. When working in the Doc or plugin repo, filter lists with `--label repo:doc` / `--label repo:wp-plugin`.

## Conventions

- **Create an issue**: `gh issue create -R For-Hives/ForVoyez --title "..." --body "..."`, plus `--label repo:doc` or `--label repo:wp-plugin` when it targets those repos. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> -R For-Hives/ForVoyez --comments`, filtering comments by `jq` and also fetching labels.
- **List issues**: `gh issue list -R For-Hives/ForVoyez --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> -R For-Hives/ForVoyez --body "..."`
- **Apply / remove labels**: `gh issue edit <number> -R For-Hives/ForVoyez --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> -R For-Hives/ForVoyez --comment "..."`

## Pull requests as a triage surface

Pull requests stay in the repo whose code they change; only issues are centralised.

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

When set to `yes`, PRs run through the same labels and states as issues, using the `gh pr` equivalents in the PR's own repo:

- **Read a PR**: `gh pr view <number> --comments` and `gh pr diff <number>` for the diff.
- **List external PRs for triage**: `gh pr list --state open --json number,title,body,labels,author,authorAssociation,comments` then keep only `authorAssociation` of `CONTRIBUTOR`, `FIRST_TIME_CONTRIBUTOR`, or `NONE` (drop `OWNER`/`MEMBER`/`COLLABORATOR`).
- **Comment / label / close**: `gh pr comment`, `gh pr edit --add-label`/`--remove-label`, `gh pr close`.

A bare `#42` is ambiguous: it may be an issue or PR on For-Hives/ForVoyez, or a PR in the current repo. Resolve with `gh issue view 42 -R For-Hives/ForVoyez` first, then fall back to `gh pr view 42`.

## When a skill says "publish to the issue tracker"

Create a GitHub issue on For-Hives/ForVoyez, with the `repo:*` label when it targets the Doc or the plugin.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> -R For-Hives/ForVoyez --comments`.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as tickets, all on For-Hives/ForVoyez.

- **Map**: a single issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far / Fog body. `gh issue create -R For-Hives/ForVoyez --label wayfinder:map`.
- **Child ticket**: an issue linked to the map as a GitHub sub-issue (`gh api` on the sub-issues endpoint). Where sub-issues aren't enabled, add the child to a task list in the map body and put `Part of #<map>` at the top of the child body. Labels: `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`), plus `repo:doc` / `repo:wp-plugin` when relevant. Once claimed, the ticket is assigned to the driving dev.
- **Blocking**: GitHub's **native issue dependencies**, the canonical, UI-visible representation. Add an edge with `gh api --method POST repos/For-Hives/ForVoyez/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`, where `<blocker-db-id>` is the blocker's numeric **database id** (`gh api repos/For-Hives/ForVoyez/issues/<n> --jq .id`, _not_ the `#number` or `node_id`). GitHub reports `issue_dependencies_summary.blocked_by` (open blockers only, the live gate). Where dependencies aren't available, fall back to a `Blocked by: #<n>, #<n>` line at the top of the child body. A ticket is unblocked when every blocker is closed.
- **Frontier query**: list the map's open children (`gh issue list -R For-Hives/ForVoyez --state open`, scoped to the map's sub-issues / task list), drop any with an open blocker (`issue_dependencies_summary.blocked_by > 0`, or an open issue in the `Blocked by` line) or an assignee; first in map order wins.
- **Claim**: `gh issue edit <n> -R For-Hives/ForVoyez --add-assignee @me`, the session's first write.
- **Resolve**: `gh issue comment <n> -R For-Hives/ForVoyez --body "<answer>"`, then `gh issue close <n> -R For-Hives/ForVoyez`, then append a context pointer (gist + link) to the map's Decisions-so-far.
