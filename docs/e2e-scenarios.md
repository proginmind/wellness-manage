# E2E Test Scenarios

Manual end-to-end checks for visit booking and related UI. Run against **local dev** with seeded data.

## Prerequisites

```bash
pnpm supabase:start          # if not already running
pnpm db:seed                 # demo org, staff, availability, services
pnpm dev                     # http://localhost:3000
```

**Login:** `owner@example.com` / `password123` (or values from `.env.local`)

**Notifications:** requires `RESEND_API_KEY` in Supabase function secrets (or `supabase/functions/.env` locally). After template changes, redeploy: `pnpx supabase functions deploy notify`.

**Seed reference** (`scripts/seed-db.ts`):

- Services: Swedish Massage (owner + Alice qualified), Vinyasa Yoga (Bob qualified)
- Availability: owner Mon–Fri 09:00–17:00; Alice Tue–Sat 10:00–18:00; Bob Mon/Wed/Fri 08:00–16:00

---

## Scenario index

| ID    | Area                                      | Priority |
| ----- | ----------------------------------------- | -------- |
| BK-01 | New visit — guided booking                | High     |
| BK-02 | New visit — manual booking                | High     |
| BK-03 | Calendar availability highlights (guided) | High     |
| BK-04 | Calendar plain mode (manual)              | High     |
| BK-05 | Staff tabs — qualified vs all             | High     |
| BK-06 | Today — past-slot calendar classification | High     |
| BK-07 | Past datetime validation                  | Medium   |
| BK-08 | Edit visit — dual mode                    | Medium   |
| BK-09 | Full create → confirm → save              | High     |
| NT-01 | Cancel visit — email notifications        | High     |
| NT-02 | Reschedule visit — email notifications    | High     |
| NT-03 | Edit notes only — no email                | Medium   |

---

## BK-01 — New visit: guided booking

**Route:** `/visits/new`

1. Select client (e.g. Ava Martinez) → **Next**
2. Select service (e.g. Swedish Massage)
3. Ensure **From availability** is active
4. Wait for calendar to finish loading (bookable dates become clickable)
5. Select a bookable date (e.g. next Saturday)
6. Verify **Time & staff** section appears
7. Verify tabs: **Qualified for service** | **All staff available**
8. Select a time slot and staff member
9. **Next** → confirm step shows client, service, date, time, staff

**Expected:**

- Only bookable dates are enabled (past dates disabled)
- Qualified dates show green fill; unqualified-only dates show green border only
- Qualified tab lists staff assigned to the service for that slot
- All-staff tab may show service badges on non-assigned staff

---

## BK-02 — New visit: manual booking

**Route:** `/visits/new` (step 2)

1. Select service
2. Switch to **Manual entry**
3. Verify plain calendar (no green availability highlights)
4. Select any future date (more dates enabled than guided mode)
5. Enter time via time input
6. Verify **Staff member** section with qualified/all tabs (not a dropdown)
7. Select staff → **Next** → confirm step populated

**Expected:**

- Selected date highlighted with black/foreground border only
- Time input visible; past times rejected for today
- Staff list matches guided row styling (avatar, name, Details link)
- All-staff tab shows service badges on assigned services

---

## BK-03 — Calendar availability highlights (guided)

**Route:** `/visits/new` → Swedish Massage → **From availability**

1. Wait for `/api/availability/dates` to load
2. Inspect June calendar

**Expected:**

- Dates in `qualifiedDates` → green fill
- Dates in `unqualifiedOnlyDates` only → green border, no fill
- Dates in neither list → disabled
- Selected date uses appropriate selected styling

**API check (optional):**

```
GET /api/availability/dates?eventTypeId={id}&month=6&year=2026
→ { qualifiedDates: [...], unqualifiedOnlyDates: [...] }
```

---

## BK-04 — Calendar plain mode (manual)

**Route:** `/visits/new` → any service → **Manual entry**

1. Compare enabled dates to guided mode for same month

**Expected:**

- All dates from today onward are selectable (not limited to API bookable set)
- No green qualified/unqualified styling on unselected dates
- Only selected date has black border highlight

---

## BK-05 — Staff tabs: qualified vs all

**Contexts:** guided time picker **or** manual staff picker

1. Default tab: **Qualified for service**
2. Switch to **All staff available**
3. If a staff member was selected and not in the new tab, selection clears

**Expected:**

- Qualified tab: only staff assigned to the selected service
- All tab: entire org staff; assigned services shown as badges
- Tab styling matches `SegmentedControl` used elsewhere

**Swedish Massage / Sat 2026-06-27:** qualified slots show Alice Johnson only.

**Vinyasa Yoga:** Bob Martinez qualified; other staff appear on all tab with yoga/massage badges.

---

## BK-06 — Today: past-slot calendar classification

**When:** current time is afternoon/evening on a weekday with morning-only qualified availability remaining in the past.

1. Select service with qualified staff available earlier today
2. Guided calendar: inspect **today**
3. Compare with `/api/availability/dates` for today

**Expected:**

- If no **future** qualified slots today → today is **not** green-filled
- If unqualified staff still have future slots today → green border only
- If nobody has future slots today → today disabled

**Note:** Slot API may still return past times; client filters them in the time picker. Date classification must use the same future-only rule.

---

## BK-07 — Past datetime validation

**Manual mode:**

1. Select today
2. Enter a time earlier than now → inline error: "Time cannot be in the past"
3. Change date to future → past-time error clears

**Submit:**

1. Attempt **Next** with past datetime → blocked, returned to step 1 with error

**Edit visit:** unchanged past datetime allowed for notes-only edits.

---

## BK-08 — Edit visit: dual mode

**Route:** `/visits/[id]/edit`

1. Open existing visit
2. Toggle **From availability** / **Manual entry**
3. Verify same calendar and staff UI as create flow
4. Save notes-only edit on past visit without changing datetime

**Expected:** Same components and validation as create; exclude-visit-id respected in slot queries.

---

## BK-09 — Full create → save

1. Complete BK-01 or BK-02 through confirm step
2. Submit appointment
3. Verify redirect to visit detail or list; new visit appears with correct staff, date, time

**Expected:** API accepts booking; no overlap errors for free slot.

---

## Quick smoke checklist

- [ ] Login works
- [ ] `/visits/new` step 1 → 2 → 3
- [ ] Guided calendar loads after service select
- [ ] Manual entry shows time input + staff tabs
- [ ] Mode toggle persists styling (`SegmentedControl`)
- [ ] `pnpm type-check` && `pnpm build` pass

---

## Last run

| Date       | Environment                         | Runner                | Result                       |
| ---------- | ----------------------------------- | --------------------- | ---------------------------- |
| 2026-06-26 | local (`localhost:3000`, seeded DB) | Agent (browser + API) | **Partial pass** — see notes |

### 2026-06-26 notes

**Passed:**

- BK-01: Client → service → guided calendar loads; June 27 selectable; time slots 10:00–17:00 with Alice Johnson; qualified/all tabs visible
- BK-02: Manual entry → time input + staff tabs; date 29 Jun + 10:00 + Alice → confirm step shows service, staff, date
- BK-04: Manual mode enabled 9 future days vs 4 in guided (plain calendar)
- BK-05: Profiles API returns Alice (massage), Bob (yoga), John (massage); slots API qualified flag correct
- API: Swedish Massage June dates returned; Yoga has `unqualifiedOnlyDates` for Tue/Thu/Sat pattern

**Not fully verified in UI:**

- BK-03: Green fill vs border (visual — needs screenshot/manual inspection)
- BK-06: Today past-slot styling (today still in `qualifiedDates` at 13:52 UTC with future slots 16:00, 17:00 — correct for current time)
- BK-07, BK-08, BK-09: Not exercised end-to-end in this run

**Automation:** No Playwright/Cypress suite yet; runs are manual via browser or CDP against dev server.

---

## NT-01 — Cancel visit: email notifications

**Requires:** `RESEND_API_KEY` configured; notify function deployed/served locally.

1. Create or pick a **pending** visit with client email and assigned staff
2. Open visit detail → **Archive** (or `/visits/[id]/archive`) → confirm cancel
3. Check client inbox: subject **Your appointment has been cancelled**
4. Check staff inbox: subject **Appointment cancelled**
5. Query `notification_logs` (Supabase) for `visit_cancelled_client` and `visit_cancelled_staff`

**Expected:**

- Visit status → `cancelled`
- Both emails sent (if staff assigned); no ICS attachment on cancel emails
- API returns success even if email fails (check logs for failures)

---

## NT-02 — Reschedule visit: email notifications

1. Open a **pending** visit → **Edit**
2. Change date and/or time (keep client + staff)
3. Save
4. Client inbox: **Your appointment has been rescheduled** with previous + new times; `.ics` attached
5. Staff inbox: **Appointment rescheduled** with updated calendar invite
6. `notification_logs` rows for `visit_rescheduled_*`

**Expected:**

- Previous date/time shown in email body
- New ICS reflects updated start time

---

## NT-03 — Edit notes only: no email

1. Edit a pending visit; change **notes** only (same date, time, staff, service)
2. Save

**Expected:**

- Visit updated
- No new rows in `notification_logs` for reschedule/cancel templates
