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
  { name: "Klasat", href: "/classes", icon: UsersIcon, adminOnly: true },
  { name: "Studentët", href: "/students", icon: FolderIcon, adminOnly: true },
  { name: "Kursi", href: "/subjects", icon: BookOpenIcon, adminOnly: true },
  { name: "Leksionet", href: "/lectures", icon: CalendarIcon },
  { name: "Listëprezenca", href: "/attendance", icon: DocumentDuplicateIcon },
  { name: "Raporte", href: "/reports", icon: ChartPieIcon },
];

export default navigationItems;
