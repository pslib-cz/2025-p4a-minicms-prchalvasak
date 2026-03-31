import Link from "next/link";
import { APP_NAME } from "@/lib/brand";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container container-wide footer-inner">
        <div className="footer-brand">
          <span className="site-logo-icon">&#9670;</span>
          <span>{APP_NAME}</span>
        </div>
        <nav className="footer-links">
          <Link href="/">Články</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/article/new">Nový článek</Link>
        </nav>
        <p className="footer-copy">
          &copy; {new Date().getFullYear()} {APP_NAME}. Všechna práva vyhrazena.
        </p>
      </div>
    </footer>
  );
}
