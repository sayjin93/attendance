import {
  HomeIcon,
  UsersIcon,
  FolderIcon,
  CalendarIcon,
  DocumentDuplicateIcon,
  ChartPieIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Klasat", href: "/classes", icon: FolderIcon, adminOnly: true },
  { name: "Studentët", href: "/students", icon: UsersIcon, adminOnly: true },
  { name: "Kurset", href: "/subjects", icon: BookOpenIcon, adminOnly: true },
  { name: "Leksionet", href: "/lectures", icon: CalendarIcon },
  { name: "Listëprezenca", href: "/attendance", icon: DocumentDuplicateIcon },
  { name: "Raporte", href: "/reports", icon: ChartPieIcon },
];

export default navigationItems;
