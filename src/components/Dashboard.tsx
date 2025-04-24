import React from 'react';
import Header from './Header';
import MetricsGrid from './MetricsGrid';
import ChartSection from './ChartSection';
import DataTable from './DataTable';
import AlertsPanel from './AlertsPanel';
import { BatteryProvider } from '../context/BatteryContext';

const Dashboard: React.FC = () => {
  return (
    <BatteryProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 gap-6">
            {/* Main metrics */}
            <MetricsGrid />
            
            {/* Chart section */}
            <ChartSection />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Data table (takes up 2/3 on large screens) */}
              <div className="lg:col-span-2">
                <DataTable />
              </div>
              
              {/* Alerts panel */}
              <div>
                <AlertsPanel />
              </div>
            </div>
          </div>
        </main>
        
        <footer className="bg-white dark:bg-gray-800 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Battery Health Monitoring Dashboard © {new Date().getFullYear()}
            </p>
          </div>
        </footer>
      </div>
    </BatteryProvider>
  );
};

export default Dashboard;