
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-background">
      <Header title={title} subtitle={subtitle} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 pt-16">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
