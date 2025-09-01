# Fuwari Sweet Shop - Internationalization (i18n) Guide

This project implements multilingual support using Next.js built-in Internationalization features and next-intl.

## 🌍 Supported Languages

- **Japanese (ja)** - Default language
- **English (en)** - Second language

## 🏗️ Project Structure

```
src/
├── app/
│   ├── [locale]/          # Language-specific pages
│   │   ├── layout.tsx     # Language-specific layout
│   │   ├── page.tsx       # Home page
│   │   ├── about/
│   │   ├── auth/
│   │   ├── products/
│   │   └── ...
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Root page (redirect)
│   └── api/              # API routes (language independent)
├── i18n/
│   ├── navigation.ts     # Internationalized navigation
│   ├── request.ts        # i18n configuration
│   └── routing.ts        # Routing configuration
├── components/
│   └── ui/
│       └── LanguageSwitcher.tsx  # Language switcher component
└── messages/
    ├── ja.json           # Japanese translations
    └── en.json           # English translations
```

## 🛠️ Usage

### Basic Translation Usage

```tsx
"use client";
import { useTranslations } from "next-intl";

export default function MyComponent() {
  const t = useTranslations();

  return (
    <div>
      <h1>{t("common.welcome")}</h1>
      <p>{t("home.subtitle")}</p>
    </div>
  );
}
```

### Creating Links

```tsx
import { Link } from "@/i18n/navigation";

export default function MyComponent() {
  return <Link href="/products">{t("common.products")}</Link>;
}
```

### Programmatic Navigation

```tsx
import { useRouter } from "@/i18n/navigation";

export default function MyComponent() {
  const router = useRouter();

  const handleNavigation = () => {
    router.push("/products");
  };

  return <button onClick={handleNavigation}>Go to Products</button>;
}
```

## 📝 How to Create New Pages

### 1. Create Page File

Create new pages inside `src/app/[locale]/`:

```tsx
// src/app/[locale]/shop/page.tsx
"use client";
import { useTranslations } from "next-intl";

export default function ShopPage() {
  const t = useTranslations();

  return (
    <div>
      <h1>{t("shop.title")}</h1>
      <p>{t("shop.description")}</p>
    </div>
  );
}
```

### 2. Add Translations

Add to `messages/ja.json`:

```json
{
  "shop": {
    "title": "ショップ",
    "description": "私たちの素晴らしい商品をご覧ください"
  }
}
```

Add to `messages/en.json`:

```json
{
  "shop": {
    "title": "Shop",
    "description": "Browse our amazing products"
  }
}
```

## 🌐 How to Add New Languages

### 1. Update Routing Configuration

Edit `src/i18n/routing.ts`:

```tsx
export const routing = defineRouting({
  locales: ["ja", "en", "ko"], // Add Korean
  defaultLocale: "ja",
  localePrefix: "as-needed",
});
```

### 2. Create Translation File

Create `messages/ko.json`:

```json
{
  "common": {
    "loading": "로딩 중...",
    "welcome": "안녕하세요",
    "login": "로그인",
    "signup": "회원가입"
  }
}
```

### 3. Update Layout Type Definition

Update type in `src/app/[locale]/layout.tsx`:

```tsx
if (!routing.locales.includes(locale as "ja" | "en" | "ko")) {
  notFound();
}
```

### 4. Update Language Switcher

Update `src/components/ui/LanguageSwitcher.tsx`:

```tsx
{
  lng === "ja"
    ? "日本語"
    : lng === "en"
    ? "English"
    : lng === "ko"
    ? "한국어"
    : lng;
}
```

## 🎯 Best Practices

### 1. Translation Key Naming Convention

```json
{
  "page": {
    "section": {
      "element": "Translation text"
    }
  }
}
```

### 2. Dynamic Content Translation

```tsx
const t = useTranslations();

// Translation with parameters
t("welcome.message", { name: user.name });

// Pluralization support
t("items.count", { count: items.length });
```

### 3. Usage in Server Components

```tsx
import { getTranslations } from "next-intl/server";

export default async function ServerComponent() {
  const t = await getTranslations();

  return <h1>{t("common.title")}</h1>;
}
```

## 🔧 Configuration Files

### middleware.ts

- Handles language routing
- Combines authentication and i18n
- Localizes protected routes

### next.config.ts

- Configures next-intl plugin
- Specifies translation file locations

## 🚀 URL Structure

```
/ → /ja (automatic redirect)
/en → English home page
/ja/products → Japanese products page
/en/products → English products page
/ja/auth/signin → Japanese login page
/en/auth/signin → English login page
```

## 🎨 Language Switching

Users can switch languages using the `LanguageSwitcher` component. It's recommended to place this component in the Header.

## 📱 Responsive Design

All translations are designed to display properly across all device sizes.

---

Follow this guide to easily add new pages and languages to Fuwari
