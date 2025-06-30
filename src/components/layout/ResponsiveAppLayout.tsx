import React, { useState } from "react";
import Sidebar from "./Sidebar";
import MobileNavigation from "./MobileNavigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import Footer from "./Footer";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResponsiveAppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{
    href?: string;
    label: string;
    current?: boolean;
  }>;
}

const ResponsiveAppLayout: React.FC<ResponsiveAppLayoutProps> = ({
  children,
  title,
  subtitle,
  breadcrumbs,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header fixo no topo */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          <div className="flex items-center gap-4">
            {/* Menu mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>

            <div>
              <h1 className="text-lg md:text-xl font-semibold text-gray-900">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-600 hidden sm:block">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar - Fixo na lateral esquerda */}
      <aside className="hidden md:block fixed left-0 top-16 bottom-0 w-64 z-40 bg-white border-r border-gray-200 overflow-y-auto">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </div>
            </div>
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main Content - Com margem para não sobrepor o sidebar */}
      <main className="pt-16 md:pl-64 min-h-screen flex flex-col">
        <div className="flex-1 w-full">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="p-4 md:p-6 pb-0">
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((breadcrumb, index) => (
                    <React.Fragment key={index}>
                      <BreadcrumbItem>
                        {breadcrumb.current ? (
                          <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={breadcrumb.href || "#"}>
                            {breadcrumb.label}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && (
                        <BreadcrumbSeparator />
                      )}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          )}
          <div className="p-4 md:p-6 w-full">{children}</div>
        </div>
        <Footer />
      </main>

      {/* Navegação mobile fixa na parte inferior - apenas em telas muito pequenas */}
      <div className="md:hidden">
        <MobileNavigation />
      </div>
    </div>
  );
};

export default ResponsiveAppLayout;
