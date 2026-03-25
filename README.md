# MiniCMS

Publikační platforma postavená na **Next.js** (App Router) s Prisma ORM a NextAuth autentizací.

## Popis aplikace

MiniCMS je webová aplikace pro publikování článků s recenzním systémem. Uživatelé mohou vytvářet, editovat a publikovat články s WYSIWYG editorem, přidávat recenze s hvězdičkovým hodnocením a organizovat obsah pomocí kategorií.

## Datový model

```
User 1:N Article (autor článků)
User 1:N Review (autor recenzí)
Article 1:N Review (recenze článku)
Article N:M Category (kategorizace)
```

**Entity:**
- **User** – jméno, email, heslo (hashed)
- **Article** – title, slug, content, published, publishDate, createdAt, updatedAt
- **Review** – rating (0–5), comment, createdAt, updatedAt
- **Category** – name

## Funkce

### Veřejná část
- Seznam publikovaných článků (Server Component)
- Vyhledávání podle title/textu
- Filtrování podle kategorií
- Stránkování
- Detail článku s recenzemi
- SEO: dynamická metadata, OpenGraph, canonical URL, sitemap.xml, robots.txt

### Dashboard
- Seznam vlastních článků se stránkováním
- Vytvoření/editace článku s WYSIWYG editorem (React Quill)
- Smazání článku
- Přepínání draft/published
- Správa kategorií u článků
- Formulářová validace

### API
- CRUD operace pro články (`/api/article`)
- CRUD operace pro recenze (`/api/review`)
- Kategorie (`/api/category`)
- Kontrola přihlášení a vlastnictví dat
- Server-side validace

### Analytika
- Microsoft Clarity (podmíněno souhlasem s cookies)
- Cookie consent banner

### Next.js funkce
- `revalidate` / ISR na veřejných stránkách
- Dynamická metadata (`generateMetadata`)
- Dynamic routes (`/article/[id]`)

## Tech stack

- Next.js 16 (App Router)
- Prisma ORM + PostgreSQL
- NextAuth (credentials provider)
- React Bootstrap
- React Quill (WYSIWYG)
- Lucide React (ikony)

## Spuštění

```bash
# 1. Naklonovat repozitář
git clone <repo-url>
cd 2025-p4a-minicms-prchalvasak

# 2. Nainstalovat závislosti
npm install

# 3. Nastavit prostředí
cp .env.example .env
# Upravte .env – nastavte DATABASE_URL a AUTH_SECRET

# 4. Spustit migrace
npx prisma migrate dev

# 5. Naplnit databázi demo daty
npm run db:seed

# 6. Spustit vývojový server
npm run dev
```

