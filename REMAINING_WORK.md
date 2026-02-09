# Remaining Work - Quick Implementation Guide

## Files Still Needing Component Extraction

### 1. Match View Page (`src/app/match/[id]/view/page.jsx`)

**Current Status**: Has many inline styles in table elements

**Quick Fix**:

```jsx
// Create: src/components/Match/MatchView.jsx
"use client";

import { use } from "react";
import { useMatch } from "@/hooks/useMatch";
import { ROUTES } from "@/constants/routes";
import { useRouter } from "next/navigation";
import styles from "./MatchView.module.css";

export default function MatchView({ matchId }) {
  const router = useRouter();
  const { match, isLoading } = useMatch(matchId);

  // ... move all logic from page.jsx here
  // Replace all inline styles with className={styles.xxx}
}
```

**Update page.jsx**:

```jsx
"use client";

import { use } from "react";
import MatchView from "@/components/Match/MatchView";

export default function MatchViewPage({ params }) {
  const { id } = use(params);
  return <MatchView matchId={id} />;
}
```

**CSS Module Updates** (`src/app/match/[id]/view/MatchView.module.css`):

```css
/* Add classes for table alignment */
.centerAlign {
  text-align: center;
}

.table th.centerAlign,
.table td.centerAlign {
  text-align: center !important;
}
```

---

### 2. TossDecision Component (`src/components/TossDecision.jsx`)

**Current Status**: Has inline styles

**Quick Fix**:
Create `TossDecision.module.css` and replace:

- `style={{ display: "flex", gap: "1rem", ... }}` → `className={styles.container}`
- `style={{ padding: "1.2rem 2.5rem", ... }}` → `className={styles.button}`

---

### 3. Admin Setup Page (`src/app/admin/setup/page.jsx`)

**Current Status**: Extensive inline styles

**Quick Fix**:

```jsx
// Create: src/components/Admin/AdminSetup.jsx
"use client";

import { useState } from "react";
import styles from "./AdminSetup.module.css";

export default function AdminSetup() {
  // Move all logic from page.jsx
  // Replace inline styles with CSS module classes
}
```

**Update page.jsx**:

```jsx
import AdminSetup from "@/components/Admin/AdminSetup";

export default function AdminSetupPage() {
  return <AdminSetup />;
}
```

---

### 4. Layout (`src/app/layout.jsx`)

**Current Status**: Small inline styles in header and main

**Quick Fix**:
Create `layout.module.css`:

```css
.header {
  padding: 16px;
  border-bottom: 1px solid #ddd;
}

.main {
  max-width: 900px;
  margin: 0 auto;
}
```

Update layout.jsx:

```jsx
import styles from "./layout.module.css";

// Replace:
// <header style={{ ... }}> → <header className={styles.header}>
// <main style={{ ... }}> → <main className={styles.main}>
```

---

## Quick Command to Find Remaining Inline Styles

```bash
grep -r "style={" src/app/ src/components/ | grep -v node_modules | grep -v ".module.css"
```

---

## Testing Checklist

After implementing remaining components:

### ✅ Functionality Tests

- [ ] User can sign up/login
- [ ] Dashboard loads with profile and match history
- [ ] New match creation works
- [ ] Toss ceremony completes
- [ ] Match play works (Play Ball button)
- [ ] Pause/Resume works
- [ ] Second innings starts correctly
- [ ] Match completes and shows result
- [ ] Match view shows completed match details

### ✅ Code Quality Tests

- [ ] No inline styles (run grep command above)
- [ ] All API routes use `requireAuth()` and `apiResponse`
- [ ] All data fetching uses SWR hooks
- [ ] No manual polling or setInterval
- [ ] Pages only render components
- [ ] Components are in `src/components/`
- [ ] All styles are in `.module.css` files

### ✅ Performance Tests

- [ ] UI updates immediately after actions
- [ ] No unnecessary API calls
- [ ] Match data cached properly
- [ ] Teams data loads only once

---

## Priority Order

1. **MatchView Component** (15 minutes)
   - Most inline styles
   - Critical user journey

2. **Layout Styling** (5 minutes)
   - Easiest fix
   - Used everywhere

3. **AdminSetup Component** (10 minutes)
   - Admin-only page
   - Lower priority

4. **TossDecision Cleanup** (5 minutes)
   - Minor improvement
   - Already has module CSS

---

## Estimated Time: 35 minutes total

All architectural improvements are complete. This remaining work is purely moving inline styles to CSS modules following the established patterns.
