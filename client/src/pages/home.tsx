import { Link } from "wouter";
import { allModules } from "@/lib/module-config";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { GraduationCap, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b sticky top-0 z-50 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Emblazers</h1>
              <p className="text-xs text-muted-foreground">School Management System</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1">
        <section className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Complete School Management
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Manage students, staff, fees, attendance, exams, library, transport, hostel, and more with separate modules for every department.
            </p>
          </div>
        </section>

        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-xl font-semibold mb-6">Select a Module</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {allModules.map((module) => {
                const Icon = module.icon;
                return (
                  <Link key={module.id} href={module.loginPath} data-testid={`link-module-${module.id}`}>
                    <Card className="h-full hover-elevate active-elevate-2 cursor-pointer transition-all duration-200 group" data-testid={`card-module-${module.id}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className={`w-12 h-12 ${module.bgColor} rounded-lg flex items-center justify-center`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <CardTitle className="text-lg mt-3" data-testid={`text-module-title-${module.id}`}>{module.shortName}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="line-clamp-2" data-testid={`text-module-desc-${module.id}`}>
                          {module.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/50">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-xl font-semibold mb-6">Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium">Modular Design</h4>
                <p className="text-sm text-muted-foreground">
                  Each department has its own login, interface, and workflow. Complete separation for better security and usability.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Comprehensive Coverage</h4>
                <p className="text-sm text-muted-foreground">
                  From admissions to alumni, fee collection to payroll, attendance to exams - everything in one system.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Cross-Module Integration</h4>
                <p className="text-sm text-muted-foreground">
                  Student data flows to fees, attendance, library, transport, and hostel. Staff data connects to payroll and finance.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          Emblazers School Management System - Demo Version
        </div>
      </footer>
    </div>
  );
}
