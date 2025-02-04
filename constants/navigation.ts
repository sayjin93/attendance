import {
  HomeIcon,
  UsersIcon,
  FolderIcon,
  CalendarIcon,
  DocumentDuplicateIcon,
  ChartPieIcon,
} from "@heroicons/react/24/outline";

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Klasat", href: "/classes", icon: UsersIcon },
  { name: "Studentët", href: "/students", icon: FolderIcon },
  { name: "Leksionet", href: "/lectures", icon: CalendarIcon },
  { name: "Listëprezenca", href: "/attendance", icon: DocumentDuplicateIcon },
  { name: "Raporte", href: "/reports", icon: ChartPieIcon },
];

export default navigationItems;
