# AI_CONTEXT.md — Project State

> ⚠️ This file is maintained by AI. Updated after every significant session.
> Last updated: [AI will fill this]

---

## Project Overview

- **Project Name**: RT-RW Net PAKAAM Management System
- **Type**: CRM, Billing, & Network Automation System
- **Status**: Development (Phase 5: GIS Mapping)
- **Stack**: Next.js (App Router, Tailwind, Leaflet) + Laravel (API) + MySQL + RouterOS API

---

## Architecture Map

```text
billing/ (Laravel API)
├── app/Http/Controllers/Api/ → API Endpoints (currently God Object in ApiCrudController)
├── app/Models/                   → Eloquent Models (Customer, Invoice, Router, etc)
├── app/Console/Commands/         → Automation Brain (AutoIsolir, GenerateInvoices)
├── app/Services/                 → External Integration (RouterosAPI, WhatsAppService)
frontend/ (Next.js)
├── src/app/(dashboard)/          → Auth-protected App Router 
│   ├── customers/                → Customer & GIS Map Views
│   ├── billing/                  → Invoice & Payment Management
│   ├── network/                  → Mikrotik, OLT, ODP Inventory
```

---

## Database Schema Overview

```text
users               → admin, staff, teknisi RBAC
packages            → bandwidth configs, price, mikrotik profile
routers             → mikrotik hosts, api credentials
distribution_points → OLT/ODP items, coords, port constraints
customers           → billing cycle, coords, PPPoE credentials, relations to package & router
invoices            → monthly bills, amounts, status (paid/unpaid)
payments            → manual payment proofs & verifications
```

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `ApiCrudController.php` | The "God Class" currently handling all CRUD & Sync logic. |
| `RouterosAPI.php` | Core Mikrotik API communication class. |
| `AutoIsolir.php` | Cron job command to automatically disable unpaid users. |
| `frontend/src/app/(dashboard)` | Core frontend Next.js modules directory. |

---

## Current State

- **What's working**: [AI will update]
- **What's broken**: [AI will update]
- **What's in progress**: [AI will update]

---

## Environment Notes

- **Local**: [config notes]
- **VPS**: [deployment notes]
- **DB**: PostgreSQL — [connection notes]

---

## External Services / APIs

| Service | Purpose | Status |
|---------|---------|--------|
| [AI will document] | | |
