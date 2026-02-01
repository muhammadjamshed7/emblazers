import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider } from "@/lib/auth";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";

import ModuleLoginPage from "@/pages/module-login";
import StudentDashboard from "@/pages/student/dashboard";
import StudentList from "@/pages/student/list";
import StudentAdd from "@/pages/student/add";
import StudentEdit from "@/pages/student/edit";
import StudentProfile from "@/pages/student/profile";
import StudentAlumni from "@/pages/student/alumni";
import StudentReports from "@/pages/student/reports";

import HrDashboard from "@/pages/hr/dashboard";
import HrList from "@/pages/hr/list";
import HrAdd from "@/pages/hr/add";
import HrProfile from "@/pages/hr/profile";
import HrVacancies from "@/pages/hr/vacancies";
import HrApplicants from "@/pages/hr/applicants";
import HrReports from "@/pages/hr/reports";

import FeeDashboard from "@/pages/fee/dashboard";
import FeeStructures from "@/pages/fee/structures";
import FeeChallans from "@/pages/fee/challans";
import FeePayments from "@/pages/fee/payments";
import FeeVouchers from "@/pages/fee/vouchers";
import FeeGenerate from "@/pages/fee/generate";
import FeeReports from "@/pages/fee/reports";

import PayrollDashboard from "@/pages/payroll/dashboard";
import PayrollList from "@/pages/payroll/list";
import PayrollGenerate from "@/pages/payroll/generate";
import PayrollReports from "@/pages/payroll/reports";

import FinanceDashboard from "@/pages/finance/dashboard";
import FinanceAccounts from "@/pages/finance/accounts";
import FinanceLedger from "@/pages/finance/ledger";
import FinanceExpenses from "@/pages/finance/expenses";
import FinanceVendors from "@/pages/finance/vendors";
import FinanceVouchers from "@/pages/finance/vouchers";
import FinanceReports from "@/pages/finance/reports";

import AttendanceDashboard from "@/pages/attendance/dashboard";
import AttendanceMark from "@/pages/attendance/mark";
import AttendanceRecords from "@/pages/attendance/records";
import AttendanceReports from "@/pages/attendance/reports";

import TimetableDashboard from "@/pages/timetable/dashboard";
import TimetableClass from "@/pages/timetable/class";
import TimetableTeacher from "@/pages/timetable/teacher";
import TimetableCreate from "@/pages/timetable/create";

import DateSheetDashboard from "@/pages/datesheet/dashboard";
import DateSheetList from "@/pages/datesheet/list";
import DateSheetCreate from "@/pages/datesheet/create";

import CurriculumDashboard from "@/pages/curriculum/dashboard";
import CurriculumSyllabus from "@/pages/curriculum/syllabus";
import CurriculumExams from "@/pages/curriculum/exams";
import CurriculumEntry from "@/pages/curriculum/entry";
import CurriculumReports from "@/pages/curriculum/reports";

import PosDashboard from "@/pages/pos/dashboard";
import PosSales from "@/pages/pos/sales";
import PosNew from "@/pages/pos/new";
import PosItems from "@/pages/pos/items";
import PosReports from "@/pages/pos/reports";

import LibraryDashboard from "@/pages/library/dashboard";
import LibraryBooks from "@/pages/library/books";
import LibraryMembers from "@/pages/library/members";
import LibraryIssue from "@/pages/library/issue";
import LibraryReports from "@/pages/library/reports";

import TransportDashboard from "@/pages/transport/dashboard";
import TransportRoutes from "@/pages/transport/routes";
import TransportVehicles from "@/pages/transport/vehicles";
import TransportDrivers from "@/pages/transport/drivers";
import TransportAllocation from "@/pages/transport/allocation";
import TransportReports from "@/pages/transport/reports";

import HostelDashboard from "@/pages/hostel/dashboard";
import HostelRooms from "@/pages/hostel/rooms";
import HostelResidents from "@/pages/hostel/residents";
import HostelFees from "@/pages/hostel/fees";
import HostelReports from "@/pages/hostel/reports";

import CareersPage from "@/pages/careers/index";
import CareersApply from "@/pages/careers/apply";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />

      <Route path="/:module/login" component={ModuleLoginPage} />
      <Route path="/student/dashboard" component={StudentDashboard} />
      <Route path="/student/list" component={StudentList} />
      <Route path="/student/add" component={StudentAdd} />
      <Route path="/student/edit/:id" component={StudentEdit} />
      <Route path="/student/profile/:id" component={StudentProfile} />
      <Route path="/student/alumni" component={StudentAlumni} />
      <Route path="/student/reports" component={StudentReports} />

      <Route path="/hr/dashboard" component={HrDashboard} />
      <Route path="/hr/list" component={HrList} />
      <Route path="/hr/add" component={HrAdd} />
      <Route path="/hr/profile/:id" component={HrProfile} />
      <Route path="/hr/vacancies" component={HrVacancies} />
      <Route path="/hr/applicants" component={HrApplicants} />
      <Route path="/hr/reports" component={HrReports} />

      <Route path="/fee/dashboard" component={FeeDashboard} />
      <Route path="/fee/structures" component={FeeStructures} />
      <Route path="/fee/challans" component={FeeChallans} />
      <Route path="/fee/payments" component={FeePayments} />
      <Route path="/fee/vouchers" component={FeeVouchers} />
      <Route path="/fee/generate" component={FeeGenerate} />
      <Route path="/fee/reports" component={FeeReports} />

      <Route path="/payroll/dashboard" component={PayrollDashboard} />
      <Route path="/payroll/list" component={PayrollList} />
      <Route path="/payroll/generate" component={PayrollGenerate} />
      <Route path="/payroll/reports" component={PayrollReports} />

      <Route path="/finance/dashboard" component={FinanceDashboard} />
      <Route path="/finance/accounts" component={FinanceAccounts} />
      <Route path="/finance/ledger" component={FinanceLedger} />
      <Route path="/finance/expenses" component={FinanceExpenses} />
      <Route path="/finance/vendors" component={FinanceVendors} />
      <Route path="/finance/vouchers" component={FinanceVouchers} />
      <Route path="/finance/reports" component={FinanceReports} />

      <Route path="/attendance/dashboard" component={AttendanceDashboard} />
      <Route path="/attendance/mark" component={AttendanceMark} />
      <Route path="/attendance/records" component={AttendanceRecords} />
      <Route path="/attendance/reports" component={AttendanceReports} />

      <Route path="/timetable/dashboard" component={TimetableDashboard} />
      <Route path="/timetable/class" component={TimetableClass} />
      <Route path="/timetable/teacher" component={TimetableTeacher} />
      <Route path="/timetable/create" component={TimetableCreate} />

      <Route path="/datesheet/dashboard" component={DateSheetDashboard} />
      <Route path="/datesheet/list" component={DateSheetList} />
      <Route path="/datesheet/create" component={DateSheetCreate} />

      <Route path="/curriculum/dashboard" component={CurriculumDashboard} />
      <Route path="/curriculum/syllabus" component={CurriculumSyllabus} />
      <Route path="/curriculum/exams" component={CurriculumExams} />
      <Route path="/curriculum/entry" component={CurriculumEntry} />
      <Route path="/curriculum/reports" component={CurriculumReports} />

      <Route path="/pos/dashboard" component={PosDashboard} />
      <Route path="/pos/sales" component={PosSales} />
      <Route path="/pos/new" component={PosNew} />
      <Route path="/pos/items" component={PosItems} />
      <Route path="/pos/reports" component={PosReports} />

      <Route path="/library/dashboard" component={LibraryDashboard} />
      <Route path="/library/books" component={LibraryBooks} />
      <Route path="/library/members" component={LibraryMembers} />
      <Route path="/library/issue" component={LibraryIssue} />
      <Route path="/library/reports" component={LibraryReports} />

      <Route path="/transport/dashboard" component={TransportDashboard} />
      <Route path="/transport/routes" component={TransportRoutes} />
      <Route path="/transport/vehicles" component={TransportVehicles} />
      <Route path="/transport/drivers" component={TransportDrivers} />
      <Route path="/transport/allocation" component={TransportAllocation} />
      <Route path="/transport/reports" component={TransportReports} />

      <Route path="/hostel/dashboard" component={HostelDashboard} />
      <Route path="/hostel/rooms" component={HostelRooms} />
      <Route path="/hostel/residents" component={HostelResidents} />
      <Route path="/hostel/fees" component={HostelFees} />
      <Route path="/hostel/reports" component={HostelReports} />

      <Route path="/careers" component={CareersPage} />
      <Route path="/careers/:id" component={CareersApply} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
