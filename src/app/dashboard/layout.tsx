import Header from "@/components/shell/Header";
import Sidebar from "@/components/shell/Sidebar";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="flex">
        <Sidebar />
        <main className="flex-1">
        {children}
        </main>
        </div>
      </body>
    </html>
  )
}