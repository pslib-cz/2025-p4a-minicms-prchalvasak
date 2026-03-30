# Inkline

Inkline je publikační webová aplikace postavená na `Next.js App Router`, `Prisma` a `Auth.js / NextAuth`. Obsahuje veřejnou část se seznamem a detailem článků, interní klientský dashboard pro správu vlastního obsahu a vlastní API přes Route Handlers.

## Datový model

### Hlavní entity

- `User`
- `Article`
- `Category`
- `Review`

### Povinné vztahy

- `User -> Article` je vazba `1:N`
- `Article <-> Category` je vazba `N:M`
- `User -> Review` je vazba `1:N`
- `Article -> Review` je vazba `1:N`

### Pole článku

- `title`
- `slug`
- `content`
- `createdAt`
- `updatedAt`
- `publishDate`
- `status` (`DRAFT | PUBLISHED`)

## Implementované funkce

### Veřejná část

- seznam publikovaných článků postavený přes Server Components
- detail článku na dynamické slug URL `/article/[slug]`
- vyhledávání podle názvu i textu článku
- filtrování podle kategorií
- stránkování
- dynamická metadata, Open Graph a canonical URL
- `sitemap.xml` a `robots.txt`
- `next/image` na homepage
- ISR / `revalidate` pro homepage
- detail článku jako dynamická serverová route `/article/[slug]`

### Dashboard a API

- přihlášení přes `Auth.js / NextAuth`
- dashboard dostupný jen po přihlášení
- klientský dashboard napojený na Route Handlers
- výpis pouze vlastních článků se stránkováním
- vytvoření, editace, smazání a změna statusu článku
- server-side validace vstupů
- kontrola vlastnictví dat v API
- práce s kategoriemi v editoru včetně vytvoření nové kategorie
- WYSIWYG editor pro obsah článku
- React Bootstrap jako dashboard UI knihovna

### Analytika a consent

- integrace Google Analytics 4
- tracking se zapíná až po udělení souhlasu
- aplikace zůstává plně funkční i bez povolené analytiky

## Lokální spuštění

1. Nainstalujte závislosti.

```bash
npm install
```

2. Vytvořte lokální konfiguraci.

```bash
cp .env.example .env
```

3. Nastavte proměnné prostředí:

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`
- volitelně `NEXT_PUBLIC_GA_ID`

4. Proveďte migrace a naplňte databázi demo daty.

```bash
npx prisma migrate dev
npm run db:seed
```

5. Spusťte development server.

```bash
npm run dev
```

## Demo účet

- email: `datovy@tunatours.cz`
- heslo: `Inkline123!`

## Skripty

```bash
npm run dev
npm run build
npm run lint
npm run start
npm run db:seed
```

## Nasazení

Projekt je připravený pro nasazení na Vercel. Před deployem nastavte stejné proměnné prostředí jako lokálně. Na produkci použijte PostgreSQL databázi.

### Po deployi dokončete mimo repo

- nasadit aplikaci na veřejnou URL
- nastavit `NEXT_PUBLIC_APP_URL` na produkční doménu
- přidat reálné `NEXT_PUBLIC_GA_ID`
- provést Lighthouse audit a uložit screenshot nebo poznámky
- zaregistrovat web do Google Search Console
- zaregistrovat web do Bing Webmaster Tools
