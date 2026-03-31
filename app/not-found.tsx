import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function NotFound() {
  return (
    <div className="page-wrapper">
      <Header />
      <main className="container not-found-page">
        <div className="not-found-code">404</div>
        <h1>Stránka nenalezena</h1>
        <p>
          Stránka, kterou hledáte, neexistuje nebo byla přesunuta.
        </p>
        <div className="not-found-actions">
          <Link href="/" className="btn btn-accent">
            Zpět na články
          </Link>
          <Link href="/dashboard" className="btn">
            Dashboard
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
