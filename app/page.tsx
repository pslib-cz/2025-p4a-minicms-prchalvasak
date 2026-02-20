import styles from "./page.module.css";
// api fetch

async function getAllArticles() {
  const res = await fetch("http://localhost:3000/api/article", { cache: "no-store" });
  return await res.json();
}

export default async function Home() {
  const articles = await getAllArticles();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>Nejčtenější články</h1>
          {articles.map((article: any) => (
            <a href={`/article/${article.id}`} key={article.id} className={styles.article}>
              <h2>{article.title}</h2>
              <p>{article.content.substring(0, 100) + "..."}</p>
              <p>{article.publishDate}</p>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
