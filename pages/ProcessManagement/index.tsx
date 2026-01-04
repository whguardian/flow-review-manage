import React, { useState } from 'react';
import ProcessSidebar from '../../features/process/components/ProcessSidebar';
import ProcessDetail from '../../features/process/components/ProcessDetail';

const ProcessManagementPage: React.FC = () => {
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);

  const handleProcessSelect = (id: string) => {
    setSelectedProcessId(id);
  };

  return (
    <div className="min-h-screen h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Business Header moved from App.tsx */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-800">工艺复核管理系统</h1>
        </div>
        <div className="text-sm text-gray-500">
          v1.1.0 架构优化版
        </div>
      </header>

      {/* Feature Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Section */}
        <ProcessSidebar 
          onSelect={handleProcessSelect} 
          selectedId={selectedProcessId} 
        />

        {/* Detail Section */}
        <ProcessDetail id={selectedProcessId} />
      </div>
    </div>
  );
};

export default ProcessManagementPage;