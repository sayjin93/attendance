import {
  HomeIcon,
  UsersIcon,
  FolderIcon,
  CalendarIcon,
  DocumentDuplicateIcon,
  ChartPieIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
  TableCellsIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Klasat", href: "/classes", icon: FolderIcon, adminOnly: true },
  { name: "Studentët", href: "/students", icon: UsersIcon, adminOnly: true },
  { name: "Profesorët", href: "/professors", icon: AcademicCapIcon, adminOnly: true },
  { name: "Kurset", href: "/subjects", icon: BookOpenIcon, adminOnly: true },
  { name: "Caktime", href: "/assignments", icon: ClipboardDocumentListIcon , adminOnly: true },
  { name: "Leksionet", href: "/lectures", icon: CalendarIcon },
  { name: "Listëprezenca", href: "/attendance", icon: DocumentDuplicateIcon },
  { name: "Regjistri", href: "/registry", icon: TableCellsIcon },
  { name: "Raporte", href: "/reports", icon: ChartPieIcon },
  { name: "Activity Logs", href: "/logs", icon: DocumentTextIcon, adminOnly: true },
];

export default navigationItems;
