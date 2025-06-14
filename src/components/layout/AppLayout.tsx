
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{
    href?: string;
    label: string;
    current?: boolean;
  }>;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, title, subtitle, breadcrumbs }) => {
  return (
    <div className="min-h-screen bg-background">
      <Header title={title} subtitle={subtitle} />
      <Sidebar />
      <main className="pl-64 pt-16">
        <div className="p-6">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="mb-6">
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((breadcrumb, index) => (
                    <React.Fragment key={index}>
                      <BreadcrumbItem>
                        {breadcrumb.current ? (
                          <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={breadcrumb.href || '#'}>
                            {breadcrumb.label}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
