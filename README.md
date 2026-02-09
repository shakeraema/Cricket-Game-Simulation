# Cricket Match Simulation - Refactored Project

A comprehensive Next.js 15 application for simulating cricket matches with authentication, real-time match play, and match history tracking.

## 🎯 Project Overview

This project has been refactored to follow best practices in:

- **Component Architecture**: Clean separation between pages and business logic
- **State Management**: SWR for efficient data fetching and caching
- **Code Organization**: Utilities, hooks, constants, and middleware for reusability
- **Styling**: CSS Modules only (no inline styles)
- **API Design**: Standardized responses and centralized authentication

## 🏗️ Architecture

### Frontend Layer

```
src/app/
├── dashboard/          → Server component, renders Dashboard components
├── match/
│   ├── new/           → Renders NewMatchForm component
│   ├── [id]/          → Renders TossPage component
│   │   ├── play/      → Renders PlayMatch component
│   │   └── view/      → Renders MatchView component
```

### Component Layer

```
src/components/
├── Dashboard/
│   ├── MatchCountWidget.jsx    → Server component for match count
│   ├── MatchHistory.jsx        → Server component for match history
│   ├── ProfileSection.jsx      → User profile display
│   └── StatsGrid.jsx           → Reusable stats card grid
├── Match/
│   ├── NewMatchForm.jsx        → Match creation form
│   ├── PlayMatch.jsx           → Main match play component
│   └── TossPage.jsx            → Toss ceremony component
└── auth/
    └── LogoutButton.jsx        → Logout functionality
```

### Custom Hooks (SWR-based)

```
src/hooks/
├── useMatch.js         → Fetch and manage match data
├── useTeams.js         → Fetch teams data
└── useMatchHistory.js  → Fetch match history
```

### Utilities & Middleware

```
src/
├── utils/
│   └── apiResponse.js      → Standardized API responses
├── middleware/
│   └── authMiddleware.js   → Centralized auth checking
└── constants/
    └── routes.js           → Application route constants
```

## 🚀 Key Features

### 1. Optimized Data Fetching

- **SWR Integration**: Automatic caching, revalidation, and error handling
- **Optimistic Updates**: UI updates immediately after actions without refetching
- **No Polling**: Data updates only when needed (on user action or page reload)

### 2. Component-Based Architecture

- **Pages are Thin**: Only responsible for routing and rendering components
- **Components Handle Logic**: All business logic, state, and UI in components
- **Reusability**: Components can be reused across different pages

### 3. Centralized Utilities

- **Auth Middleware**: Single source of truth for authentication
- **API Responses**: Consistent error handling and response formats
- **Route Constants**: No hardcoded URLs throughout the codebase

### 4. Clean Styling

- **CSS Modules Only**: No inline styles in components
- **Responsive Design**: All components are mobile-friendly
- **Consistent Theme**: Unified color scheme and design language

## 📦 Installation & Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

## 📚 Usage Guide

### Creating a Match

1. Navigate to `/match/new`
2. Select two teams
3. Choose number of overs (2, 5, or 10)
4. Proceed to toss

### Playing a Match

1. Complete the toss ceremony
2. Click "Play Ball" to simulate each delivery
3. View real-time score updates
4. Pause/Resume match as needed
5. After first innings completes, start second innings
6. View final results when match completes

### Viewing Match History

1. Navigate to `/dashboard`
2. View all your matches in the history table
3. Click "Play" for ongoing matches
4. Click "View" for completed matches

## 🎨 Component Examples

### Using Custom Hooks

```jsx
import { useMatch } from "@/hooks/useMatch";

export default function MyComponent({ matchId }) {
  const { match, isLoading, mutate } = useMatch(matchId);

  // Optimistic update after action
  const handleAction = async () => {
    const res = await fetch('/api/match/action', { ... });
    const data = await res.json();

    // Update local cache immediately
    await mutate(data.match, false);
  };

  if (isLoading) return <div>Loading...</div>;
  return <div>{match.teamA} vs {match.teamB}</div>;
}
```

## 📋 API Endpoints

### Match Endpoints

- `POST /api/match/create` - Create new match
- `GET /api/match/[id]` - Get match by ID
- `POST /api/match/toss` - Complete toss ceremony
- `POST /api/match/play-ball` - Play a ball
- `POST /api/match/pause` - Pause match
- `POST /api/match/resume` - Resume match
- `POST /api/match/[id]/start-innings` - Start second innings
- `GET /api/match/history` - Get user's match history

## 🎯 Best Practices Followed

1. **Separation of Concerns**: Pages, components, services, repositories
2. **DRY Principle**: Utilities, hooks, and constants prevent repetition
3. **Optimistic UI**: Immediate feedback without unnecessary server calls
4. **Type Safety**: Consistent data structures throughout
5. **Error Handling**: Standardized error responses
6. **Accessibility**: Semantic HTML and proper ARIA labels
7. **Performance**: SWR caching, code splitting, lazy loading

## 📖 Further Documentation

- [Refactoring Summary](./REFACTORING_SUMMARY.md) - Detailed breakdown of changes

---

Built with ❤️ using Next.js 15, React 19, MongoDB, and NextAuth
