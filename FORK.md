# Maintaining this fork

`main` follows [t4t5/omarchy-caldir-widget](https://github.com/t4t5/omarchy-caldir-widget)
and carries the RSVP retry and tooltip fixes while they are reviewed upstream.
`origin` points at this fork; `upstream` points at the original repository.
The two `fix/*` branches are independent upstream PR heads.

- [RSVP retry reconciliation, upstream PR #11](https://github.com/t4t5/omarchy-caldir-widget/pull/11)
- [Independent tooltip lookahead, upstream PR #12](https://github.com/t4t5/omarchy-caldir-widget/pull/12)

The current baseline is upstream commit `d31f3e8` (14 October 2026), including
release 1.2.3 and the current-time marker added after that release.

## Incorporating upstream changes

Use the development checkout with a clean working tree:

```sh
git switch main
git fetch upstream --tags
git merge --no-edit upstream/main
bash scripts/lint.sh
npm test
bash scripts/test-qml.sh
bash tests/open-event.test.sh
omarchy plugin validate .
git push origin main
```

Resolve merge conflicts and run the checks before pushing. Merge upstream
history into this fork; do not force-sync or reset the fork to upstream,
because that would discard fixes which have not landed there yet. Once a fix
lands upstream, merge it and verify the behavior before dropping local code.
These checks need the installed Omarchy/Quickshell environment. The lint helper
uses `OMARCHY_PATH` to resolve the installed shell's QML imports.

The installed plugin has this fork as `origin`, so apply a tested fork update
through Omarchy's normal updater:

```sh
omarchy plugin update org.ren.caldir
```

If the running UI retains the previous QML behavior after an update, run
`omarchy restart shell` to load the updated code in a fresh shell process.

Keep the installed checkout clean; do development in the separate checkout.
This workflow does not install a scheduled job or automatically publish merges.
