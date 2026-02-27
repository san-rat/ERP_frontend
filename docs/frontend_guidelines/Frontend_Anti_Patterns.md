# InsightERP Frontend -- What NOT To Do

**React + Tailwind Corporate ERP System**

This document defines design and development mistakes that must be
avoided to maintain a professional, scalable, and consistent UI.

------------------------------------------------------------------------

# 1. Visual Design Mistakes

## Do NOT Use Flashy or Trendy Effects

-   No neon colors
-   No heavy gradients
-   No glassmorphism
-   No glowing shadows
-   No animated backgrounds

InsightERP is a corporate ERP system --- it must look stable and
trustworthy, not experimental.

------------------------------------------------------------------------

## Do NOT Randomly Add New Colors

-   Do not introduce random blues, greens, or reds.
-   All new colors must complement the base palette.
-   Status colors must remain muted.

If a new color is needed, define it in the theme tokens first.

------------------------------------------------------------------------

## Do NOT Mix Too Many Font Styles

-   Do not use more than 2 fonts.
-   Do not mix multiple font weights randomly.
-   Do not use decorative or handwritten fonts.

ERP systems require readability and clarity.

------------------------------------------------------------------------

## Do NOT Overuse Bold Text

-   Avoid making entire paragraphs bold.
-   Avoid excessive font size changes.
-   Use weight and size for hierarchy only.

------------------------------------------------------------------------

# 2. Layout & Spacing Mistakes

## Do NOT Use Inconsistent Spacing

-   No random padding/margin values.
-   Follow 8px spacing scale.
-   Avoid tight cramped layouts.
-   Avoid too much empty space.

Consistency builds professionalism.

------------------------------------------------------------------------

## Do NOT Create Full-Width Content Everywhere

-   Avoid ultra-wide content stretching across large monitors.
-   Use max-width containers for readability.

------------------------------------------------------------------------

## Do NOT Overcrowd Dashboards

-   Avoid placing too many widgets.
-   Avoid tiny unreadable KPI cards.
-   Avoid visual clutter.

If it feels busy, simplify.

------------------------------------------------------------------------

# 3. Component & Code Mistakes

## Do NOT Use Inline Random Styles

Bad example: \<div style={{ background: "#4F709C" }}\>

Instead: - Use Tailwind classes - Use theme tokens - Use reusable
component classes

------------------------------------------------------------------------

## Do NOT Repeat Hex Codes in Multiple Files

All colors must come from: - Tailwind config - CSS variables - Design
tokens

Never hardcode colors everywhere.

------------------------------------------------------------------------

## Do NOT Create Duplicate Button Styles

There must only be: - One Primary button style - One Secondary button
style - One Danger style

No custom variations per page.

------------------------------------------------------------------------

## Do NOT Create 10 Different Input Styles

All inputs must share: - Same border - Same radius - Same focus
behavior - Same error styling

Consistency \> creativity.

------------------------------------------------------------------------

# 4. UX Mistakes

## Do NOT Skip Loading States

Never leave: - Blank pages while loading - No feedback during API calls

Always show: - Skeleton - Spinner - Disabled buttons during submit

------------------------------------------------------------------------

## Do NOT Delete Without Confirmation

Every destructive action must: - Show confirmation modal - Clearly
explain what is being deleted

------------------------------------------------------------------------

## Do NOT Hide Errors

-   Always show API errors.
-   Do not silently fail.
-   Do not log only in console.

User feedback is critical.

------------------------------------------------------------------------

## Do NOT Ignore Empty States

If a table has no data: - Show message - Show action button

Do not show blank table with no explanation.

------------------------------------------------------------------------

# 5. Responsiveness Mistakes

## Do NOT Break Mobile Layout

-   Sidebar must collapse
-   Tables must scroll horizontally
-   Forms must stack vertically

No overlapping elements. No horizontal overflow issues.

------------------------------------------------------------------------

## Do NOT Hide Important Actions on Mobile

If a feature exists on desktop, it must be accessible on mobile.

------------------------------------------------------------------------

# 6. Performance & Architecture Mistakes

## Do NOT Overload Pages with Large Components

-   Lazy load heavy pages.
-   Avoid loading all data at once.
-   Paginate tables.

------------------------------------------------------------------------

## Do NOT Mix Business Logic Inside UI Components

-   Keep API logic in services.
-   Keep layout components clean.
-   Keep reusable components simple.

------------------------------------------------------------------------

## Do NOT Hardcode Role Permissions in UI

Avoid: if (user.role === "admin")

Instead: - Use centralized permission mapping.

------------------------------------------------------------------------

# 7. Branding Mistakes

## Do NOT Distort Logo

-   Do not stretch logo
-   Do not change colors randomly
-   Use light/dark versions properly

------------------------------------------------------------------------

## Do NOT Use Low-Quality Icons

Use one consistent icon library: - Lucide (recommended)

Do not mix multiple icon packs.

------------------------------------------------------------------------

# 8. General Professional Standards

## Do NOT Ship Incomplete UI

No: - Debug text - Placeholder lorem ipsum - Unaligned elements - Broken
hover states

------------------------------------------------------------------------

## Do NOT Push Unreviewed UI Changes

Maintain: - Code consistency - Component structure - Design token usage

------------------------------------------------------------------------

# Final Rule

If a design decision makes the UI: - Flashy - Trendy - Over-animated -
Inconsistent - Visually noisy

It should NOT be implemented.

InsightERP must always feel: - Corporate - Stable - Calm -
Professional - Data-driven
