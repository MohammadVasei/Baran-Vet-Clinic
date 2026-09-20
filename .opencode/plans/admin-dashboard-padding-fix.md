# Admin Dashboard Padding Fix Plan

## Problem
The admin dashboard page has insufficient vertical spacing between sections, causing the UI to feel cramped. Specifically:
1. No space between the metric cards section and the charts section
2. No space between the charts section and the alerts section

## Root Cause
The dashboard uses separate grid containers for different sections, but lacks vertical margin between these containers:
- Metrics grid container (line 354): Contains the 4 metric cards
- Charts grid container (line 473): Contains the 3 charts  
- Alerts section container (line 562): Contains the alerts feed

While each grid container has internal `gap-4` spacing between its items, there is no vertical spacing between the containers themselves.

## Solution
Add `mb-4` (margin-bottom: 1rem) to create vertical spacing between sections:

### Changes Needed

**File:** `/src/app/admin/page.tsx`

1. **Add margin-bottom to metrics grid container** (around line 354):
   ```diff
   - <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
   + <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
   ```

2. **Add margin-bottom to charts grid container** (around line 473):
   ```diff
   - <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
   + <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
   ```

## Verification
After applying these changes:
- The metric cards section will have 1rem (16px) of space below it before the charts section
- The charts section will have 1rem (16px) of space below it before the alerts section
- Internal spacing within each section (gap-4) remains unchanged
- Responsive behavior is preserved
- The UI will appear less cramped and more visually balanced

## Alternative Implementation
Instead of adding `mb-4` to the containers, you could alternatively add `mt-4` (margin-top) to the following containers:
- Charts grid container (add mt-4)
- Alerts section container (add mt-4)

Both approaches achieve the same visual result.