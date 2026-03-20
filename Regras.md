# GOLDEN UI/UX PRINCIPLES (STRICT STRICT RULES)
1. NO VERTICAL MENUS: Navigation must be strictly horizontal at the top to maximize screen space for data grids.
2. MASTER-DETAIL VIEWS: Use compact, high-density data tables. Avoid page jumps. Clicking a row should expand it downwards (or open a sliding side panel) showing tabs: Product Lines, Attachments, Internal Chat, and Validation History.
3. QUICK ACTION MODALS: Use intuitive icons (✅, ❌, 🔄) for inline actions. Clicking them opens small modals for quick inputs (e.g., "Reason for Rejection").
4. KANBAN ALTERNATIVE: Provide a Kanban board view for workflows. Cards must auto-change color based on time in the current stage (Green = 1st week, Yellow = 2nd week, Red = 3rd+ week).
5. THEME: Implement a Light/Dark mode toggle.
6. 100% WHITE-LABEL/CONFIGURABLE: The UI is data-driven. Colors, logos, and menu names must be fetchable from a global configuration table, editable by an Admin.

# TECH STACK
- Frontend: Next.js (React), Tailwind CSS, TypeScript.
- Backend/Database: Supabase (PostgreSQL, Auth, Storage).
- Deployment: Vercel.
- Version Control: GitHub.

Language Requirement: The entire user interface, alerts, and documentation MUST be in Portuguese (pt-PT).