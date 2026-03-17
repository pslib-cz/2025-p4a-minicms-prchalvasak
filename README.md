# MiniCMS

MiniCMS je jednoduchý redakční systém postavený na `Next.js App Router`, `Prisma`, `PostgreSQL` a `NextAuth`. Projekt obsahuje veřejnou část se seznamem článků a detail článku s recenzemi, plus interní dashboard autora.

## Hotové funkce

- veřejná homepage s vyhledáváním podle title/textu
- filtrování článků podle kategorií
- stránkování na homepage i v dashboardu
- detail článku s dynamickými metadata, Open Graph a canonical URL
- `sitemap.xml` a `robots.txt`
- ISR přes `revalidate` pro veřejný detail článku
- `next/image` na homepage
- dashboard vlastního obsahu
- mazání článku přes server action v dashboardu
- seed script s kategoriemi, více články a demo účty

## Lokální spuštění

1. Nainstalujte závislosti:

```bash
npm install
```

2. Vytvořte lokální konfiguraci:

```bash
cp .env.example .env
```

3. Upravte `DATABASE_URL`, `AUTH_SECRET` a případně `NEXT_PUBLIC_APP_URL`.

4. Proveďte migrace a naplňte databázi:

```bash
npx prisma migrate dev
npm run db:seed
```

5. Spusťte development server:

```bash
npm run dev
```

## Demo účet

- email: `datovy@tunatours.cz`
- heslo: `MiniCMS123!`

## Skripty

```bash
npm run dev
npm run build
npm run start
npm run db:seed
```

## Nasazení

Projekt je připravený pro nasazení na Vercel. Před deployem nastavte stejné proměnné prostředí jako lokálně:

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`

Po nasazení zkontrolujte:

- dostupnost `sitemap.xml` a `robots.txt`
- canonical URL v detailu článku
- homepage filtry a stránkování
- dashboard po přihlášení
