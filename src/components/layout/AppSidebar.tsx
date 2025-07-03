import React from "react";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "./Sidebar";
import SuperAdminSidebar from "./SuperAdminSidebar";

const AppSidebar = () => {
  const { profile } = useAuth();

  // Se for superadmin, usar sidebar específica do admin SaaS
  if (profile?.role === "superadmin") {
    return <SuperAdminSidebar />;
  }

  // Para store_admin e outros, usar sidebar padrão
  return <Sidebar />;
};

export default AppSidebar;
