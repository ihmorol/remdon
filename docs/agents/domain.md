# Domain Docs

Single-context repo. One `CONTEXT.md` at the repo root, ADRs in `docs/adr/`.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root — domain glossary and system overview
- **`docs/adr/`** — architectural decisions; read ADRs relevant to the area you are working in

## File structure

```
/
├── CONTEXT.md
├── docs/adr/
│   └── *.md
├── client/
└── server/
```

## Use the glossary's vocabulary

When naming domain concepts in issue titles, test names, or refactor proposals, use terms as defined in `CONTEXT.md`. Don't drift to synonyms.
