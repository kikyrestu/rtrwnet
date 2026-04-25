# AI_LEARNINGS.md — Codebase Intelligence

> What I've learned about this specific project. Gets smarter every session.
> This is what separates me from a fresh AI that knows nothing about your code.

---

## 🏗️ Architecture Learnings

- Architecture uses Next.js for Frontend and Laravel strictly for JSON API (`routes/api.php`).
- The system runs heavy automations via Laravel Schedule/Cron (`app/Console/Commands/`), acting as the CRM database translating to actual RouterOS configurations.
- Authentication is token-based using Laravel Sanctum (`Auth::attempt` returning JSON user objects).

---

## ⚠️ Gotchas & Traps

- **Synchronous Mikrotik API calls in CRUD:** Creating/Updating a customer in `ApiCrudController` synchronously calls `$this->syncMikrotikSecret()`. If the Router is offline or unreachable, the database transaction will timeout/fail and return 500 error, despite local state creation. Queue/Jobs needed.
- **RouterOS API Method Signature Mismatch:** `AutoIsolir.php` calls `$api->connect($router->host, $router->api_username, $router->api_password, $router->api_port)` (4 params), but `RouterosAPI::connect()` only accepts 3 params `($ip, $login, $password)`. The port must be explicitly set via property `$api->port = $router->api_port;` prior to connecting.
- **God Controller Anti-pattern:** `ApiCrudController.php` handles everything from Customers, Invoices, to Routers and Packages. This violates the "Fat models, thin controllers & services" convention set out in the architecture pattern map.

---

## 🎨 UI Patterns Discovered

[From screenshot analysis and code reading]

Example:
- "Tables all use `resources/views/components/data-table.blade.php`"
- "Modal dialogs handled via Alpine.js x-show, NOT Livewire emit"
- "Error states use toast notifications via `dispatchBrowserEvent('notify')`"

---

## 🔗 Hidden Dependencies

[Things that break when you touch something else]

Example:
- "Changing Order status → triggers OrderObserver → sends WhatsApp via Fonnte"
- "User role change → clears permission cache via `app/Observers/UserObserver.php`"

---

## 💡 Codebase Quirks

[Project-specific conventions the original developer used]

Example:
- "All service classes return `['success' => bool, 'data' => ..., 'message' => ...]`"
- "Frontend uses `wire:model.lazy` everywhere — don't use `wire:model` (causes lag)"

---

## 🚫 Things We Tried That Didn't Work

[Don't repeat these mistakes]

Example:
- "Tried using Laravel Scout for search → too slow on PostgreSQL, switched to raw query"
- "Livewire file upload broke on VPS → fixed by increasing PHP upload_max_filesize"

---

[AI adds entries here after every audit or significant discovery]
