"use client";

import { memo } from "react";
import Card from "../../../../components/Card";
import Alert from "../../../../components/Alert";

interface EmptyStateProps {
  canShowTable: boolean;
  registryRows: unknown[];
  isAdminUser: boolean;
  isLoading: boolean;
}

const EmptyState = memo(function EmptyState({
  canShowTable,
  registryRows,
  isAdminUser,
  isLoading,
}: EmptyStateProps) {
  if (!canShowTable) {
    return (
      <div className="relative">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-8 w-8 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm text-gray-600">Po ngarkohet...</span>
            </div>
          </div>
        )}
        <Card title="Regjistri">
          <Alert
            type="default"
            title="Zgjidhni të gjithë filtrat"
            desc={`Zgjidhni të gjithë filtrat e nevojshëm për të parë regjistrën e prezencës.${isAdminUser ? " Si admin, duhet të zgjidhni edhe profesorin." : ""}`}
          />
        </Card>
      </div>
    );
  }

  if (canShowTable && registryRows.length === 0) {
    return (
      <div className="relative">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-8 w-8 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm text-gray-600">Po ngarkohet...</span>
            </div>
          </div>
        )}
        <Card title="Regjistri">
          <Alert
            type="default"
            title="Nuk ka të dhëna"
            desc="Nuk u gjetën të dhëna për kriteret e zgjedhura."
          />
        </Card>
      </div>
    );
  }

  return null;
});

export default EmptyState;