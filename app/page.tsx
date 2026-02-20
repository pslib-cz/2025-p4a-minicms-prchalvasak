import prisma from "@/lib/prisma";
import Header from "./components/Header";

export default async function Home() {
  const articles = await prisma.article.findMany({
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <Header />
      <main style={{ padding: "16px" }}>
        <h2>Nejčtenější články</h2>
        {articles.length === 0 && <p>Žádné články</p>}
        {articles.map((article: any) => (
          <div key={article.id} style={{ marginBottom: "16px", padding: "12px", border: "1px solid #ddd" }}>
            <a href={`/article/${article.id}`}>
              <h3>{article.title}</h3>
            </a>
            <p>{article.content.substring(0, 150)}...</p>
            <small>Autor: {article.author.name} | {new Date(article.publishDate).toLocaleDateString("cs-CZ")}</small>
          </div>
        ))}
      </main>
    </div>
  );
}
