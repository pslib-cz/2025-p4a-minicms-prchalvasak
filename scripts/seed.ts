import prisma from "@/lib/prisma";

async function main() {
    const user = await prisma.user.create({
        data: {
            name: "Datový Importér",
            email: "datovy.importer@pslib.cz",
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
    const review = await prisma.review.create({
        data: {
            rating: 5,
            comment: "Skvělý článek!",
            articleId: article.id,
        },
    });
    const review2 = await prisma.review.create({
        data: {
            rating: 0,
            comment: "ubohost.",
            articleId: article.id,
        },
    });
}

main();