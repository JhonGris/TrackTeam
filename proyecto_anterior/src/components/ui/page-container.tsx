import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  );
}

interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function SectionCard({ 
  children, 
  className = '', 
  title, 
  description, 
  icon 
}: SectionCardProps) {
  return (
    <div className={`card-elevated bg-white rounded-2xl border-0 overflow-hidden ${className}`}>
      {(title || description || icon) && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b px-6 py-5">
          <div className="flex items-center gap-4">
            {icon && (
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <div className="text-white">
                  {icon}
                </div>
              </div>
            )}
            <div>
              {title && (
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-gray-600 mt-1 text-base">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}