# Bella Cucina — CMS Documentation

> **Complete guide** to the Content Management System, covering every editable feature,
> the admin panel, data architecture, and detailed instructions for migrating to
> **Supabase** (database) and **Coolify** (self-hosted deployment).

---

## Table of Contents

1.  [Architecture Overview](#1-architecture-overview)
2.  [File Structure](#2-file-structure)
3.  [Data Models & TypeScript Types](#3-data-models--typescript-types)
4.  [Admin Panel — Overview](#4-admin-panel--overview)
5.  [Admin — Restaurant Editor](#5-admin--restaurant-editor)
6.  [Admin — Categories Editor](#6-admin--categories-editor)
7.  [Admin — Products Editor](#7-admin--products-editor)
8.  [Admin — Page Content (Text Editing)](#8-admin--page-content-text-editing)
9.  [Admin — Design & Layout (Visual Customization)](#9-admin--design--layout-visual-customization)
10. [Admin — Sections & Themes (NEW)](#10-admin--sections--themes)
11. [Section Ordering & Visibility](#11-section-ordering--visibility)
12. [Section Variants — All Options](#12-section-variants--all-options)
13. [Theme Presets — Complete Reference](#13-theme-presets--complete-reference)
14. [Page Layout Modes](#14-page-layout-modes)
15. [Typography System](#15-typography-system)
16. [Animation System](#16-animation-system)
17. [Spacing & Density System](#17-spacing--density-system)
18. [Extra Sections — Promo, Featured, Social Proof, Footer](#18-extra-sections--promo-featured-social-proof-footer)
19. [Current Data Flow (Local Mode)](#19-current-data-flow-local-mode)
20. [Supabase Migration — Database Schema](#20-supabase-migration--database-schema)
21. [Supabase Migration — API Routes](#21-supabase-migration--api-routes)
22. [Supabase Migration — Updated CMS Store](#22-supabase-migration--updated-cms-store)
23. [Supabase Migration — Updated useCmsData Hook](#23-supabase-migration--updated-usecmsdata-hook)
24. [Supabase Migration — Image Storage](#24-supabase-migration--image-storage)
25. [Supabase Migration — Authentication](#25-supabase-migration--authentication)
26. [Coolify Deployment](#26-coolify-deployment)
27. [Environment Variables](#27-environment-variables)
28. [Step-by-Step Migration Checklist](#28-step-by-step-migration-checklist)
29. [Troubleshooting](#29-troubleshooting)

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                       Browser (Client)                           │
│                                                                  │
│  ┌──────────────────┐     ┌──────────────────────────────────┐  │
│  │  Admin Panel      │────▶│  CMS Store (Zustand + persist)   │  │
│  │  /admin/*         │     │  Key: "bella-cucina-cms"         │  │
│  └──────────────────┘     │                                  │  │
│                            │  State:                          │  │
│                            │  ├─ restaurant: RestaurantInfo   │  │
│                            │  ├─ categories: CategoryInfo[]   │  │
│                            │  ├─ products: ProductItem[]      │  │
│                            │  ├─ pageContent: PageContent     │  │
│                            │  ├─ componentStyles: Styles      │  │
│                            │  └─ layoutConfig: LayoutConfig   │  │
│                            └────────────┬─────────────────────┘  │
│                                         │                        │
│                              ┌──────────▼──────────┐             │
│                              │  useCmsData() Hook   │             │
│                              │  (SSR-safe hydration)│             │
│                              └──────────┬──────────┘             │
│                                         │                        │
│  ┌──────────────────────────────────────▼───────────────────┐   │
│  │  Public Pages                                             │   │
│  │  /          → Menu (hero, info bar, categories, cards)    │   │
│  │  /product/* → Product detail (image, addons, quantity)    │   │
│  │  /cart      → Shopping cart (items, summary, place order)  │   │
│  │  /checkout  → Checkout (table, kitchen note, confirm)     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Static Fallback: src/data/restaurants.ts                 │   │
│  │  (Used during SSR & as initial seed data)                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘

FUTURE (with Supabase):
┌──────────┐    ┌───────────┐    ┌────────────┐    ┌──────────┐
│  Admin    │───▶│ API Routes│───▶│  Supabase  │◀───│  Public  │
│  Panel    │    │ /api/*    │    │  PostgreSQL│    │  Pages   │
└──────────┘    └───────────┘    └────────────┘    └──────────┘
```

### Tech Stack

| Technology       | Role                                              |
|------------------|---------------------------------------------------|
| **Next.js 14**   | App Router, server/client components               |
| **TypeScript**   | Full type safety across all CMS data               |
| **Zustand**      | Client-side state management with `persist` MW     |
| **Tailwind CSS** | Utility-first styling with custom theme            |
| **Framer Motion**| Admin panel and frontend animations                |
| **clsx**         | Conditional class composition                      |
| **Lucide React** | Icon library used throughout the admin             |

---

## 2. File Structure

```
src/
├── types/
│   ├── cms.ts                    # CMS types: RestaurantInfo, CategoryInfo, ProductItem,
│   │                             #   PageContent (64+ fields), ComponentStyles (44+ props),
│   │                             #   LayoutConfig, MenuSectionItem, 10 variant types,
│   │                             #   ThemePreset, ThemePresetId (11 themes)
│   ├── cart.ts                   # Cart types: CartItem
│   └── product.ts                # Product display types
│
├── store/
│   └── cmsStore.ts               # Zustand store with persist middleware
│                                 #   - defaultPageContent (all text defaults)
│                                 #   - defaultComponentStyles (all design defaults)
│                                 #   - defaultLayoutConfig (section order, variants, fonts)
│                                 #   - THEME_PRESETS (10 built-in themes)
│                                 #   - CmsState interface (data + actions)
│                                 #   - Actions: update/add/remove/reorder/applyTheme
│
├── hooks/
│   └── useCmsData.ts             # SSR-safe hydration hook
│                                 #   - Returns: restaurant, categoryConfig, products,
│                                 #     categoryIcons, pageContent, componentStyles, layoutConfig
│                                 #   - Merges defaults with stored overrides
│
├── data/
│   └── restaurants.ts            # Static seed data (fallback / initial values)
│
├── components/
│   ├── MenuItemCard.tsx          # Card component: horizontal/vertical layouts,
│   │                             #   image left/right, dynamic colors/radius/shadow
│   ├── MenuList.tsx              # Menu sections: dynamic headers, alignment, icons, dividers
│   ├── OrderBar.tsx              # Floating bar: gradient/solid/glass variants
│   ├── OrderItem.tsx             # Single item in cart/order list
│   └── QuantitySelector.tsx      # Plus/minus quantity control
│
├── app/
│   ├── page.tsx                  # Main menu: dynamic section rendering with 9 orderable
│   │                             #   sections, 41 variant styles, theme-aware typography
│   ├── cart/page.tsx             # Cart page with dynamic colors
│   ├── checkout/page.tsx         # Checkout with dynamic colors & table selector
│   ├── product/[id]/page.tsx     # Product detail with dynamic layout & colors
│   │
│   └── admin/
│       ├── layout.tsx            # Admin sidebar: navigation, logo, "Local Mode" badge
│       ├── page.tsx              # Dashboard: stats, chart, quick actions
│       ├── restaurant/page.tsx   # Restaurant info editor with live hero preview
│       ├── categories/page.tsx   # Category CRUD: add, edit, reorder, delete, color picker
│       ├── products/page.tsx     # Product CRUD: search, filter, addons, image preview
│       └── page-content/page.tsx # THREE-TAB EDITOR:
│                                 #   Tab 1: "Text Content" — 8 sections, 64+ fields
│                                 #   Tab 2: "Design & Layout" — 10 sections, 44+ props
│                                 #   Tab 3: "Sections & Themes" — section ordering,
│                                 #           41 variants, 10 theme presets, typography,
│                                 #           animation, density controls
│
├── styles/
│   └── globals.css               # Tailwind base + custom theme variables
│
└── lib/                          # (FUTURE) Supabase client initialization
    └── supabase.ts               # To be created during migration
```

---

## 3. Data Models & TypeScript Types

All types are defined in `src/types/cms.ts`.

### 3.1 RestaurantInfo

| Field       | Type     | Description                                      |
|-------------|----------|--------------------------------------------------|
| `name`      | `string` | Restaurant name displayed in hero & admin         |
| `tagline`   | `string` | Subtitle shown below the name in the hero banner  |
| `image`     | `string` | Hero banner background image URL                  |
| `logo`      | `string` | Restaurant logo URL (used in admin sidebar)        |
| `address`   | `string` | Physical address shown in the info bar             |
| `openHours` | `string` | Operating hours text (e.g. "10:00 AM - 11:00 PM") |
| `wifi`      | `string` | WiFi password displayed in the info bar            |
| `phone`     | `string` | Contact phone number                               |

### 3.2 CategoryInfo

| Field   | Type     | Description                                               |
|---------|----------|-----------------------------------------------------------|
| `id`    | `string` | Unique identifier (e.g. `"pasta"`, `"pizza"`)             |
| `label` | `string` | Display name in category bar and section headers          |
| `icon`  | `string` | Emoji icon (e.g. `"🍝"`, `"🍕"`)                         |
| `color` | `string` | Tailwind gradient class (e.g. `"from-amber-400 to-orange-500"`) |

**Protected Categories:** `"all"` and `"popular"` cannot be deleted from the admin.

### 3.3 ProductItem

| Field          | Type       | Description                               |
|----------------|------------|-------------------------------------------|
| `id`           | `string`   | Unique identifier (slug format)           |
| `restaurantId` | `string`   | Parent restaurant reference                |
| `name`         | `string`   | Product display name                       |
| `description`  | `string`   | Short description shown on cards           |
| `price`        | `number`   | Base price (uses `currencySymbol` prefix)  |
| `image`        | `string`   | Product image URL                          |
| `category`     | `string`   | References `CategoryInfo.id`              |
| `addons?`      | `Addon[]`  | Optional list of add-ons                   |
| `popular?`     | `boolean`  | Whether to show in the "Popular" section   |

### 3.4 PageContent — 55+ Editable Text Fields

Every piece of user-facing text can be changed from the admin panel. The fields are organized into 8 sections:

#### Menu Page (5 fields)
| Key                   | Default                                              | Used In          |
|-----------------------|------------------------------------------------------|------------------|
| `welcomeTitle`        | `"Welcome! 👋"`                                     | Info bar card    |
| `welcomeDescription`  | `"Browse our menu and tap to order..."`              | Info bar card    |
| `dineInLabel`         | `"Dine-in"`                                          | Info pill badge  |
| `searchPlaceholder`   | `"Search dishes, ingredients..."`                    | Search bar       |
| `currencySymbol`      | `"$"`                                                | All price labels |

#### Badges & Labels (2 fields)
| Key                    | Default            | Used In              |
|------------------------|--------------------|----------------------|
| `popularBadgeText`     | `"🔥 Popular"`    | Popular item badges  |
| `customizableBadgeText`| `"Customizable"`  | Items with add-ons   |

#### Order Bar (2 fields)
| Key                   | Default            | Used In                |
|-----------------------|--------------------|------------------------|
| `orderBarViewText`    | `"View Order"`     | Order bar button       |
| `orderBarItemAddedText`| `"item(s) added"` | Order bar counter      |

#### Cart Page (9 fields)
| Key                 | Default                                             | Used In           |
|---------------------|-----------------------------------------------------|-------------------|
| `cartTitle`         | `"Your Order"`                                      | Cart page heading |
| `emptyCartTitle`    | `"No items yet"`                                    | Empty state       |
| `emptyCartDescription`| `"Browse our menu and add your favorite dishes..."` | Empty state     |
| `browseMenuText`    | `"Browse Menu"`                                     | Empty state CTA   |
| `addMoreItemsText`  | `"Add more items"`                                  | Cart footer link  |
| `orderSummaryTitle` | `"Order Summary"`                                   | Summary section   |
| `dineInServiceNote` | `"Dine-in — no service charge"`                     | Price subtotal    |
| `placeOrderText`    | `"Place Order"`                                     | Submit button     |
| `clearButtonText`   | `"Clear"`                                           | Clear cart button |

#### Checkout Page (12 fields)
| Key                    | Default                                     | Used In               |
|------------------------|---------------------------------------------|-----------------------|
| `confirmOrderTitle`    | `"Confirm Order"`                           | Page heading          |
| `confirmOrderSubtitle` | `"Almost there! Select your table."`        | Page subheading       |
| `tableCount`           | `20` (number)                               | Number of table buttons|
| `yourTableTitle`       | `"Your Table"`                              | Table section heading |
| `yourTableDescription` | `"Check the number displayed on your table"`| Table section hint    |
| `kitchenNoteTitle`     | `"Kitchen Note"`                            | Note section heading  |
| `kitchenNoteDescription`| `"Allergies, special requests..."`         | Note section hint     |
| `kitchenNotePlaceholder`| `"e.g., No onions, extra spicy..."`        | Note input placeholder|
| `dineInBadgeTitle`     | `"Dine-in Order"`                           | Badge label           |
| `dineInBadgeSubtext`   | `"No delivery or service charges"`          | Badge subtext         |
| `sendToKitchenText`    | `"Send to Kitchen"`                         | Submit button         |
| `selectTableText`      | `"Select your table number"`                | Validation message    |

#### Order Confirmed (9 fields)
| Key                 | Default                                     | Used In              |
|---------------------|---------------------------------------------|----------------------|
| `orderSentTitle`    | `"Order Sent!"`                             | Success heading      |
| `orderReceivedText` | `"Order Received"`                          | Timeline step 1      |
| `orderReceivedDesc` | `"Your order has been sent to the kitchen"` | Timeline step 1 desc |
| `preparingFoodText` | `"Preparing Your Food"`                     | Timeline step 2      |
| `preparingFoodDesc` | `"Our chef is working on your dishes"`      | Timeline step 2 desc |
| `comingToTableText` | `"Coming to Your Table"`                    | Timeline step 3      |
| `estimatedWaitText` | `"Estimated wait: 10-15 minutes"`           | Wait time display    |
| `backToMenuText`    | `"Back to Menu"`                            | Return button        |
| `orderMoreNote`     | `"Want to order more? Go back..."`          | Footer note          |

#### Product Page (10 fields)
| Key                    | Default                 | Used In                  |
|------------------------|-------------------------|--------------------------|
| `itemNotFoundText`     | `"Item not found"`      | 404 state                |
| `popularChoiceText`    | `"Popular Choice"`      | Popular badge            |
| `basePriceLabel`       | `"base price"`          | Price subtitle           |
| `customizeSectionTitle`| `"Customize Your Dish"` | Add-ons section heading  |
| `optionalLabel`        | `"Optional"`            | Add-ons hint             |
| `quantityLabel`        | `"Quantity"`            | Quantity section heading |
| `quantityDescription`  | `"How many would you like?"` | Quantity hint       |
| `addToOrderText`       | `"Add to Order"`        | CTA button               |
| `addedToOrderText`     | `"Added to Order!"`     | Success confirmation     |
| `moreCategoryPrefix`   | `"More in"`             | Related items header     |

#### Menu List (4 fields)
| Key                  | Default                                     | Used In           |
|----------------------|---------------------------------------------|-------------------|
| `noItemsFoundText`   | `"No items found"`                          | Empty search      |
| `noItemsFoundHint`   | `"Try a different category or search term"` | Empty search hint |
| `itemsAvailableText` | `"available"`                               | Count suffix      |
| `itemsFoundText`     | `"found"`                                   | Search count      |

### 3.5 ComponentStyles — 40+ Visual Properties

This is the **Design & Layout** system. Every visual aspect of every frontend component can be customized without touching code.

#### Hero Banner (3 properties)
| Property         | Type                                 | Default    | Description                                |
|------------------|--------------------------------------|------------|--------------------------------------------|
| `heroHeight`     | `'compact' \| 'normal' \| 'tall'`   | `'normal'` | Hero banner vertical height                |
| `heroTextAlign`  | `'left' \| 'center' \| 'right'`     | `'left'`   | Restaurant name & tagline text alignment   |
| `heroOverlay`    | `'light' \| 'medium' \| 'dark'`     | `'dark'`   | Darkness of the gradient overlay on image  |

**How it works in code:** The hero uses a mapping to convert these values:
- Height: `compact` → `h-48`, `normal` → `h-64`, `tall` → `h-80`
- Text align: maps to `text-left`/`text-center`/`text-right` + flex justify
- Overlay: `light` → 30% opacity, `medium` → 50%, `dark` → 70%

#### Info Bar (3 properties)
| Property           | Type      | Default     | Description                             |
|--------------------|-----------|-------------|-----------------------------------------|
| `infoBarBgColor`   | `string`  | `'#FFFFFF'` | Background color of the welcome card    |
| `infoBarTextColor` | `string`  | `'#1E1E1E'` | Text color in the welcome card         |
| `infoBarVisible`   | `boolean` | `true`      | Show/hide the entire info bar section   |

#### Menu Item Cards (8 properties)
| Property              | Type                              | Default     | Description                          |
|-----------------------|-----------------------------------|-------------|--------------------------------------|
| `cardLayout`          | `'horizontal' \| 'vertical'`     | `'horizontal'` | Card orientation                  |
| `cardImagePosition`   | `'left' \| 'right'`              | `'left'`    | Image side (horizontal layout only)  |
| `cardBgColor`         | `string`                          | `'#FFFFFF'` | Card background color                |
| `cardTitleColor`      | `string`                          | `'#1E1E1E'` | Product name text color             |
| `cardDescriptionColor`| `string`                          | `'#777777'` | Description text color               |
| `cardPriceColor`      | `string`                          | `'#F4B400'` | Price tag color                      |
| `cardBorderRadius`    | `'sm' \| 'md' \| 'lg' \| 'xl'`  | `'xl'`      | Corner rounding amount               |
| `cardShadow`          | `'none' \| 'sm' \| 'md' \| 'lg'` | `'sm'`     | Drop shadow depth                    |

**Card Layout Details:**
- **Horizontal + Image Left**: Classic layout — image on the left, text on the right (like a food app)
- **Horizontal + Image Right**: Reversed — text on the left, image on the right
- **Vertical**: Full-width image on top, text below (like an e-commerce card)

**How border radius works:** The admin stores a size token (`sm`/`md`/`lg`/`xl`), which is mapped to a Tailwind class in the component:
```
sm  → rounded-lg     (0.5rem)
md  → rounded-xl     (0.75rem)
lg  → rounded-2xl    (1rem)
xl  → rounded-3xl    (1.5rem)
```

**How shadow works:** Similarly mapped:
```
none → shadow-none
sm   → shadow-sm
md   → shadow-md
lg   → shadow-lg
```

#### Section Headers (6 properties)
| Property              | Type                         | Default     | Description                        |
|-----------------------|------------------------------|-------------|------------------------------------|
| `sectionTitleAlign`   | `'left' \| 'center'`        | `'left'`    | Category section title alignment   |
| `sectionTitleColor`   | `string`                     | `'#1E1E1E'` | Section title text color          |
| `sectionSubtitleColor`| `string`                     | `'#777777'` | Item count subtitle color          |
| `sectionShowDivider`  | `boolean`                    | `true`      | Show decorative line under title   |
| `sectionShowIcon`     | `boolean`                    | `true`      | Show category emoji next to title  |
| `sectionDividerColor` | `string`                     | `'#F4B400'` | Color of the divider line          |

#### Category Bar (2 properties)
| Property             | Type      | Default     | Description                          |
|----------------------|-----------|-------------|--------------------------------------|
| `categoryBarBgColor` | `string`  | `'#FFFFFF'` | Background of the horizontal scroll  |
| `categoryBarSticky`  | `boolean` | `true`      | Whether bar sticks to top on scroll  |

#### Order Bar (3 properties)
| Property            | Type                                    | Default       | Description                    |
|---------------------|-----------------------------------------|---------------|--------------------------------|
| `orderBarStyle`     | `'gradient' \| 'solid' \| 'glass'`     | `'gradient'`  | Visual style variant           |
| `orderBarBgColor`   | `string`                                | `'#F4B400'`   | Primary background color       |
| `orderBarTextColor` | `string`                                | `'#FFFFFF'`   | Text and icon color            |

**Order Bar Style Details:**
- **Gradient**: A gradient from the `orderBarBgColor` (darkened) to the `orderBarBgColor` (lightened), creating a polished look
- **Solid**: Flat single-color background using `orderBarBgColor`
- **Glass**: Semi-transparent `orderBarBgColor` at 80% opacity + `backdrop-blur-xl` frost effect

#### Product Detail Page (5 properties)
| Property                  | Type                    | Default     | Description                      |
|---------------------------|-------------------------|-------------|----------------------------------|
| `productCardBgColor`      | `string`                | `'#FFFFFF'` | Info card background             |
| `productTitleColor`       | `string`                | `'#1E1E1E'` | Product name color              |
| `productDescriptionColor` | `string`                | `'#777777'` | Product description color        |
| `productPriceColor`       | `string`                | `'#F4B400'` | Price display color              |
| `productImagePosition`    | `'left' \| 'right'`    | `'left'`    | Image position on desktop layout |

#### Cart Page (4 properties)
| Property          | Type     | Default     | Description                      |
|-------------------|----------|-------------|----------------------------------|
| `cartPageBgColor` | `string` | `'#F7F7F7'` | Full page background color       |
| `cartCardBgColor` | `string` | `'#FFFFFF'` | Cart item card backgrounds       |
| `cartTitleColor`  | `string` | `'#1E1E1E'` | Page title color                |
| `cartAccentColor` | `string` | `'#F4B400'` | Buttons, price highlights, icons |

#### Checkout Page (3 properties)
| Property               | Type     | Default     | Description                       |
|------------------------|----------|-------------|-----------------------------------|
| `checkoutPageBgColor`  | `string` | `'#F7F7F7'` | Full page background              |
| `checkoutCardBgColor`  | `string` | `'#FFFFFF'` | Card backgrounds                  |
| `checkoutAccentColor`  | `string` | `'#F4B400'` | Buttons, selection highlights     |

#### General (2 properties)
| Property         | Type                                    | Default       | Description                     |
|------------------|-----------------------------------------|---------------|---------------------------------|
| `menuPageBgColor`| `string`                                | `'#FFFFFF'`   | Main menu page background       |
| `buttonStyle`    | `'rounded' \| 'pill' \| 'square'`      | `'rounded'`   | Global button corner style      |

**Why inline styles vs Tailwind classes:** Color properties (`*BgColor`, `*Color`) are applied as inline `style={{ backgroundColor: ... }}` because Tailwind cannot dynamically generate classes at runtime from hex values stored in localStorage. Layout/size properties (`cardBorderRadius`, `cardShadow`, `buttonStyle`, etc.) use a static Tailwind class map — the possible values are known at build time, so Tailwind can safely purge unused classes.

---

## 4. Admin Panel — Overview

**URL:** `/admin`

The admin dashboard provides:
- **Statistics cards**: Total products, total categories, popular items count
- **Category distribution chart**: Animated bar chart showing products per category
- **Quick action buttons**: Navigate directly to any editor

All admin pages share a **sidebar layout** (`/admin/layout.tsx`) with:
- Restaurant logo display
- Navigation links to all 5 editor pages
- "Local Mode" badge (to be removed when Supabase is connected)
- "Reset to Defaults" button with confirmation modal
- Warm amber/gold theme (`#F4B400` primary)

---

## 5. Admin — Restaurant Editor

**URL:** `/admin/restaurant`

**Editable fields:**
| Field        | Type            | Description                    |
|--------------|-----------------|--------------------------------|
| Name         | Text input      | Restaurant name                |
| Tagline      | Text input      | Subtitle / slogan              |
| Hero Image   | URL input       | Background image for the hero  |
| Logo         | URL input       | Logo shown in admin sidebar    |
| Address      | Text input      | Street address                 |
| Open Hours   | Text input      | Operating hours text           |
| WiFi         | Text input      | WiFi password for customers    |
| Phone        | Text input      | Contact number                 |

**Live Preview:** The editor shows a real-time hero banner preview that updates as you type.

---

## 6. Admin — Categories Editor

**URL:** `/admin/categories`

**Features:**
- **Add new category**: Name, emoji icon, Tailwind gradient color
- **Edit inline**: Click to edit any field directly
- **Reorder**: Up/down arrows to change display order
- **Delete**: Remove categories (except protected `"all"` and `"popular"`)
- **Color picker**: Preset palette of gradient combinations

**Category data is used in:**
- Category scroll bar on the menu page
- Section headers in the menu list
- Product filtering
- `categoryIcons` map for displaying emojis

---

## 7. Admin — Products Editor

**URL:** `/admin/products`

**Features:**
- **Search & filter**: Find products by name or filter by category
- **Add new product**: All fields — name, description, price, image URL, category, popular flag
- **Edit inline**: Every field is editable with live image preview
- **Manage addons**: Add/remove add-ons with name + price per product
- **Delete**: Remove products with confirmation dialog
- **Grid layout**: Visual card grid showing product image, name, price, category badge

---

## 8. Admin — Page Content (Text Editing)

**URL:** `/admin/page-content` → **Tab: "Text Content"**

This is the first tab of the Page Content editor. It provides access to **55+ text fields** organized into **8 collapsible sections**:

| # | Section           | Fields | What It Controls                                |
|---|-------------------|--------|-------------------------------------------------|
| 1 | Menu Page         | 5      | Welcome title, description, search, currency    |
| 2 | Badges & Labels   | 2      | Popular badge text, customizable badge          |
| 3 | Order Bar         | 2      | View order button, items added counter          |
| 4 | Cart Page         | 9      | Cart title, empty state, order summary, buttons |
| 5 | Checkout Page     | 12     | Table selection, kitchen note, confirm button   |
| 6 | Order Confirmed   | 9      | Success screen, timeline steps, estimated wait  |
| 7 | Product Page      | 10     | Product detail labels, CTA, related items       |
| 8 | Menu List         | 4      | Empty state, item counts                        |

**How it works:**
1. Each section is a collapsible accordion panel with an icon, title, description, and field count badge
2. Fields are either `text` (single-line input), `textarea` (multi-line), or `number` (numeric input)
3. Each field shows the current value, with placeholder text showing the default
4. A "Reset this section" button at the bottom of each section restores defaults for just that section
5. Changes are staged locally until you click **"Save Changes"** — an unsaved changes indicator appears
6. The "Reset Text" button at the top restores ALL text fields to defaults (without saving)

---

## 9. Admin — Design & Layout (Visual Customization)

**URL:** `/admin/page-content` → **Tab: "Design & Layout"**

This is the second tab — a **visual design editor** with **40+ properties** organized into **10 collapsible sections**:

| # | Section          | Properties | What It Controls                                     |
|---|------------------|------------|------------------------------------------------------|
| 1 | General Settings | 4          | Page backgrounds (menu, cart, checkout), button style |
| 2 | Hero Banner      | 3          | Height, text alignment, overlay darkness              |
| 3 | Info Bar         | 3          | Visibility toggle, background color, text color       |
| 4 | Menu Item Cards  | 8          | Layout, image position, colors, radius, shadow        |
| 5 | Section Headers  | 6          | Title alignment, colors, icon toggle, divider toggle  |
| 6 | Category Bar     | 2          | Background color, sticky behavior                     |
| 7 | Order Bar        | 3          | Style variant, background color, text color           |
| 8 | Product Detail   | 5          | Image position, card bg, title/desc/price colors      |
| 9 | Cart Page        | 4          | Page bg, card bg, title color, accent color           |
| 10| Checkout Page    | 3          | Page bg, card bg, accent color                        |

### Custom Controls

The Design & Layout tab uses four reusable control components:

#### ColorPicker
- **12 preset swatches** from curated palettes (Background, Text, or Accent depending on context)
- **Custom hex input**: Click the `#` button to enter any hex color
- **Native color picker**: Browser color wheel for visual selection
- **Active indicator**: Selected swatch gets a gold ring highlight
- **Three palettes used:**
  - `BG_COLORS` (12 colors): White, Off-white, Warm Cream, Amber Light, Green/Blue/Pink/Orange Tints, Lavender, Slate, Dark, Charcoal
  - `TEXT_COLORS` (12 colors): Dark, Charcoal, Gray, Muted, Light, White, Gold, Amber, Red, Green, Blue, Purple
  - `ACCENT_COLORS` (10 colors): Gold, Amber, Orange, Rose, Blue, Emerald, Purple, Pink, Teal, Indigo

#### OptionSelector
- **Radio-button style** selector for enum values
- Shows icons alongside labels (e.g. alignment icons for left/center/right)
- Active option gets gold highlight with `bg-primary/10` background

#### ToggleSwitch
- **Animated on/off toggle** with spring physics (Framer Motion)
- Used for boolean properties: `infoBarVisible`, `sectionShowDivider`, `sectionShowIcon`, `categoryBarSticky`
- Shows label text and optional hint

#### CardLayoutPreview
- **Mini visual preview** of card layouts (horizontal left, horizontal right, vertical)
- Renders a schematic card with colored blocks representing image and text areas
- Active layout gets a gold border highlight

### How Design Changes Apply to Frontend

When you save design settings, the `componentStyles` object is persisted to localStorage. Each frontend component reads these styles via `useCmsData()` and applies them:

```
Admin saves componentStyles
  → Zustand persist → localStorage
    → useCmsData() reads from store
      → Components apply via:
          - Inline styles: style={{ backgroundColor: componentStyles.cardBgColor }}
          - Class maps: radiusMap[componentStyles.cardBorderRadius]
          - Conditional rendering: {componentStyles.infoBarVisible && <InfoBar />}
```

**Example — MenuItemCard applies card styles:**
```tsx
// Color properties → inline styles (runtime hex values)
<div style={{
  backgroundColor: componentStyles.cardBgColor,
}}>
  <h3 style={{ color: componentStyles.cardTitleColor }}>
    {product.name}
  </h3>
  <p style={{ color: componentStyles.cardDescriptionColor }}>
    {product.description}
  </p>
  <span style={{ color: componentStyles.cardPriceColor }}>
    {pageContent.currencySymbol}{product.price}
  </span>
</div>

// Size properties → Tailwind class maps (build-time safe)
const radiusMap = { sm: 'rounded-lg', md: 'rounded-xl', lg: 'rounded-2xl', xl: 'rounded-3xl' };
const shadowMap = { none: 'shadow-none', sm: 'shadow-sm', md: 'shadow-md', lg: 'shadow-lg' };
<div className={`${radiusMap[componentStyles.cardBorderRadius]} ${shadowMap[componentStyles.cardShadow]}`}>
```

---

## 10. Admin — Sections & Themes

**URL:** `/admin/page-content` → **Tab: "Sections & Themes"**

This is the **third tab** — a comprehensive layout and theme engine with **5 major panel sections**:

| # | Panel                   | Controls | What It Manages                                                 |
|---|-------------------------|----------|-----------------------------------------------------------------|
| 1 | Theme Presets           | 10       | One-click complete visual redesign — 10 built-in themes          |
| 2 | Section Order & Vis.    | 9        | Show/hide and reorder all 9 page sections with up/down buttons   |
| 3 | Section Variants        | 10       | Choose a visual style for each section (41 variants total)       |
| 4 | Page Layout & Typography| 4        | Page layout mode, heading/body fonts, base font size             |
| 5 | Animation & Spacing     | 3        | Animation intensity, content density, card gap size              |
| 6 | Extra Section Content   | 9+4      | Text for promo/featured/social/footer + their colors             |

### Data Architecture

All Sections & Themes settings are stored in `layoutConfig: LayoutConfig` in the Zustand store (persisted to `localStorage` under `"bella-cucina-cms"`). The `LayoutConfig` interface contains:

```typescript
interface LayoutConfig {
  sections: MenuSectionItem[];        // 9 sections with id, visible, variant
  heroVariant: HeroVariant;           // 5 options
  infoBarVariant: InfoBarVariant;     // 4 options
  searchBarVariant: SearchBarVariant; // 4 options
  categoryBarVariant: CategoryBarVariant; // 5 options
  menuContentVariant: MenuContentVariant; // 5 options
  orderBarVariant: OrderBarVariant;   // 4 options
  promoBannerVariant: PromoBannerVariant; // 4 options
  featuredVariant: FeaturedVariant;   // 3 options
  socialProofVariant: SocialProofVariant; // 3 options
  footerVariant: FooterVariant;       // 4 options
  pageLayout: PageLayout;             // 5 options
  headingFont: HeadingFont;           // 5 options
  bodyFont: BodyFont;                 // 4 options
  baseFontSize: FontSize;             // 3 options
  animationStyle: AnimationStyle;     // 5 options
  contentDensity: Density;            // 3 options
  cardGap: CardGap;                   // 3 options
  activeTheme: ThemePresetId;         // 11 options (10 presets + custom)
}
```

### Store Actions

| Action                | Signature                                             | Effect                                              |
|-----------------------|-------------------------------------------------------|-----------------------------------------------------|
| `updateLayoutConfig`  | `(data: Partial<LayoutConfig>) => void`               | Merges partial layout config into state              |
| `updateSections`      | `(sections: MenuSectionItem[]) => void`               | Replaces entire sections array                       |
| `toggleSectionVisibility` | `(sectionId: string) => void`                     | Toggles one section's `visible` flag                 |
| `moveSectionUp`       | `(sectionId: string) => void`                         | Swaps section with the one above                     |
| `moveSectionDown`     | `(sectionId: string) => void`                         | Swaps section with the one below                     |
| `applyTheme`          | `(themeId: ThemePresetId) => void`                    | Applies theme's styles + layout overrides at once    |

---

## 11. Section Ordering & Visibility

### Available Sections (9 total)

| # | Section ID        | Default Visible | Default Order | Description                        |
|---|-------------------|-----------------|---------------|-------------------------------------|
| 1 | `hero`            | ✅ Yes          | 1             | Main hero image banner at page top  |
| 2 | `infoBar`         | ✅ Yes          | 2             | Welcome message & restaurant info   |
| 3 | `promoBanner`     | ❌ No           | 3             | Promotional announcement ribbon     |
| 4 | `searchBar`       | ✅ Yes          | 4             | Menu item search input              |
| 5 | `categoryBar`     | ✅ Yes          | 5             | Category filter tabs/pills          |
| 6 | `featuredSection` | ❌ No           | 6             | Chef's specials / featured items    |
| 7 | `menuContent`     | ✅ Yes          | 7             | Main menu items by category         |
| 8 | `socialProof`     | ❌ No           | 8             | Reviews / rating display            |
| 9 | `footer`          | ❌ No           | 9             | Page footer with branding           |

### How It Works

- **UI Controls:** Each section shows an **Eye/EyeOff toggle** (visibility) and **Up/Down arrows** (reorder)
- **Rendering:** `page.tsx` filters visible sections, then maps them in order through `SECTION_MAP`
- **Persistence:** Section order + visibility is stored in `layoutConfig.sections[]`
- **Order Bar** is always rendered independently (not part of section ordering)

### Example Configurations

**Minimal Menu (4 sections):**
```
hero → searchBar → menuContent → footer
(infoBar, promoBanner, categoryBar, featuredSection, socialProof hidden)
```

**Full Experience (all 9 sections):**
```
hero → promoBanner → infoBar → searchBar → categoryBar →
featuredSection → menuContent → socialProof → footer
```

**Reversed Flow (search first):**
```
searchBar → categoryBar → menuContent → hero → footer
```

---

## 12. Section Variants — All Options

Every section has multiple visual variants. Select them from the "Section Variants" panel.

### 12.1 Hero Banner — 5 Variants

| Variant        | Description                                                           |
|----------------|-----------------------------------------------------------------------|
| `classic`      | Full-width image, gradient overlay, restaurant name at bottom-left    |
| `minimal`      | No image — just restaurant name and tagline as text on page background |
| `centered`     | Full-width image with centered text overlay                           |
| `split`        | Left side: text content, right side: image (desktop: 50/50 split)    |
| `overlay-full` | Full-viewport image, heavy dark overlay, centered logo + name         |

### 12.2 Info Bar — 4 Variants

| Variant    | Description                                                    |
|------------|----------------------------------------------------------------|
| `card`     | Elevated card overlapping the hero (-mt-5 offset), shadow      |
| `inline`   | Flush with page flow, no elevation, flex wrap for info pills   |
| `floating` | Similar to card but with soft shadow and float offset           |
| `banner`   | Full-width with subtle border, no shadow                        |

### 12.3 Search Bar — 4 Variants

| Variant    | Description                                              |
|------------|----------------------------------------------------------|
| `default`  | Standard rounded rectangle with focus ring               |
| `minimal`  | Bordered input box, no background fill                   |
| `pill`     | Fully rounded (pill shape) search input                  |
| `hidden`   | Search bar is completely hidden from the page            |

### 12.4 Category Bar — 5 Variants

| Variant     | Description                                                              |
|-------------|--------------------------------------------------------------------------|
| `scroll`    | Horizontal scroll with icon+label buttons, gradient on active (default)  |
| `pills`     | Compact pill-shaped buttons in a row, gold fill on active                |
| `underline` | Text-only links with underline border indicator on active                |
| `grid`      | 4-column (mobile) / 6-column (tablet) / 8-column (desktop) grid layout  |
| `minimal`   | Compact text-only buttons with subtle active highlight                   |

### 12.5 Menu Content — 5 Variants

| Variant    | Description                                                    |
|------------|----------------------------------------------------------------|
| `sections` | Grouped by category with headers (default)                     |
| `grid`     | Products in a responsive grid without category grouping        |
| `list`     | Compact list view with minimal card styling                    |
| `magazine` | Mixed sizes — editorial feel with varying card layouts          |
| `compact`  | Dense layout with smaller cards and tighter spacing             |

### 12.6 Order Bar — 4 Variants

| Variant         | Description                                              |
|-----------------|----------------------------------------------------------|
| `floating`      | Floating bottom bar with rounded corners (default)       |
| `sticky-bottom` | Full-width sticky bar at page bottom                     |
| `fab`           | Floating action button in bottom-right corner            |
| `minimal`       | Thin minimal bar at bottom                               |

### 12.7 Promo Banner — 4 Variants

| Variant    | Description                                                    |
|------------|----------------------------------------------------------------|
| `ribbon`   | Full-width colored ribbon with centered text (default)          |
| `card`     | Rounded card with shadow, padded within page margins            |
| `floating` | Pill-shaped floating notification-style banner                  |
| `marquee`  | Auto-scrolling (marquee) text animation from right to left      |

### 12.8 Featured Section — 3 Variants

| Variant     | Description                                                   |
|-------------|---------------------------------------------------------------|
| `carousel`  | Horizontal scroll of featured item cards                      |
| `highlight` | 2-3 column grid of featured items with small cards             |
| `banner`    | Large hero-style banner featuring the first popular item       |

### 12.9 Social Proof — 3 Variants

| Variant       | Description                                               |
|---------------|-----------------------------------------------------------|
| `stars`       | Star rating row with score and review count (default)     |
| `testimonial` | Quoted text with stars underneath, card style              |
| `counter`     | Large numeric display — rating and review count side by side |

### 12.10 Footer — 4 Variants

| Variant    | Description                                                     |
|------------|-----------------------------------------------------------------|
| `simple`   | Centered footer text and subtext (default)                       |
| `detailed` | Footer with text, subtext, and restaurant hours + address        |
| `minimal`  | Single line — just the subtext/copyright                         |
| `branded`  | Logo centered, restaurant name, diagonal pattern background       |

### Total Variant Count

| Category      | Variants |
|---------------|----------|
| Hero          | 5        |
| Info Bar      | 4        |
| Search Bar    | 4        |
| Category Bar  | 5        |
| Menu Content  | 5        |
| Order Bar     | 4        |
| Promo Banner  | 4        |
| Featured      | 3        |
| Social Proof  | 3        |
| Footer        | 4        |
| **Total**     | **41**   |

---

## 13. Theme Presets — Complete Reference

Themes are one-click presets that override both `componentStyles` and `layoutConfig` at once. Applying a theme:
- Replaces all color settings with the theme's palette
- Updates layout variants (hero style, category bar style, etc.)
- Updates typography and animation settings
- **Preserves custom section order** (sections array is not overridden)

### Available Themes (10 built-in + 1 custom)

#### 1. Bella Classic (default)
- **Colors:** White bg, Gold (#F4B400) accent, Dark (#1E1E1E) text
- **Font:** System default
- **Vibe:** The original warm gold signature look
- **Layout:** Standard, horizontal cards, scroll categories

#### 2. Modern Minimal
- **Colors:** Off-white (#FAFAFA) bg, Black (#111827) accent, Gray text
- **Font:** System sans-serif
- **Vibe:** Clean whites, thin lines, zero clutter
- **Layout:** Minimal hero, underline categories, grid menu, vertical cards, no shadows, pill buttons

#### 3. Dark Elegance
- **Colors:** Near-black (#0F0F0F) bg, Gold (#D4AF37) accent, White (#F5F5F5) text
- **Font:** Serif heading, elegant body
- **Vibe:** Luxury dark mode with gold accents, upscale feel
- **Layout:** Full overlay hero, dramatic animations, spacious density

#### 4. Vibrant Pop
- **Colors:** Warm cream (#FFF7ED) bg, Orange (#F97316) accent, Dark text
- **Font:** System default
- **Vibe:** Bold colors, strong gradients, playful energy
- **Layout:** Classic hero, grid menu, vertical cards, large shadows, playful animation, wide gaps

#### 5. Rustic Italian
- **Colors:** Parchment (#FDF6EC) bg, Terracotta (#B45309) accent, Brown (#3C1A00) text
- **Font:** Serif heading + serif body
- **Vibe:** Warm terracotta, aged paper, traditional feel
- **Layout:** Classic hero, horizontal cards, subtle animations

#### 6. Ocean Breeze
- **Colors:** Pale blue (#F0F9FF) bg, Sky blue (#0EA5E9) accent, Navy (#0C4A6E) text
- **Font:** System default
- **Vibe:** Cool blues and teals, fresh coastal vibe
- **Layout:** Centered hero, pill categories, glass order bar, spacious

#### 7. Cozy Café
- **Colors:** Cream (#FDF6EC) bg, Coffee brown (#92400E) accent, Dark brown (#3C1A00) text
- **Font:** Serif heading
- **Vibe:** Warm coffee house with artisan pastry vibes
- **Layout:** Full overlay hero, pill categories, floating promo, testimonial social proof

#### 8. Fresh Garden
- **Colors:** Mint-white (#F0FDF4) bg, Green (#16A34A) accent, Dark green (#14532D) text
- **Font:** Serif heading
- **Vibe:** Natural greens and earthy tones, organic feel
- **Layout:** Classic hero, horizontal cards, subtle animation

#### 9. Warm Sunset
- **Colors:** Pink-white (#FDF2F8) bg, Rose (#E11D48) accent, Dark text
- **Font:** Display heading
- **Vibe:** Rose and amber tones, warm evening vibes
- **Layout:** Centered hero, vertical cards, smooth animation, spacious

#### 10. Nordic Clean
- **Colors:** Pale slate (#F8FAFC) bg, Slate (#475569) accent, Dark blue (#1E293B) text
- **Font:** System default, small base size
- **Vibe:** Pale blues, minimal borders, Scandinavian feel
- **Layout:** Minimal hero, minimal categories, list menu, compact density, no animations

### Theme Color Preview

Each theme shows **4 color swatches** in the admin:
| Swatch | Meaning                      |
|--------|------------------------------|
| 1st    | Page background color        |
| 2nd    | Accent / primary color       |
| 3rd    | Card background color        |
| 4th    | Primary text color           |

### Applying a Theme

1. Go to `/admin/page-content` → **Sections & Themes** tab
2. Click any theme card
3. The theme applies **immediately** to the local state
4. Click **Save Changes** to persist
5. To go back, click another theme or reset

### Custom Theme

When you set `activeTheme: 'custom'`, the system uses whatever colors/styles you've manually configured in the Design & Layout tab. Any manual change to colors automatically sets the active theme to "custom".

---

## 14. Page Layout Modes

The `pageLayout` property controls the overall page structure. Currently the page rendering supports variant-aware section rendering:

| Layout       | Description                                                     |
|--------------|----------------------------------------------------------------|
| `standard`   | Single-column, mobile-first, centered content (default)         |
| `sidebar`    | Categories in a fixed sidebar on desktop, content on right      |
| `magazine`   | Mixed card sizes, editorial grid feel with varying columns       |
| `compact`    | Dense layout with minimal padding and smaller components         |
| `fullWidth`  | Edge-to-edge sections, no max-width constraint                   |

> **Note:** The `standard` layout is fully implemented. Other layout modes affect padding and spacing via the `contentDensity` and `cardGap` settings and can be extended by modifying the section renderers in `page.tsx`.

---

## 15. Typography System

| Setting      | Options                                            | Description                        |
|--------------|----------------------------------------------------|------------------------------------|
| Heading Font | `system`, `serif`, `mono`, `display`, `handwritten`| Font for h1-h6, section titles     |
| Body Font    | `system`, `serif`, `mono`, `elegant`               | Font for descriptions, paragraphs  |
| Base Font Size | `sm` (13px), `md` (14px), `lg` (16px)           | Global text size baseline          |

### Font Mapping (CSS Classes)

| Font ID      | Tailwind Classes Applied                  |
|--------------|-------------------------------------------|
| `system`     | `font-sans`                               |
| `serif`      | `font-serif`                              |
| `mono`       | `font-mono`                               |
| `display`    | `font-sans font-black tracking-tight`     |
| `handwritten`| `font-serif italic`                       |
| `elegant`    | `font-serif`                              |

### How Typography Applies

1. `headingFont` class is applied to: hero `<h1>`, section titles, table names, promo text
2. `bodyFont` class is applied to: the root page `<div>`, product descriptions, info text
3. `baseFontSize` is applied to info bar text and body copy

---

## 16. Animation System

| Style      | Delay Mult | Duration | Y-Offset | Description                          |
|------------|------------|----------|----------|--------------------------------------|
| `none`     | —          | 0ms      | 0px      | No animations at all                 |
| `subtle`   | Standard   | 200ms    | 10px     | Barely noticeable fade-in            |
| `smooth`   | Standard   | 300ms    | 10px     | Gentle, professional transitions     |
| `playful`  | Standard   | 500ms    | 10px     | Bouncy, longer, fun feel             |
| `dramatic` | Standard   | 300ms    | 20px     | Large motion, impactful entrance     |

### Implementation

All sections use a helper function `anim(delay)` that returns Framer Motion props:
```tsx
const anim = (delay: number) =>
  lc.animationStyle === "none"
    ? {}
    : {
        initial: { opacity: 0, y: lc.animationStyle === "dramatic" ? 20 : 10 },
        animate: { opacity: 1, y: 0 },
        transition: { delay, duration: ... },
      };

// Usage:
<motion.div {...anim(0.15)}>...</motion.div>
```

When `none` is selected, the function returns an empty object (`{}`), so elements render without any motion.

---

## 17. Spacing & Density System

### Content Density

| Density       | Padding Classes                | Description                    |
|---------------|--------------------------------|--------------------------------|
| `compact`     | `px-3 md:px-4 lg:px-6`        | Tight margins, more on screen  |
| `comfortable` | `px-4 md:px-6 lg:px-8`        | Standard balanced spacing      |
| `spacious`    | `px-6 md:px-8 lg:px-12`       | Generous margins, luxurious    |

### Card Gap

| Gap     | CSS Classes      | Description                       |
|---------|------------------|-----------------------------------|
| `tight` | `gap-1`          | Cards touch almost, very dense     |
| `normal`| `gap-2 md:gap-3` | Standard comfortable spacing       |
| `wide`  | `gap-4 md:gap-5` | Large gaps between cards            |

Both settings affect the **MenuList** component and all section containers.

---

## 18. Extra Sections — Promo, Featured, Social Proof, Footer

These are **optional sections** that are hidden by default but can be enabled from the Section Order panel.

### Promo Banner

| Field              | Type   | Default                                 |
|--------------------|--------|-----------------------------------------|
| `promoBannerText`  | text   | `🎉 Happy Hour: 20% off all drinks!`    |
| `promoBannerSubtext`| text  | `Today until 6 PM`                       |
| `promoBannerBgColor`| color | `#F4B400` (Gold)                         |
| `promoBannerTextColor`| color| `#FFFFFF` (White)                        |

### Featured Section

| Field                    | Type   | Default                                    |
|--------------------------|--------|--------------------------------------------|
| `featuredSectionTitle`   | text   | `Chef's Specials`                          |
| `featuredSectionSubtitle`| text   | `Hand-picked dishes our chef recommends`    |

Shows the first 5 popular products in a carousel, grid, or banner format.

### Social Proof

| Field              | Type   | Default                   |
|--------------------|--------|---------------------------|
| `socialProofText`  | text   | `Loved by our guests`     |
| `socialProofRating`| text   | `4.8`                     |
| `socialProofCount` | text   | `2,400+ reviews`          |

### Footer

| Field           | Type   | Default                          |
|-----------------|--------|----------------------------------|
| `footerText`    | text   | `Made with ❤️ by Bella Cucina`   |
| `footerSubtext` | text   | `© 2025 All rights reserved`     |
| `footerBgColor` | color  | `#1E1E1E` (Dark)                 |
| `footerTextColor`| color | `#FFFFFF` (White)                |

---

## 19. Current Data Flow (Local Mode)

### Write Path (Admin → Store → localStorage)
```
Admin Form "Save Changes"
  → updatePageContent(form) + updateComponentStyles(styles)
    → Zustand set() updates state immutably
      → persist middleware serializes to localStorage["bella-cucina-cms"]
```

### Read Path (Store → Frontend)
```
Any public page component
  → const { pageContent, componentStyles, ... } = useCmsData()
    → Hook checks hydration flag (useState/useEffect pattern)
    → SSR / first render: returns static defaults (from restaurants.ts + defaultComponentStyles)
    → After hydration: returns live data from Zustand store (merged with defaults)
```

### Reset Path
```
Admin "Reset to Defaults" button
  → Confirmation modal
    → useCmsStore.getState().resetToDefaults()
      → Zustand set() overwrites ALL state with defaults
        → localStorage is updated via persist middleware
```

### Hydration Safety

The `useCmsData()` hook handles the SSR/client hydration mismatch:

```tsx
export function useCmsData() {
  const [hydrated, setHydrated] = useState(false);  // false during SSR

  useEffect(() => {
    setHydrated(true);  // true after client-side mount
  }, []);

  // Before hydration → static data (matches server-rendered HTML)
  // After hydration  → live CMS store data (may differ from server HTML)
  const restaurant = hydrated ? storeRestaurant : fallbackRestaurant;

  // ComponentStyles always merges with defaults (handles newly added properties)
  const componentStyles = hydrated
    ? { ...defaultComponentStyles, ...storeComponentStyles }
    : defaultComponentStyles;

  return { restaurant, categoryConfig, products, categoryIcons, pageContent, componentStyles };
}
```

**Why merge with defaults:** When new properties are added to `ComponentStyles` (like in a future update), older localStorage data won't have them. The spread `{ ...defaultComponentStyles, ...storeComponentStyles }` ensures new defaults are always present while preserving user overrides.

---

## 20. Supabase Migration — Database Schema

When migrating from localStorage to Supabase, create these tables:

### 11.1 Core Tables

```sql
-- ═══════════════════════════════════════════════════════════
-- TABLE: restaurant (single row — restaurant info)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE restaurant (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Bella Cucina',
  tagline TEXT,
  hero_image TEXT,
  logo TEXT,
  address TEXT,
  open_hours TEXT,
  wifi_password TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- TABLE: categories
-- ═══════════════════════════════════════════════════════════
CREATE TABLE categories (
  id TEXT PRIMARY KEY,            -- e.g. "pasta", "pizza"
  label TEXT NOT NULL,
  icon TEXT DEFAULT '🍽️',
  color TEXT DEFAULT 'from-amber-400 to-orange-500',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- TABLE: products
-- ═══════════════════════════════════════════════════════════
CREATE TABLE products (
  id TEXT PRIMARY KEY,            -- e.g. "margherita-pizza"
  restaurant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image TEXT,
  category TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  popular BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- TABLE: addons (child of products)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE addons (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- TABLE: page_content (single row — all text fields)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE page_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- TABLE: component_styles (single row — all design properties)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE component_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

> **Note:** `page_content` and `component_styles` use `JSONB` columns because they contain
> many fields that may change over time. This makes the schema flexible — adding a new CMS
> field doesn't require a migration, just a new key in the JSON object.

### 11.2 Indexes

```sql
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_popular ON products(popular) WHERE popular = true;
CREATE INDEX idx_addons_product ON addons(product_id);
CREATE INDEX idx_categories_sort ON categories(sort_order);
```

### 11.3 Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE restaurant ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_styles ENABLE ROW LEVEL SECURITY;

-- ── Public READ access (anyone can view the menu) ──
CREATE POLICY "Public read restaurant"
  ON restaurant FOR SELECT USING (true);

CREATE POLICY "Public read categories"
  ON categories FOR SELECT USING (true);

CREATE POLICY "Public read products"
  ON products FOR SELECT USING (true);

CREATE POLICY "Public read addons"
  ON addons FOR SELECT USING (true);

CREATE POLICY "Public read page_content"
  ON page_content FOR SELECT USING (true);

CREATE POLICY "Public read component_styles"
  ON component_styles FOR SELECT USING (true);

-- ── Admin WRITE access (authenticated users with admin role) ──
CREATE POLICY "Admin write restaurant"
  ON restaurant FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin write categories"
  ON categories FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin write products"
  ON products FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin write addons"
  ON addons FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin write page_content"
  ON page_content FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin write component_styles"
  ON component_styles FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

### 11.4 Seed Data

After creating the tables, seed them with the current default data:

```sql
-- Seed restaurant
INSERT INTO restaurant (name, tagline, hero_image, logo, address, open_hours, wifi_password, phone)
VALUES (
  'Bella Cucina',
  'Authentic Italian Dining Experience',
  '/images/hero.jpg',
  '/images/logo.png',
  '123 Via Roma, Italian Quarter',
  '10:00 AM - 11:00 PM',
  'BellaCucina2024',
  '+1 (555) 123-4567'
);

-- Seed page_content with all defaults
INSERT INTO page_content (data) VALUES ('{
  "welcomeTitle": "Welcome! 👋",
  "welcomeDescription": "Browse our menu and tap to order. Your waiter will bring everything to your table.",
  "dineInLabel": "Dine-in",
  "searchPlaceholder": "Search dishes, ingredients...",
  "currencySymbol": "$",
  "popularBadgeText": "🔥 Popular",
  "customizableBadgeText": "Customizable",
  "orderBarViewText": "View Order",
  "orderBarItemAddedText": "item(s) added",
  "cartTitle": "Your Order",
  "emptyCartTitle": "No items yet",
  "emptyCartDescription": "Browse our menu and add your favorite dishes to start your order",
  "browseMenuText": "Browse Menu",
  "addMoreItemsText": "Add more items",
  "orderSummaryTitle": "Order Summary",
  "dineInServiceNote": "Dine-in — no service charge",
  "placeOrderText": "Place Order",
  "clearButtonText": "Clear"
}'::jsonb);

-- Seed component_styles with all defaults
INSERT INTO component_styles (data) VALUES ('{
  "heroHeight": "normal",
  "heroTextAlign": "left",
  "heroOverlay": "dark",
  "infoBarBgColor": "#FFFFFF",
  "infoBarTextColor": "#1E1E1E",
  "infoBarVisible": true,
  "cardLayout": "horizontal",
  "cardImagePosition": "left",
  "cardBgColor": "#FFFFFF",
  "cardTitleColor": "#1E1E1E",
  "cardDescriptionColor": "#777777",
  "cardPriceColor": "#F4B400",
  "cardBorderRadius": "xl",
  "cardShadow": "sm",
  "sectionTitleAlign": "left",
  "sectionTitleColor": "#1E1E1E",
  "sectionSubtitleColor": "#777777",
  "sectionShowDivider": true,
  "sectionShowIcon": true,
  "sectionDividerColor": "#F4B400",
  "categoryBarBgColor": "#FFFFFF",
  "categoryBarSticky": true,
  "orderBarStyle": "gradient",
  "orderBarBgColor": "#F4B400",
  "orderBarTextColor": "#FFFFFF",
  "productCardBgColor": "#FFFFFF",
  "productTitleColor": "#1E1E1E",
  "productDescriptionColor": "#777777",
  "productPriceColor": "#F4B400",
  "productImagePosition": "left",
  "cartPageBgColor": "#F7F7F7",
  "cartCardBgColor": "#FFFFFF",
  "cartTitleColor": "#1E1E1E",
  "cartAccentColor": "#F4B400",
  "checkoutPageBgColor": "#F7F7F7",
  "checkoutCardBgColor": "#FFFFFF",
  "checkoutAccentColor": "#F4B400",
  "menuPageBgColor": "#FFFFFF",
  "buttonStyle": "rounded"
}'::jsonb);
```

---

## 21. Supabase Migration — API Routes

Create these Next.js API routes to act as a bridge between the admin panel and Supabase:

### 12.1 Supabase Client Setup

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Public client (used in browser — respects RLS)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Admin client (server-side only — bypasses RLS)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

### 12.2 API Route Structure

```
src/app/api/
├── restaurant/
│   └── route.ts              # GET (public) + PUT (admin)
├── categories/
│   ├── route.ts              # GET (public) + POST (admin)
│   └── [id]/
│       └── route.ts          # PUT + DELETE (admin)
├── products/
│   ├── route.ts              # GET (public) + POST (admin)
│   └── [id]/
│       └── route.ts          # PUT + DELETE (admin)
├── page-content/
│   └── route.ts              # GET (public) + PUT (admin)
├── component-styles/
│   └── route.ts              # GET (public) + PUT (admin)
└── upload/
    └── route.ts              # POST — image upload to Supabase Storage
```

### 12.3 Example: Restaurant Route

```typescript
// src/app/api/restaurant/route.ts
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// ── Public — GET restaurant info ──
export async function GET() {
  const { data, error } = await supabase
    .from('restaurant')
    .select('*')
    .limit(1)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// ── Admin — UPDATE restaurant info ──
export async function PUT(request: Request) {
  const body = await request.json();

  const { data, error } = await supabaseAdmin
    .from('restaurant')
    .update({
      name: body.name,
      tagline: body.tagline,
      hero_image: body.image,
      logo: body.logo,
      address: body.address,
      open_hours: body.openHours,
      wifi_password: body.wifi,
      phone: body.phone,
      updated_at: new Date().toISOString(),
    })
    .eq('id', body.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
```

### 12.4 Example: Products Route (with addons)

```typescript
// src/app/api/products/route.ts
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  const { data, error } = await supabase
    .from('products')
    .select('*, addons(*)')
    .order('name');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { addons, ...product } = body;

  // Insert product
  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({
      id: product.id,
      restaurant_id: product.restaurantId,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category,
      popular: product.popular || false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Insert addons if any
  if (addons?.length) {
    const { error: addonError } = await supabaseAdmin
      .from('addons')
      .insert(addons.map((a: { id: string; name: string; price: number }) => ({
        id: a.id,
        product_id: data.id,
        name: a.name,
        price: a.price,
      })));

    if (addonError) console.error('Addon insert error:', addonError);
  }

  return NextResponse.json(data, { status: 201 });
}
```

### 12.5 Example: Page Content Route

```typescript
// src/app/api/page-content/route.ts
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  const { data, error } = await supabase
    .from('page_content')
    .select('data')
    .limit(1)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data?.data || {});
}

export async function PUT(request: Request) {
  const body = await request.json();

  // Merge with existing data (so partial updates work)
  const { data: existing } = await supabaseAdmin
    .from('page_content')
    .select('id, data')
    .limit(1)
    .single();

  if (!existing) return NextResponse.json({ error: 'No page_content row' }, { status: 404 });

  const { data, error } = await supabaseAdmin
    .from('page_content')
    .update({
      data: { ...existing.data, ...body },
      updated_at: new Date().toISOString(),
    })
    .eq('id', existing.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data?.data);
}
```

### 12.6 Example: Component Styles Route

```typescript
// src/app/api/component-styles/route.ts
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  const { data, error } = await supabase
    .from('component_styles')
    .select('data')
    .limit(1)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data?.data || {});
}

export async function PUT(request: Request) {
  const body = await request.json();

  const { data: existing } = await supabaseAdmin
    .from('component_styles')
    .select('id, data')
    .limit(1)
    .single();

  if (!existing) return NextResponse.json({ error: 'No component_styles row' }, { status: 404 });

  const { data, error } = await supabaseAdmin
    .from('component_styles')
    .update({
      data: { ...existing.data, ...body },
      updated_at: new Date().toISOString(),
    })
    .eq('id', existing.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data?.data);
}
```

---

## 22. Supabase Migration — Updated CMS Store

Replace the `persist` middleware with Supabase API calls. The store pattern stays the same — `Zustand` for client-side reactivity, but mutations now write to the database:

```typescript
// src/store/cmsStore.ts (SUPABASE VERSION)
"use client";

import { create } from "zustand";
import {
  RestaurantInfo,
  CategoryInfo,
  ProductItem,
  PageContent,
  ComponentStyles,
} from "@/types/cms";
import { defaultPageContent, defaultComponentStyles } from "./defaults";
// ↑ Extract defaults to a separate file or keep them here

interface CmsState {
  // ── State ──
  restaurant: RestaurantInfo;
  categories: CategoryInfo[];
  products: ProductItem[];
  pageContent: PageContent;
  componentStyles: ComponentStyles;
  isLoading: boolean;

  // ── Initialize (fetch all from Supabase) ──
  initialize: () => Promise<void>;

  // ── Restaurant ──
  updateRestaurant: (data: Partial<RestaurantInfo>) => Promise<void>;

  // ── Categories ──
  addCategory: (cat: CategoryInfo) => Promise<void>;
  updateCategory: (id: string, data: Partial<CategoryInfo>) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  reorderCategories: (categories: CategoryInfo[]) => Promise<void>;

  // ── Products ──
  addProduct: (product: ProductItem) => Promise<void>;
  updateProduct: (id: string, data: Partial<ProductItem>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;

  // ── Page Content & Styles ──
  updatePageContent: (data: Partial<PageContent>) => Promise<void>;
  updateComponentStyles: (data: Partial<ComponentStyles>) => Promise<void>;
}

export const useCmsStore = create<CmsState>()((set, get) => ({
  // ── Initial state (empty until initialized) ──
  restaurant: {} as RestaurantInfo,
  categories: [],
  products: [],
  pageContent: { ...defaultPageContent },
  componentStyles: { ...defaultComponentStyles },
  isLoading: true,

  // ── Fetch everything from Supabase ──
  initialize: async () => {
    set({ isLoading: true });
    try {
      const [resRes, catRes, prodRes, pcRes, csRes] = await Promise.all([
        fetch('/api/restaurant'),
        fetch('/api/categories'),
        fetch('/api/products'),
        fetch('/api/page-content'),
        fetch('/api/component-styles'),
      ]);

      const restaurant = await resRes.json();
      const categories = await catRes.json();
      const products = await prodRes.json();
      const pageContent = await pcRes.json();
      const componentStyles = await csRes.json();

      set({
        restaurant: {
          name: restaurant.name,
          tagline: restaurant.tagline,
          image: restaurant.hero_image,
          logo: restaurant.logo,
          address: restaurant.address,
          openHours: restaurant.open_hours,
          wifi: restaurant.wifi_password,
          phone: restaurant.phone,
        },
        categories: categories.map((c: Record<string, unknown>) => ({
          id: c.id,
          label: c.label,
          icon: c.icon,
          color: c.color,
        })),
        products: products.map((p: Record<string, unknown>) => ({
          id: p.id,
          restaurantId: p.restaurant_id,
          name: p.name,
          description: p.description,
          price: Number(p.price),
          image: p.image,
          category: p.category,
          popular: p.popular,
          addons: (p.addons as Array<Record<string, unknown>> || []).map(
            (a) => ({ id: a.id, name: a.name, price: Number(a.price) })
          ),
        })),
        pageContent: { ...defaultPageContent, ...pageContent },
        componentStyles: { ...defaultComponentStyles, ...componentStyles },
        isLoading: false,
      });
    } catch (err) {
      console.error('CMS initialization failed:', err);
      set({ isLoading: false });
    }
  },

  // ── Update restaurant (optimistic + API) ──
  updateRestaurant: async (data) => {
    const prev = get().restaurant;
    set({ restaurant: { ...prev, ...data } });  // Optimistic

    const res = await fetch('/api/restaurant', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...prev, ...data }),
    });

    if (!res.ok) {
      console.error('Failed to update restaurant');
      set({ restaurant: prev });  // Rollback on failure
    }
  },

  // ── Update page content (optimistic + API) ──
  updatePageContent: async (data) => {
    const prev = get().pageContent;
    set({ pageContent: { ...prev, ...data } });

    const res = await fetch('/api/page-content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      console.error('Failed to update page content');
      set({ pageContent: prev });
    }
  },

  // ── Update component styles (optimistic + API) ──
  updateComponentStyles: async (data) => {
    const prev = get().componentStyles;
    set({ componentStyles: { ...prev, ...data } });

    const res = await fetch('/api/component-styles', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      console.error('Failed to update component styles');
      set({ componentStyles: prev });
    }
  },

  // ... (addCategory, updateCategory, removeCategory, reorderCategories,
  //      addProduct, updateProduct, removeProduct follow the same pattern:
  //      optimistic local update + API call + rollback on error)
}));
```

**Pattern: Optimistic Updates**

Every mutation follows this pattern for instant UI feedback:
1. Read current state with `get()`
2. Apply the change locally with `set()` (user sees immediate update)
3. Send the change to the API
4. If the API fails, **rollback** to the previous state and show an error

---

## 23. Supabase Migration — Updated useCmsData Hook

```typescript
// src/hooks/useCmsData.ts (SUPABASE VERSION)
"use client";

import { useEffect } from "react";
import { useCmsStore } from "@/store/cmsStore";
import { defaultComponentStyles, defaultPageContent } from "@/store/defaults";
import { supabase } from "@/lib/supabase";

export function useCmsData() {
  const store = useCmsStore();

  useEffect(() => {
    // Fetch all CMS data from Supabase on mount
    store.initialize();

    // ── Optional: Real-time subscriptions ──
    // Listen for changes from other admin users or tabs
    const channel = supabase
      .channel('cms-realtime')
      .on('postgres_changes', {
        event: '*',          // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'restaurant',
      }, () => store.initialize())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'categories',
      }, () => store.initialize())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'products',
      }, () => store.initialize())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'page_content',
      }, () => store.initialize())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'component_styles',
      }, () => store.initialize())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Build categoryIcons map from categories
  const categoryIcons: Record<string, string> = Object.fromEntries(
    store.categories
      .filter((c) => c.id !== 'all' && c.id !== 'popular')
      .map((c) => [c.label, c.icon])
  );

  return {
    restaurant: store.restaurant,
    categoryConfig: store.categories,
    products: store.products,
    categoryIcons,
    pageContent: { ...defaultPageContent, ...store.pageContent },
    componentStyles: { ...defaultComponentStyles, ...store.componentStyles },
    isLoading: store.isLoading,
  };
}
```

**Key differences from local version:**
- No `hydrated` state — data is fetched asynchronously, `isLoading` replaces it
- Real-time subscriptions auto-refresh when another admin changes data
- The hook still merges defaults with stored data for forward-compatibility

---

## 24. Supabase Migration — Image Storage

### 15.1 Create Storage Bucket

In Supabase Dashboard → **Storage** → **New Bucket**:
- Bucket name: `menu-images`
- Public: **Yes** (images need to be publicly accessible)
- File size limit: 5 MB
- Allowed MIME types: `image/jpeg, image/png, image/webp, image/avif`

### 15.2 Storage Policies

```sql
-- Anyone can view images
CREATE POLICY "Public read images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'menu-images');

-- Only authenticated users can upload/delete
CREATE POLICY "Admin upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admin delete images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');
```

### 15.3 Upload API Route

```typescript
// src/app/api/upload/route.ts
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Generate unique filename
  const ext = file.name.split('.').pop();
  const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;

  const { data, error } = await supabaseAdmin.storage
    .from('menu-images')
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get the public URL
  const { data: urlData } = supabaseAdmin.storage
    .from('menu-images')
    .getPublicUrl(data.path);

  return NextResponse.json({ url: urlData.publicUrl });
}
```

### 15.4 Using the Upload in Admin

Add an image upload component to the restaurant, products, and hero editors:

```tsx
// Example: Image upload button
async function handleImageUpload(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload', { method: 'POST', body: formData });
  const { url } = await res.json();
  return url;  // Use this URL in the product/restaurant image field
}
```

Replace the current "Image URL" text inputs with a drag-and-drop or file picker that:
1. Accepts the file
2. Uploads to Supabase Storage via `/api/upload`
3. Receives the public URL back
4. Sets it as the image value in the CMS store

---

## 25. Supabase Migration — Authentication

### 16.1 Current State
No authentication. `/admin` is accessible to anyone with the URL.

### 16.2 Setup Steps

1. **Create admin user** in Supabase Dashboard → Authentication → Users → "Add User":
   - Email: `admin@yourdomain.com`
   - Password: (choose a strong password)

2. **Install auth helpers:**
   ```bash
   npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/ssr
   ```

3. **Create middleware to protect admin routes:**

```typescript
// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  // Protect all /admin routes except /admin/login
  if (
    req.nextUrl.pathname.startsWith('/admin') &&
    !req.nextUrl.pathname.startsWith('/admin/login')
  ) {
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
};
```

4. **Create login page:**

```tsx
// src/app/admin/login/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-soft p-8 w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-dark">Admin Login</h1>
          <p className="text-sm text-muted mt-1">Sign in to manage your restaurant</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-4 py-3 bg-bg border border-primary/10 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full px-4 py-3 bg-bg border border-primary/10 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-primary to-amber-500 text-white font-bold rounded-2xl shadow-glow hover:brightness-105 transition disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
```

5. **Add sign-out button** to the admin sidebar:

```tsx
async function handleSignOut() {
  await supabase.auth.signOut();
  window.location.href = '/admin/login';
}
```

---

## 26. Coolify Deployment

### 17.1 What is Coolify?

[Coolify](https://coolify.io) is a self-hosted, open-source alternative to Vercel/Netlify. You install it on your own VPS (e.g. Hetzner, DigitalOcean, Linode) and it handles:
- Git-based deployments (auto-deploy on push)
- SSL certificates (Let's Encrypt)
- Docker container management
- Environment variable management
- Domain routing

### 17.2 Prerequisites

- A VPS with at least 2 GB RAM and 2 vCPUs
- A domain name pointed to your server's IP
- Coolify installed on the VPS (one-command install: `curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash`)
- A Supabase project (cloud or self-hosted)

### 17.3 Dockerfile

Create a Dockerfile in the project root:

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# ── Dependencies ──
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ── Builder ──
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build args become env vars during build
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ── Runner ──
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### 17.4 Next.js Config for Standalone

Update `next.config.js` to enable standalone output:

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',  // ← Required for Docker deployment
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',  // Allow Supabase Storage images
      },
    ],
  },
};

module.exports = nextConfig;
```

### 17.5 Coolify Setup Steps

1. **Log into Coolify** at `https://your-server-ip:8000`
2. **Add a new resource** → **Application** → **Docker-based**
3. **Connect your Git repository** (GitHub, GitLab, or Bitbucket)
4. **Configure:**
   - Build pack: **Dockerfile**
   - Port: `3000`
   - Domain: `menu.yourdomain.com`
   - SSL: **Enabled** (auto Let's Encrypt)
5. **Add environment variables:**
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://your-project.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (your anon key)
   - `SUPABASE_SERVICE_ROLE_KEY` = (your service role key)
   - `NODE_ENV` = `production`
6. **Add build arguments** (for `NEXT_PUBLIC_*` vars — they're needed at build time):
   - `NEXT_PUBLIC_SUPABASE_URL` = same as above
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = same as above
7. **Deploy** — Coolify will pull the repo, build the Docker image, and start the container
8. **Enable auto-deploy** (optional) — Coolify can webhook to GitHub to auto-deploy on push

### 17.6 Custom Domain DNS

Point your domain to the Coolify server:
```
Type: A
Name: menu (or @)
Value: YOUR_SERVER_IP
TTL: 300
```

---

## 27. Environment Variables

### Development (.env.local)

```env
# ── Supabase ──
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiI...your-anon-key

# Server-side only (NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiI...your-service-role-key

# ── Optional ──
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=menu-images
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Production (Coolify Dashboard → Environment Variables)

Same as above, but with production Supabase URL and keys. Also add:
```env
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://menu.yourdomain.com
```

### Variable Reference

| Variable                              | Public? | Required | Description                           |
|---------------------------------------|---------|----------|---------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`            | Yes     | Yes      | Your Supabase project URL             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`       | Yes     | Yes      | Public anon key (respects RLS)        |
| `SUPABASE_SERVICE_ROLE_KEY`           | **No**  | Yes      | Server-only admin key (bypasses RLS)  |
| `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` | Yes     | No       | Storage bucket name (default: menu-images) |
| `NEXT_PUBLIC_BASE_URL`                | Yes     | No       | Public URL of the deployed app         |
| `NODE_ENV`                            | No      | No       | `production` in Coolify, `development` locally |

---

## 28. Step-by-Step Migration Checklist

### Phase 1: Supabase Project Setup
- [ ] Create project at [supabase.com](https://supabase.com) (or self-host)
- [ ] Run all SQL from [Section 11](#11-supabase-migration--database-schema) in SQL Editor
- [ ] Verify all 6 tables exist: `restaurant`, `categories`, `products`, `addons`, `page_content`, `component_styles`
- [ ] Verify RLS policies are active on all tables
- [ ] Seed the database with default data (run seed SQL from Section 11.4)
- [ ] Note your project URL and keys

### Phase 2: Storage Setup
- [ ] Create `menu-images` bucket in Supabase Storage
- [ ] Set bucket to Public
- [ ] Apply storage RLS policies from [Section 15](#15-supabase-migration--image-storage)

### Phase 3: Install Dependencies
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/ssr
```

### Phase 4: Create New Files
- [ ] Create `src/lib/supabase.ts` — Supabase client initialization ([Section 12.1](#121-supabase-client-setup))
- [ ] Create `src/middleware.ts` — Admin route protection ([Section 16](#16-supabase-migration--authentication))
- [ ] Create `src/app/admin/login/page.tsx` — Login page ([Section 16](#16-supabase-migration--authentication))
- [ ] Create `src/app/api/restaurant/route.ts` — Restaurant API
- [ ] Create `src/app/api/categories/route.ts` — Categories API (GET + POST)
- [ ] Create `src/app/api/categories/[id]/route.ts` — Category API (PUT + DELETE)
- [ ] Create `src/app/api/products/route.ts` — Products API (GET + POST)
- [ ] Create `src/app/api/products/[id]/route.ts` — Product API (PUT + DELETE)
- [ ] Create `src/app/api/page-content/route.ts` — Page content API
- [ ] Create `src/app/api/component-styles/route.ts` — Component styles API
- [ ] Create `src/app/api/upload/route.ts` — Image upload API
- [ ] Create `.env.local` with Supabase credentials

### Phase 5: Modify Existing Files
- [ ] Update `src/store/cmsStore.ts` — Replace `persist` with API calls ([Section 13](#13-supabase-migration--updated-cms-store))
- [ ] Update `src/hooks/useCmsData.ts` — Fetch from Supabase + real-time ([Section 14](#14-supabase-migration--updated-usecmsdata-hook))
- [ ] Update `next.config.js` — Add `output: 'standalone'` and Supabase image domains
- [ ] Update admin pages — Add loading states, error handling, async save indicators
- [ ] Update image inputs — Replace URL text inputs with file upload components
- [ ] Remove "Local Mode" badge from admin sidebar
- [ ] Add sign-out button to admin sidebar
- [ ] Create `Dockerfile` in project root ([Section 17.3](#173-dockerfile))

### Phase 6: Testing
- [ ] Test public menu loads all data from Supabase
- [ ] Test all design/layout properties render correctly
- [ ] Test admin login/logout flow
- [ ] Test restaurant editor → saves to Supabase
- [ ] Test categories editor → CRUD operations work
- [ ] Test products editor → CRUD + addons work
- [ ] Test text content editor → all 55+ fields save correctly
- [ ] Test design & layout editor → all 40+ properties save correctly
- [ ] Test image upload → files appear in Supabase Storage
- [ ] Test real-time updates (open two tabs, edit in one, verify the other updates)
- [ ] Test unauthorized access to `/admin` redirects to `/admin/login`
- [ ] Run `npm run build` — verify no build errors

### Phase 7: Deploy to Coolify
- [ ] Install Coolify on your VPS
- [ ] Connect Git repository
- [ ] Configure build settings (Dockerfile, port 3000)
- [ ] Set all environment variables + build args
- [ ] Configure domain and SSL
- [ ] Deploy and verify the live site
- [ ] Enable auto-deploy on git push (optional)
- [ ] Set up Supabase database backups

---

## 29. Troubleshooting

### "Data shows defaults instead of my edits"

**Local mode:** Clear localStorage and refresh. The data re-seeds from `restaurants.ts`.

**Supabase mode:** Check that `page_content` and `component_styles` tables have rows with your edits in the `data` JSONB column.

### "Design changes don't appear on the frontend"

1. Make sure you clicked **"Save Changes"** in the admin — the unsaved changes indicator should disappear
2. Refresh the public page — the `useCmsData()` hook reads from the store on mount
3. Check the browser console for errors
4. Verify the `componentStyles` object has your values: open DevTools → Console → `JSON.parse(localStorage.getItem('bella-cucina-cms')).state.componentStyles`

### "Colors don't match what I set in the admin"

Colors are applied via **inline styles** (`style={{ color: '...' }}`). If a Tailwind class is overriding it, add `!important` or check for conflicting classes. The inline style should take precedence in most cases.

### "Card layout doesn't change"

The `cardLayout` property controls `horizontal` vs `vertical`. The `cardImagePosition` only takes effect when `cardLayout` is `horizontal`. If you set `vertical`, the image is always on top.

### "EINVAL: invalid argument, readlink .next/package.json" (dev server)

This is a **OneDrive sync conflict** — Windows OneDrive locks files in the `.next` cache. Fix:

```powershell
cmd /c "rd /s /q .next 2>nul & timeout /t 2 >nul & npx next dev"
```

Or move the project outside of OneDrive.

### "Build fails with 'React Client Manifest' error"

Delete `.next` and `node_modules/.cache`, then rebuild:

```powershell
cmd /c "rd /s /q .next 2>nul & rd /s /q node_modules\.cache 2>nul"
npm run build
```

### "Supabase returns 'new row violates RLS policy'"

Your user is not authenticated, or the RLS policy requires a specific role. Check:
1. You are signed in (check `supabase.auth.getSession()`)
2. Your RLS policies allow the operation for authenticated users
3. For server-side operations, use `supabaseAdmin` (service role key) instead of the public client

### "Images don't load after uploading to Supabase Storage"

1. Verify the `menu-images` bucket is set to **Public**
2. Check the image URL format: `https://your-project.supabase.co/storage/v1/object/public/menu-images/filename.jpg`
3. Verify `next.config.js` has the Supabase hostname in `images.remotePatterns`

---

## Quick Reference

| Feature                | URL              | Description                                |
|------------------------|------------------|--------------------------------------------|
| Menu                   | `/`              | Public restaurant menu with all CMS styles |
| Product Detail         | `/product/[id]`  | Individual item page                       |
| Cart                   | `/cart`          | Shopping cart with dynamic colors           |
| Checkout               | `/checkout`      | Order review with dynamic colors            |
| Admin Dashboard        | `/admin`         | Stats overview & quick actions              |
| Restaurant Editor      | `/admin/restaurant` | Edit restaurant info + hero preview      |
| Categories Editor      | `/admin/categories` | Manage menu categories                   |
| Products Editor        | `/admin/products`   | Manage menu items & addons               |
| Text Content Editor    | `/admin/page-content` (Tab 1) | Edit 55+ text fields          |
| Design & Layout Editor | `/admin/page-content` (Tab 2) | Edit 40+ visual properties    |
| Admin Login            | `/admin/login`   | *(Future)* Authentication page              |

---

*Last updated: 2025*
*Current status: Local Mode (localStorage)*
*CMS capabilities: 55+ text fields, 40+ design properties, 4 CRUD editors*
*Next milestone: Supabase database + Coolify self-hosted deployment*
