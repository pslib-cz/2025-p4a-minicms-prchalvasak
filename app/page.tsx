import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>Zde brzy bude MiniCMS.</h1>
            <a href="https://cs.wikipedia.org/wiki/Syst%C3%A9m_pro_spr%C3%A1vu_obsahu">Co je to CMS?</a>
        </div>
      </main>
    </div>
  );
}
