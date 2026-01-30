import { ModuleLayout } from "@/components/layout/module-layout";
import { StatsCard, StatsGrid } from "@/components/shared/stats-card";
import { RecentTable } from "@/components/shared/recent-table";
import { StatusBadge } from "@/components/shared/data-table";
import { libraryNavItems, useLibraryData } from "./library-data";
import { BookOpen, Users, BookMarked, AlertTriangle } from "lucide-react";

export default function LibraryDashboard() {
  const { books, members, issues } = useLibraryData();

  const totalBooks = books.length;
  const totalMembers = members.length;
  const issuedBooks = books.filter((b) => b.status === "Issued").length;
  const overdueBooks = issues.filter((i) => i.status === "Overdue").length;

  const recentIssues = issues
    .filter((i) => i.status !== "Returned")
    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
    .slice(0, 5);

  return (
    <ModuleLayout module="library" navItems={libraryNavItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold" data-testid="text-page-title">Library Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage books, members, and book issues</p>
        </div>

        <StatsGrid>
          <StatsCard
            title="Total Books"
            value={totalBooks}
            icon={BookOpen}
            iconColor="text-amber-500"
          />
          <StatsCard
            title="Total Members"
            value={totalMembers}
            icon={Users}
            iconColor="text-blue-500"
          />
          <StatsCard
            title="Books Issued"
            value={issuedBooks}
            icon={BookMarked}
            iconColor="text-green-500"
          />
          <StatsCard
            title="Overdue Books"
            value={overdueBooks}
            icon={AlertTriangle}
            iconColor="text-red-500"
          />
        </StatsGrid>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentTable
            title="Current Issues"
            data={recentIssues}
            columns={[
              { key: "bookTitle", label: "Book" },
              { key: "memberName", label: "Member" },
              { key: "dueDate", label: "Due Date" },
              {
                key: "status",
                label: "Status",
                render: (item) => <StatusBadge status={item.status} />,
              },
            ]}
            getRowKey={(item) => item.id}
          />

          <RecentTable
            title="Books by Category"
            data={[
              { category: "Mathematics", count: books.filter((b) => b.category === "Mathematics").length },
              { category: "English", count: books.filter((b) => b.category === "English").length },
              { category: "Science", count: books.filter((b) => b.category === "Science").length },
              { category: "Islamic", count: books.filter((b) => b.category === "Islamic").length },
              { category: "Computer", count: books.filter((b) => b.category === "Computer").length },
            ]}
            columns={[
              { key: "category", label: "Category" },
              { key: "count", label: "Books" },
            ]}
            getRowKey={(item) => item.category}
          />
        </div>
      </div>
    </ModuleLayout>
  );
}
