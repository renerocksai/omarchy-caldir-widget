import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import * as Model from "../Model.mjs"

const now = new Date("2026-10-28T10:00:00Z")
function meeting(minutes, extra = {}) {
  return {
    uid: "meeting-" + minutes,
    title: "Meeting in " + minutes + " minutes",
    start: new Date(now.getTime() + minutes * Model.MINUTE_MS).toISOString(),
    end: new Date(now.getTime() + (minutes + 30) * Model.MINUTE_MS).toISOString(),
    rsvp: "accepted",
    url: "https://meet.google.com/abc-defg-hij",
    ...extra
  }
}
function select(entries, options) {
  return Model.meetingSelections(Model.parseAgenda(JSON.stringify(entries)), now, options)
}

test("the default tooltip previews a meeting four hours away while the bar stays quiet", () => {
  const result = select([meeting(240)])
  assert.equal(result.bar, null)
  assert.equal(result.tooltip.title, "Meeting in 240 minutes")
})

test("tooltip and bar lookahead overrides remain independent", () => {
  const entries = [meeting(240)]
  const preview = select(entries, { lookaheadMinutes: 30, tooltipLookaheadMinutes: 480 })
  assert.equal(preview.bar, null)
  assert.equal(preview.tooltip.title, "Meeting in 240 minutes")
  const shorterPreview = select(entries, { lookaheadMinutes: 30, tooltipLookaheadMinutes: 180 })
  assert.equal(shorterPreview.bar, null)
  assert.equal(shorterPreview.tooltip, null)
  const longerBar = select(entries, { lookaheadMinutes: 480, tooltipLookaheadMinutes: 30 })
  assert.equal(longerBar.bar.title, "Meeting in 240 minutes")
  assert.equal(longerBar.tooltip, null)
})

test("the bar still starts at thirty minutes and the tooltip has its own boundary", () => {
  assert.equal(select([meeting(31)]).bar, null)
  assert.equal(select([meeting(30)]).bar.title, "Meeting in 30 minutes")
  assert.equal(select([meeting(480)]).tooltip.title, "Meeting in 480 minutes")
  assert.equal(select([meeting(481)]).tooltip, null)
})

test("both selections preserve declined, pending, tentative and all-day filters", () => {
  const result = select([
    meeting(5, { rsvp: "declined" }),
    meeting(10, { rsvp: "needs_action" }),
    meeting(15, { rsvp: "tentative" }),
    meeting(20, { all_day: true }),
    meeting(25)
  ])
  assert.equal(result.bar.title, "Meeting in 25 minutes")
  assert.equal(result.tooltip.title, "Meeting in 25 minutes")
  assert.equal(select([meeting(240, { url: null })]).tooltip, null)
  assert.equal(select([meeting(240, { url: null })], { highlightEvents: "all" }).tooltip.title, "Meeting in 240 minutes")
})

test("distant meetings count down rather than repeating their start time", () => {
  const status = minutes => Model.relativeStatus(select([meeting(minutes)]).tooltip, now)
  assert.equal(status(18), "starts in 18 min")
  assert.equal(status(60), "starts in 1h")
  assert.equal(status(172), "starts in 2h 52m")
})

test("tooltip settings normalize hand-edited values and match the manifest", () => {
  const spec = Model.TOOLTIP_LOOKAHEAD_MINUTES
  for (const value of [undefined, null, "", " ", "invalid", Infinity])
    assert.equal(Model.normalizeTooltipLookaheadMinutes(value), spec.defaultValue)
  assert.equal(Model.normalizeTooltipLookaheadMinutes(0), spec.min)
  assert.equal(Model.normalizeTooltipLookaheadMinutes(100000), spec.max)
  assert.equal(Model.normalizeTooltipLookaheadMinutes("120"), 120)
  assert.equal(Model.normalizeTooltipLookaheadMinutes(90.8), 90)
  const manifest = JSON.parse(readFileSync(new URL("../manifest.json", import.meta.url), "utf8"))
  const entry = manifest.barWidget.schema.find(item => item.key === spec.key)
  assert.deepEqual([entry.min, entry.max, entry.defaultValue], [spec.min, spec.max, spec.defaultValue])
  assert.equal(manifest.barWidget.defaults[spec.key], spec.defaultValue)
})
