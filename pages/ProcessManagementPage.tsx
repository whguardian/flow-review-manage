
import React, { useState } from 'react';
import ProcessSidebar from '../components/process/ProcessSidebar';
import ProcessDetail from '../components/process/ProcessDetail';

const ProcessManagementPage: React.FC = () => {
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);

  const handleProcessSelect = (id: string) => {
    setSelectedProcessId(id);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar Section */}
      <ProcessSidebar 
        onSelect={handleProcessSelect} 
        selectedId={selectedProcessId} 
      />

      {/* Detail Section */}
      <ProcessDetail id={selectedProcessId} />
    </div>
  );
};

export default ProcessManagementPage;
