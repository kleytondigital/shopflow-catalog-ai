
import React from 'react';

interface AppleDashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const AppleDashboardLayout: React.FC<AppleDashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  actions
}) => {
  return (
    <div className="dashboard-container apple-fade-in">
      <div className="apple-space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="apple-heading-1 apple-mb-2">{title}</h1>
            {subtitle && (
              <p className="apple-text-body">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-3">
              {actions}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="apple-space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AppleDashboardLayout;
