# InsightERP Frontend Guidelines

**Technology:** React + Tailwind CSS\
**Style Direction:** Modern, Corporate, Clean\
**Target Users:** Admin, Manager, Employee, Customer

------------------------------------------------------------------------

# 1. Design Philosophy

InsightERP must look:

-   Professional
-   Structured
-   Calm and trustworthy
-   Data-focused (ERP system)
-   Minimal, not flashy
-   Consistent across all screens

The UI should prioritize: - Readability - Clear hierarchy - Efficient
workflows - Structured layouts for dashboards and tables

------------------------------------------------------------------------

# 2. Color System

## 2.1 Primary Palette (Locked)

  Role                Color        Hex
  ------------------- ------------ ---------
  Main Background     Cream        #F5EFE7
  Secondary Surface   Sand         #D8C4B6
  Primary Action      Steel Blue   #4F709C
  Text / Topbar       Deep Navy    #213555

------------------------------------------------------------------------

## 2.2 Usage Rules

### Background

-   App background: #F5EFE7
-   Cards / sections: #FFFFFF or subtle Sand tint

### Text

-   Primary text: #213555
-   Secondary text: 70% opacity of #213555

### Buttons

-   Primary: #4F709C with white text
-   Hover: Slightly darker shade
-   Secondary: Outline with #4F709C

### Topbar

-   Background: #213555
-   Text/icons: #F5EFE7

------------------------------------------------------------------------

## 2.3 Status Colors (Muted, Professional)

  Status    Suggested Tone
  --------- ------------------
  Success   Muted Green
  Warning   Soft Amber
  Error     Soft Red
  Info      Use Primary Blue

Never use bright neon tones.

------------------------------------------------------------------------

# 3. Typography

## 3.1 Recommended Font

Primary UI Font: Inter (Google Font)\
Fallback: system-ui, sans-serif

Optional: Montserrat for H1/H2 only (if needed)

------------------------------------------------------------------------

## 3.2 Typography Scale

  Element   Size       Weight
  --------- ---------- ----------
  H1        28--32px   600
  H2        22--24px   600
  H3        18--20px   600
  Body      16px       400--500
  Small     14px       400
  Caption   12px       400

Tables should use 14px for comfortable density.

------------------------------------------------------------------------

# 4. Layout System

## 4.1 Overall Layout

Structure:

-   Fixed Topbar
-   Collapsible Left Sidebar
-   Main Content Area
-   Footer spacing

------------------------------------------------------------------------

## 4.2 Spacing System

Use 8px grid system.

Examples: - Page padding: p-6 desktop - Section spacing: gap-6 - Card
padding: p-4 - Form spacing: space-y-4

------------------------------------------------------------------------

## 4.3 Border Radius & Shadows

-   Cards: rounded-xl
-   Buttons/Inputs: rounded-lg
-   Shadow: shadow-sm or shadow-md
-   Avoid heavy shadows

------------------------------------------------------------------------

# 5. Component Standards

## 5.1 Buttons

Primary Button: - Background: Primary Blue - Text: White - Height:
h-10 - Radius: rounded-lg

Secondary Button: - Border: Primary Blue - Text: Primary Blue -
Transparent background

Danger Button: - Used only for destructive actions - Requires
confirmation

------------------------------------------------------------------------

## 5.2 Forms

Rules: - Label above input - Required fields show \* - Error text below
field - Focus state uses primary color

------------------------------------------------------------------------

## 5.3 Tables

Tables must support: - Search - Sorting - Pagination - Row actions
(Edit/Delete/View) - Empty states

Row height: 44--52px

Mobile: - Horizontal scroll enabled

------------------------------------------------------------------------

## 5.4 Cards

Used for: - Dashboard KPIs - Summary widgets - Quick metrics

------------------------------------------------------------------------

# 6. UX Feedback Rules

Loading: - Skeleton loaders (preferred) - Spinner for simple loads

Toast Notifications: - Top-right - Used for Success, Error, Warning

Confirmation Dialog: - Required before Delete actions

------------------------------------------------------------------------

# 7. Navigation Structure

Topbar contains: - Logo - System name - User profile dropdown - Logout -
Optional quick-add button

Sidebar contains: - Dashboard - Customers - Products - Orders -
Reports - Settings

Menus must change based on user role.

------------------------------------------------------------------------

# 8. Responsiveness

Desktop-first design.

Mobile rules: - Sidebar collapses to hamburger - Tables scroll
horizontally - Forms become single column - Buttons stack vertically

------------------------------------------------------------------------

# 9. Tailwind Implementation Rules

Define design tokens:

--bg: #F5EFE7\
--surface: #D8C4B6\
--primary: #4F709C\
--ink: #213555

Create reusable classes: - btn-primary - btn-secondary - input-base -
card-base

Never repeat raw hex codes in components.

------------------------------------------------------------------------

# 10. Page Structure Standard

Every page must follow:

1.  Page Title (H1)
2.  Optional subtitle
3.  Primary Action Button (right aligned)
4.  Main Content (table/cards)
5.  Proper spacing

------------------------------------------------------------------------

# 11. Branding Assets

-   Logo (light + dark version)
-   Favicon
-   Flat illustration style
-   Minimal icon usage (Lucide recommended)

------------------------------------------------------------------------

# 12. Folder Structure

src/ ├── components/ ├── layouts/ ├── pages/ ├── hooks/ ├── services/
├── styles/ └── utils/

------------------------------------------------------------------------

# Final Standard

InsightERP UI must always feel:

-   Structured
-   Calm
-   Data-driven
-   Corporate
-   Professional

No flashy gradients. No neon colors. No inconsistent spacing.
