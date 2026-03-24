# GAO Peças — Layout Reference Guide

> Use this as the blueprint when implementing **new modules** (Equipamentos, Pedidos, etc.)

---

## Page Container (`artigos/page.tsx`)

```tsx
<div className="h-full w-full animate-in fade-in duration-500">
  <ModuleListClient initialItems={mappedItems} />
</div>
```

The parent layout injects `p-8` — the client component MUST cancel this with `-m-8`.

---

## Main List Client (`ArticleListClient.tsx` pattern)

### Outer Wrapper
```tsx
<div className="flex h-[calc(100vh-5rem)] -m-8 bg-white dark:bg-zinc-950 font-sans overflow-hidden">
```
- `-m-8`: cancels parent padding
- `h-[calc(100vh-5rem)]`: fills full screen minus header height (~5rem)
- `overflow-hidden`: prevents outer scrollbars

### Left Content Panel
```tsx
<div className="flex-1 flex flex-col pt-3 pb-6 overflow-hidden">
```

### Title Block
```tsx
<header className="px-6 mb-4 flex-shrink-0">
  <h1 className="text-[2.5rem] font-black tracking-tighter uppercase text-zinc-900 dark:text-zinc-100 leading-none">
    TÍTULO DO MÓDULO
  </h1>
  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] mt-0.5">
    Subtítulo / Descrição
  </p>
</header>
```

### Filters / Action Bar
```tsx
<div className="px-6 flex items-center gap-3 mb-4 flex-shrink-0">
  {/* Search inputs + buttons */}
</div>
```
> ⚠️ Always `px-6` — same as title and table — for horizontal alignment.

### Table Container
```tsx
<div className="px-6 flex-1 flex flex-col min-h-0 overflow-hidden space-y-4">
  <div className="flex-1 overflow-auto rounded-3xl border-2 border-zinc-100 dark:border-zinc-800 shadow-2xl shadow-zinc-200/50 dark:shadow-zinc-950/40 bg-white dark:bg-zinc-900">
    <table className="w-full text-left border-collapse table-fixed">
      {/* thead + tbody */}
    </table>
  </div>
</div>
```

### Right Sidebar (Comments / Detail)
```tsx
<div className="w-[380px] border-l border-zinc-100 dark:border-zinc-800 h-full bg-zinc-50/30 dark:bg-zinc-950/20">
  <SidePanelComponent ... />
</div>
```

---

## Form Modal Pattern

```tsx
<div className="fixed inset-0 z-[150] flex flex-col items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-300">
  <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] w-full max-w-7xl h-[85vh] flex flex-col overflow-hidden border-2 border-zinc-100 dark:border-zinc-800">
    {/* Header */}
    {/* form — flex-1 flex overflow-hidden (two panels: left fixed-width + right flex-1) */}
    {/* Footer actions */}
  </div>
</div>
```

### Modal Modes
- Opens in **view mode** when `initialData` exists (`isEditing = !initialData`)
- Admins see **Editar / Eliminar** buttons in the header
- On save: stays open, reloads data, returns to view mode

### Left Panel (Fixed 380px)
- `flex flex-col overflow-hidden`
- Fields use `space-y-4`
- Bottom field (notes/obs) uses `flex-1 flex flex-col min-h-0 pb-2` + `flex-1` textarea to fill remaining height

### Right Panel (flex-1)
- Top: scrollable table of references/part numbers
- Bottom: `grid grid-cols-2` with Photos + Documents sections

---

## Attachment Gallery Overlay (from list)

```tsx
{overlayType && selectedItem && (
  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
    <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
      {/* header */}
      <div className="p-8 overflow-y-auto">
        {/* grid for images or list for documents */}
      </div>
    </div>
  </div>
)}
```

---

## Key Design Tokens

| Property | Value |
|---|---|
| Font sizes | `text-[9px]` labels, `text-[11px]` inputs, `text-[10px]` buttons |
| Border radius | `rounded-xl` (inputs), `rounded-2xl` (cards), `rounded-3xl` (panels), `rounded-[2.5rem]` (modals) |
| Primary color | `blue-600` |
| Horizontal padding | `px-6` throughout list module |
| Table row hover | `hover:bg-zinc-50 dark:hover:bg-zinc-900` |
| Row double-click | Opens edit modal |
| Icon sizes | `h-5 w-5` (actions), `h-4 w-4` (inline) |
