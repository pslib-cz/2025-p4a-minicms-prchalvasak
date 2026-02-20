import styles from "./page.module.css";

async function getArticle(id: string) {
    const res = await fetch(`http://localhost:3000/api/article/${id}`, { cache: "no-store" });
    return await res.json();
}

export default async function Article({ params }: { params: { id: string } }) {
    const { id } = await params;
    const article = await getArticle(id);

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <div className={styles.intro}>
                    <h1>{article.title}</h1>
                    <h3 className={styles.author}>od {article.author.name}</h3>
                    <p>{article.content}</p>
                    <p>{article.publishDate}</p>
                </div>
                <div className={styles.comments}>
                    <h2>Komentáře</h2>
                    {article.comments.map((comment: any) => (
                        <div key={comment.id}>
                            <p>{comment.content}</p>
                            <p>{comment.author.name}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}