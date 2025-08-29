
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "./Sidebar";
import SuperAdminSidebar from "./SuperAdminSidebar";

const AppSidebar = () => {
  const { profile } = useAuth();

  // Se for superadmin, usar sidebar específica do admin SaaS
  if (profile?.role === "superadmin") {
    return (
      <div className="fixed left-0 top-16 bottom-0 w-64 bg-background border-r border-border z-30 hidden lg:block">
        <SuperAdminSidebar />
      </div>
    );
  }

  // Para store_admin e outros, usar sidebar padrão
  return (
    <div className="fixed left-0 top-16 bottom-0 w-64 bg-background border-r border-border z-30 hidden lg:block">
      <Sidebar />
    </div>
  );
};

export default AppSidebar;
