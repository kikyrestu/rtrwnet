# AI_PROGRESS.md — Progress Tracker

> Living document. AI updates this after every session.

---

## ✅ Completed

- [x] Initial project audit
- [x] Context files setup
- [x] Integrate Map (GIS) and Location Picker into Next.js Frontend Customer modules.
- [x] Create backend Mikrotik Queue logic.

---

## 🔄 In Progress

| Task | Started | Notes |
|------|---------|-------|
| [AI will track] | | |

---

## 📋 Backlog

| Task | Priority | Notes |
|------|----------|-------|
| [AI will add as discovered] | | |

---

## 🐛 Known Bugs

| Bug | File | Severity | Fixed? |
|-----|------|----------|--------|
| Method signature mismatch for connect() (passing 4 params instead of 3 API login) | `AutoIsolir.php` | Medium | Yes |
| Sync Mikrotik is synchronous, risks 500 errors if offline | `ApiCrudController.php` | High | Yes (Job Queues added) |
| The "God Object" anti-pattern grouping all modules into a single monolithic API file. | `ApiCrudController.php` | High | Partially (Services & Jobs separated) |

---

## 🔒 Security Issues Found

| Issue | File | Severity | Fixed? |
|-------|------|----------|--------|
| [AI will document] | | | |

---

## 📊 Session Log

### 2026-04-17 — Session 1 & 2
- **Did:** Setup self-evolving AI system, ran full project audit (Next.js + Laravel REST API).
- **Found:** God Controller anti-pattern, Sync dependency trap, RouterosAPI `connect()` parameter mismatch.
- **Next:** Decide whether to refactor `ApiCrudController`, fix Mikrotik connectivity bugs, or proceed to Phase 5 (GIS Mapping) in Next.js.

