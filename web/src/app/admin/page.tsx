import type { Metadata } from "next";
import AdminApp from "@/admin/AdminApp";

export const metadata: Metadata = {
  title: "Admin | NexaLight",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminApp />;
}
