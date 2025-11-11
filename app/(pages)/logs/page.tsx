import { Metadata } from "next";
import ClientComponent from "./ClientComponent";

export const metadata: Metadata = {
  title: "Activity Logs",
  description: "View all system activity logs",
};

export default function LogsPage() {
  return <ClientComponent />;
}
