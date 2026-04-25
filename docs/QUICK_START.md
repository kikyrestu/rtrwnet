# 🤖 Self-Evolving AI System — Quick Start

## Setup (1x aja)

```
project-root/
├── .github/
│   └── copilot-instructions.md   ← taruh di sini
├── AI_CONTEXT.md
├── AI_DECISIONS.md
├── AI_PROGRESS.md
├── AI_LEARNINGS.md
└── AI_PATTERNS.md
```

Semua file di atas taruh di **root project** lu.

---

## First Time — Jalanin Audit Pertama

Buka Copilot Chat di VSCode, switch ke **Agent mode**, paste ini:

```
Read all context files first (AI_CONTEXT.md, AI_DECISIONS.md, 
AI_PROGRESS.md, AI_LEARNINGS.md, AI_PATTERNS.md).

Then do a full audit of this entire codebase:
- Map the architecture
- Document all models and their relationships  
- Find bugs, security issues, performance problems
- Identify UI patterns from the Blade/Livewire files

After the audit, update ALL context files with your findings.
```

Tunggu dia selesai → approve update context files → selesai.

---

## Tiap Sesi Kerja

**Mulai sesi:**
```
Read all AI_ context files, then continue where we left off.
What's the current status and what should we work on next?
```

**Minta audit UI (paste screenshot dulu):**
```
[Ctrl+V screenshot]
Audit my current UI vs the code. Find inconsistencies and suggest fixes.
Update AI_LEARNINGS.md with UI patterns you discover.
```

**Minta fixing:**
```
Fix [masalah]. Think step by step. After fixing, update AI_PROGRESS.md.
```

**Akhir sesi:**
```
Summarize what we did today and update all relevant context files.
```

---

## Tips

- **Agent mode** untuk task besar (audit, multi-file changes)
- **Chat mode** untuk tanya-tanya cepat
- Rutin update context files → makin pinter dari sesi ke sesi
- Kalau AI nanya "update context files?" → jawab ya selalu

---

## Hasilnya

Session 1: AI tau 30% project lu
Session 3: AI tau 70% project lu  
Session 5+: AI tau project lu lebih baik dari developer manapun yang baru join
