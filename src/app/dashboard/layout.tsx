import Header from "@/components/shell/Header";
import Sidebar from "@/components/shell/Sidebar";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <div>
        <Header />
        <div className="flex">
        <Sidebar />
        <main className="flex-1">
        {children}
        </main>
        </div>
    </div>
  )
}