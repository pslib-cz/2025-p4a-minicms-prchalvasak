import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function daysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function main() {
  await prisma.review.deleteMany();
  await prisma.article.deleteMany();
  await prisma.category.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("MiniCMS123!", 10);

  const author = await prisma.user.create({
    data: {
      name: "Datový Redaktor",
      email: "datovy@tunatours.cz",
      hashedPassword,
    },
  });

  const reviewer = await prisma.user.create({
    data: {
      name: "Druhý uživatel",
      email: "druhy@test.cz",
      hashedPassword,
    },
  });

  const categories = await Promise.all(
    ["Technologie", "Kultura", "Cestování", "Recenze"].map((name) =>
      prisma.category.create({
        data: { name },
      }),
    ),
  );

  const categoryMap = Object.fromEntries(
    categories.map((category) => [category.name, category.id]),
  ) as Record<string, string>;

  const articleDefinitions = [
    {
      title: "Jak malý redakční tým používá AI při přípravě článků",
      slug: "jak-maly-redakcni-tym-pouziva-ai",
      content:
        "Redakční workflow nemusí začínat draftem v Google Docs. U malého týmu funguje lépe jednoduchý CMS, ve kterém se rychle připraví kostra článku, zkontrolují metadata a hotový text jde rovnou do publikace. AI je tady užitečná hlavně při rešerši, návrzích osnov a kontrole srozumitelnosti textu, ne jako náhrada autora.",
      publishDate: daysFromNow(-18),
      authorId: author.id,
      categories: ["Technologie"],
    },
    {
      title: "Pět kulturních tipů na víkend v Brně",
      slug: "pet-kulturnich-tipu-na-vikend-v-brne",
      content:
        "Výstava, kino, komorní koncert, menší festival a jedna klidná kavárna na závěr. Tenhle výběr vznikl jako osobní doporučení pro čtenáře, kteří chtějí během víkendu projít město bez zbytečného plánování. Každý tip je krátký, konkrétní a snadno se z něj dá postavit celý sobotní program.",
      publishDate: daysFromNow(-15),
      authorId: author.id,
      categories: ["Kultura"],
    },
    {
      title: "Noční vlak do Berlína: co fungovalo a co ne",
      slug: "nocni-vlak-do-berlina-co-fungovalo-a-co-ne",
      content:
        "Cesta nočním vlakem má pořád svoje kouzlo, ale v praxi záleží na detailech. V článku je popsané odbavení, komfort kupé, kvalita snídaně i to, jak realistické jsou navazující přestupy po příjezdu. Výsledek není ani romantizace, ani stížnost, spíš poctivá zkušenost z jedné cesty.",
      publishDate: daysFromNow(-12),
      authorId: author.id,
      categories: ["Cestování", "Recenze"],
    },
    {
      title: "Má smysl psát kratší články pro homepage feed?",
      slug: "ma-smysl-psat-kratsi-clanky-pro-homepage-feed",
      content:
        "Krátký text může fungovat výborně, pokud je napsaný s jasným cílem. Čtenář na homepage nejdřív hledá orientaci a až potom hloubku. Proto se vyplatí oddělit úvodní perex, hlavní hodnotu textu a kontext, který si čtenář otevře až na detailu. Nejde o kompromis v kvalitě, ale o jinou distribuci informací.",
      publishDate: daysFromNow(-10),
      authorId: author.id,
      categories: ["Technologie", "Kultura"],
    },
    {
      title: "Recenze malého kinoprojektoru do domácího studia",
      slug: "recenze-maleho-kinoprojektoru-do-domaciho-studia",
      content:
        "Projektor sliboval jednoduché nastavení a tichý provoz, ale realita byla zajímavější. V recenzi je rozebraný jas, hluk ventilátoru, práce se subtitlem i to, jak moc se zařízení hodí do menší místnosti. Výsledek je dobrý, jen ne tak univerzální, jak slibují marketingové materiály.",
      publishDate: daysFromNow(-8),
      authorId: author.id,
      categories: ["Recenze", "Technologie"],
    },
    {
      title: "Jak psát recenze, které nejsou jen seznamem dojmů",
      slug: "jak-psat-recenze-ktere-nejsou-jen-seznamem-dojmu",
      content:
        "Nejčastější slabina recenzí není subjektivita, ale absence struktury. Pomáhá oddělit kontext, pozorování a verdikt. Čtenář pak snáz pochopí, proč autor k závěru došel a jestli je pro něj relevantní. Článek shrnuje jednoduchý postup, který se dá použít na filmy, knihy i techniku.",
      publishDate: daysFromNow(-5),
      authorId: author.id,
      categories: ["Recenze", "Kultura"],
    },
    {
      title: "Co si připravit před nasazením Next.js projektu na Vercel",
      slug: "co-si-pripravit-pred-nasazenim-nextjs-projektu-na-vercel",
      content:
        "Nasazení bývá nejrychlejší část práce, pokud jsou předem připravené environment proměnné, canonical URL, seed data a základní SEO soubory. Bez nich projekt sice běží, ale působí nedokončeně. Tenhle checklist vznikl přesně z opakovaných chyb, které se v menších studentských projektech vracejí.",
      publishDate: daysFromNow(-2),
      authorId: author.id,
      categories: ["Technologie"],
    },
    {
      title: "Rozhovor s kurátorkou o tom, proč malé galerie potřebují lepší web",
      slug: "rozhovor-s-kuratorkou-proc-male-galerie-potrebuji-lepsi-web",
      content:
        "Web malé galerie často supluje archiv, tiskové oddělení i první kontakt s návštěvníkem. V rozhovoru zaznívá, jak důležitá je srozumitelná navigace, aktuální obsah a čitelné informace o doprovodném programu. Když tohle chybí, ztrácí se návštěvníci ještě před tím, než na výstavu vůbec dorazí.",
      publishDate: daysFromNow(-1),
      authorId: reviewer.id,
      categories: ["Kultura"],
    },
    {
      title: "Plánovaný editorial o dlouhém formátu a práci s obsahem",
      slug: "planovany-editorial-o-dlouhem-formatu-a-praci-s-obsahem",
      content:
        "Tento článek je připravený jako budoucí publikace. Slouží hlavně k ověření dashboardu, stavů publikace a práce s obsahem, který ještě není veřejně dostupný na homepage ani v sitemap.",
      publishDate: daysFromNow(4),
      authorId: author.id,
      categories: ["Technologie"],
    },
  ] as const;

  const createdArticles = await Promise.all(
    articleDefinitions.map((article) =>
      prisma.article.create({
        data: {
          title: article.title,
          slug: article.slug,
          content: article.content,
          publishDate: article.publishDate,
          status: article.publishDate <= new Date() ? "PUBLISHED" : "DRAFT",
          authorId: article.authorId,
          categories: {
            connect: article.categories.map((name) => ({
              id: categoryMap[name],
            })),
          },
        },
      }),
    ),
  );

  const reviewTargets = [createdArticles[0], createdArticles[2], createdArticles[4]];

  await prisma.review.createMany({
    data: [
      {
        rating: 5,
        comment: "Přehledné, stručné a konečně praktické doporučení.",
        articleId: reviewTargets[0].id,
        authorId: reviewer.id,
      },
      {
        rating: 4,
        comment: "Dobrá zkušenost z cesty, ocenil bych ještě detailnější ceny.",
        articleId: reviewTargets[1].id,
        authorId: reviewer.id,
      },
      {
        rating: 2,
        comment: "Recenze je fajn, ale chybí srovnání s konkurencí.",
        articleId: reviewTargets[2].id,
        authorId: author.id,
      },
    ],
  });

  console.log("Seed complete.");
  console.log("Login: datovy@tunatours.cz / MiniCMS123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
