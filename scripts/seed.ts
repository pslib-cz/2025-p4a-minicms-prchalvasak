import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // Clean up existing data
    await prisma.review.deleteMany();
    await prisma.article.deleteMany();
    await prisma.account.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = "$2b$10$gYchWt4JKkHH1khcbVzMy.v2I.E7Or3A62nbuvVTWpQVTNKn3k5Si";
    const user = await prisma.user.create({
        data: {
            name: "Testovací účet",
            email: "datovy@tunatours.cz",
            hashedPassword,
        },
    });

    const user2 = await prisma.user.create({
        data: {
            name: "Druhý uživatel",
            email: "druhy@test.cz",
            hashedPassword,
        },
    });

    const article = await prisma.article.create({
        data: {
            title: "První zážitek s psychedeliky a znovuzrození mýtických postav z 13. století",
            content: "Jednoho krásného dne jsem se rozhodl, že si dám psychedelika. A co se nestalo? Všechno se změnilo. Viděl jsem barvy, které jsem nikdy předtím neviděl, a slyšel zvuky, které jsem nikdy předtím neslyšel. Bylo to jako znovuzrození. Pak jsem se probudil a uvědomil si, že jsem v 13. století. \"Je to jenom sen,\" řekl jsem si. Ale nebyl to sen..",
            slug: "prvni-zazitek-s-psychedeliky",
            publishDate: new Date(),
            authorId: user.id,
        },
    });

    await prisma.review.create({
        data: {
            rating: 5,
            comment: "Skvělý článek!",
            articleId: article.id,
            authorId: user2.id,
        },
    });

    await prisma.review.create({
        data: {
            rating: 0,
            comment: "ubohost.",
            articleId: article.id,
            authorId: user.id,
        },
    });

    console.log("Seed complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });