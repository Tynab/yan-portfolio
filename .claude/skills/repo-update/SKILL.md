---
name: repo-update
description: Use for repository instruction-manifest workflows. repo update verifies or maintains CLAUDE.md/agent instructions, checks repo evidence, and responds to the user in Vietnamese.
effort: xhigh
---

# Repo Manifest Update

## Global Output Contract

- Write all final responses to the user in Vietnamese.
- Keep the skill instructions and internal procedure in English.
- Do not expose hidden reasoning. Show only concise findings, evidence, decisions, and next actions.
- Do not modify files when the user says "do not edit", "read only", "chưa sửa file", "chưa update", or equivalent.
- Before editing anything, inspect `git status --short` and avoid overwriting user changes.
- Never run destructive commands such as `git reset --hard`, `git clean`, deleting files, migration rollback, force push, or mass formatting unless the user explicitly approves that exact action.
- Do not invent build/test/run commands. Only claim commands after verifying them from repository files such as README, package manifests, solution/project files, Makefile, justfile, Docker/Compose files, CI config, scripts, or existing documentation.
- If a command cannot be verified, say that it needs verification instead of presenting it as fact.
- Separate verified facts from assumptions.

## Purpose

Use this skill when the user explicitly agrees to update the repository instruction manifest after an audit/proposal, for example after saying "Đồng ý", "update it", "cập nhật", or equivalent.

## Target Selection

1. Prefer the manifest explicitly named by the user.
2. If none is named:
   - For Claude Code, update `CLAUDE.md` or `.claude/CLAUDE.md`.
3. If the target is ambiguous, use the manifest audited most recently in the conversation. If still ambiguous, inspect the repo and choose the manifest that currently exists and controls the tool.

## Update Rules

- Re-read the current manifest before editing.
- Apply only the approved proposal or the smallest necessary correction.
- Keep the file short and durable.
- Focus on:
  - repository architecture
  - build/test/run commands
  - coding conventions
  - rules for code changes
  - things the agent must not change without approval
- Remove duplicated, stale, speculative, or overly broad instructions.
- Do not add historical changelog content.
- Do not add commands that have not been verified.
- Preserve project-specific constraints that are still true.
- After editing, show the diff summary.

## Vietnamese Response Format

Return the final answer in Vietnamese with this structure:

```markdown
## Đã cập nhật

### File đã sửa

- `<path>`

### Nội dung thay đổi chính

- ...

### Kiểm tra sau cập nhật

- Git diff: đã xem
- Build/test: <đã chạy command nào hoặc lý do chưa chạy>

### Lưu ý

- ...
```
