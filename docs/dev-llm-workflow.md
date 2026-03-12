# LLM Development Workflow

This document describes how AI agents should work with the repository.

---

# General Principle

Agents should minimise repository exploration.

Prefer targeted changes.

---

# Implementation Strategy

Before implementing large changes:

1. briefly explain the plan
2. list the files to modify
3. then implement the changes

---

# File Modification Rules

Only modify files that are necessary.

Avoid touching unrelated files.

---

# Refactoring

Large refactors should be broken into smaller steps.

---

# Documentation

Non-trivial logic must include comments explaining why it exists.

Prefer explaining reasoning rather than only describing behaviour.

---

# Dependencies

Do not introduce new dependencies unless explicitly requested.

---

# Git

Do not automatically push changes.

After completing a task, suggest a commit message.