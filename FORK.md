# Maintaining this fork

`main` follows [t4t5/omarchy-caldir-widget](https://github.com/t4t5/omarchy-caldir-widget)
and carries the RSVP retry and tooltip fixes while they are reviewed upstream.
`origin` points at this fork; `upstream` points at the original repository.
The two `fix/*` branches are independent upstream PR heads.

The current baseline is upstream commit `d31f3e8` (14 October 2026), including
release 1.2.3 and the current-time marker added after that release.

## Incorporating upstream changes

Use the development checkout with a clean working tree:

```sh
git switch main
git fetch upstream --tags
git merge --no-edit upstream/main
just test
git push origin main
```

Resolve merge conflicts and run the checks before pushing. Merge upstream
history into this fork; do not force-sync or reset the fork to upstream,
because that would discard fixes which have not landed there yet. Once a fix
lands upstream, merge it and verify the behavior before dropping local code.
`just test` needs the installed Omarchy/Quickshell environment. The lint helper
uses `OMARCHY_PATH` to resolve the installed shell's QML imports.

The installed plugin has this fork as `origin`, so apply a tested fork update
through Omarchy's normal updater:

```sh
omarchy plugin update org.ren.caldir
```

Keep the installed checkout clean; do development in the separate checkout.
This workflow does not install a scheduled job or automatically publish merges.
