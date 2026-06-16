import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/common/Sidebar';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className='flex h-screen bg-background overflow-hidden'>
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((p) => !p)}
      />

      {/* Main content */}
      <main className='flex-1 overflow-hidden'>
        <Outlet context={{ sidebarOpen }} />
      </main>
    </div>
  );
};

export default AppLayout;
