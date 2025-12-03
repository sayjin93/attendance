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
  SparklesIcon,
} from "@heroicons/react/24/outline";

export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  adminOnly?: boolean;
}

export interface NavigationCategory {
  category: string;
  items: NavigationItem[];
}

const navigationItems: NavigationCategory[] = [
  {
    category: "KRYEFAQJA",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    ]
  },
  {
    category: "MENAXHIMI",
    items: [
      { name: "Klasat", href: "/classes", icon: FolderIcon, adminOnly: true },
      { name: "Studentët", href: "/students", icon: UsersIcon, adminOnly: true },
      { name: "Profesorët", href: "/professors", icon: AcademicCapIcon, adminOnly: true },
      { name: "Kurset", href: "/subjects", icon: BookOpenIcon, adminOnly: true },
      { name: "Caktime", href: "/assignments", icon: ClipboardDocumentListIcon, adminOnly: true },
    ]
  },
  {
    category: "AKADEMIKE",
    items: [
      { name: "Leksionet", href: "/lectures", icon: CalendarIcon },
      { name: "Listëprezenca", href: "/attendance", icon: DocumentDuplicateIcon },
    ]
  },
  {
    category: "RAPORTE",
    items: [
      { name: "Regjistri", href: "/registry", icon: TableCellsIcon },
      { name: "Raporte", href: "/reports", icon: ChartPieIcon },
    ]
  },
  {
    category: "SISTEMI",
    items: [
      { name: "AI Assistant", href: "/ai-assistant", icon: SparklesIcon },
      { name: "Activity Logs", href: "/logs", icon: DocumentTextIcon, adminOnly: true },
    ]
  }
];

export default navigationItems;
