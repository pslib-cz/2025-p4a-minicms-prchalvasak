import { redirect } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import DashboardClient from "./DashboardClient";
import { auth } from "@/lib/auth";
import { parsePageParam } from "@/lib/site";

type DashboardPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const currentPage = parsePageParam(params.page);

  return (
    <div className="page-wrapper">
      <Header />
      <DashboardClient initialPage={currentPage} />
      <Footer />
    </div>
  );
}
