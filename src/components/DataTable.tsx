import React, { useState } from 'react';
import { useBatteryContext } from '../context/BatteryContext';
import { BatteryMetric } from '../types';
import { getStatusColor } from '../utils/thresholds';
import { Table, ArrowUpDown, Download, Search } from 'lucide-react';

const DataTable: React.FC = () => {
  const { selectedBatteryIds, getFilteredData, batteryData, thresholds } = useBatteryContext();
  const [sortColumn, setSortColumn] = useState<keyof BatteryMetric>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  // Get combined data from all selected batteries
  const getData = () => {
    if (selectedBatteryIds.length === 0) return [];

    let allData: (BatteryMetric & { batteryName: string })[] = [];
    
    selectedBatteryIds.forEach(id => {
      const data = getFilteredData(id);
      if (!data) return;
      
      const batteryName = data.battery.name;
      
      // Take the last 10 readings
      const recentData = data.historicalData
        .slice(-10)
        .map(metric => ({ ...metric, batteryName }));
      
      allData = [...allData, ...recentData];
    });
    
    // Sort data
    allData.sort((a, b) => {
      if (sortColumn === 'timestamp') {
        return sortDirection === 'asc'
          ? a.timestamp.getTime() - b.timestamp.getTime()
          : b.timestamp.getTime() - a.timestamp.getTime();
      }
      
      return sortDirection === 'asc'
        ? a[sortColumn] - b[sortColumn]
        : b[sortColumn] - a[sortColumn];
    });
    
    // Apply search filter if needed
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      allData = allData.filter(d => 
        d.batteryName.toLowerCase().includes(term) ||
        d.voltage.toString().includes(term) ||
        d.current.toString().includes(term) ||
        d.power.toString().includes(term) ||
        d.soc.toString().includes(term) ||
        d.temperature.toString().includes(term)
      );
    }
    
    return allData;
  };

  const handleSort = (column: keyof BatteryMetric) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const formatTimestamp = (timestamp: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    }).format(timestamp);
  };

  const exportToCSV = () => {
    const data = getData();
    if (data.length === 0) return;
    
    const headers = ['Battery', 'Timestamp', 'Voltage (V)', 'Current (A)', 'Power (W)', 'SOC (%)', 'SOH (%)', 'Temperature (°C)'];
    
    const rows = data.map(d => [
      d.batteryName,
      formatTimestamp(d.timestamp),
      d.voltage.toFixed(2),
      d.current.toFixed(2),
      d.power.toFixed(2),
      d.soc.toFixed(1),
      d.soh.toFixed(1),
      d.temperature.toFixed(1),
    ]);
    
    const csvContent = 
      headers.join(',') + 
      '\n' + 
      rows.map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `battery-data-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const tableData = getData();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div className="flex items-center mb-2 sm:mb-0">
          <Table className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Historical Data
          </h2>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search data..."
              className="pl-9 pr-4 py-2 w-full sm:w-auto text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={exportToCSV}
            disabled={tableData.length === 0}
            className="flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {selectedBatteryIds.length > 1 && (
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Battery
                </th>
              )}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('timestamp')}
              >
                <div className="flex items-center">
                  Timestamp
                  <ArrowUpDown className={`ml-1 h-4 w-4 ${sortColumn === 'timestamp' ? 'opacity-100' : 'opacity-50'}`} />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('voltage')}
              >
                <div className="flex items-center">
                  Voltage (V)
                  <ArrowUpDown className={`ml-1 h-4 w-4 ${sortColumn === 'voltage' ? 'opacity-100' : 'opacity-50'}`} />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('current')}
              >
                <div className="flex items-center">
                  Current (A)
                  <ArrowUpDown className={`ml-1 h-4 w-4 ${sortColumn === 'current' ? 'opacity-100' : 'opacity-50'}`} />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('power')}
              >
                <div className="flex items-center">
                  Power (W)
                  <ArrowUpDown className={`ml-1 h-4 w-4 ${sortColumn === 'power' ? 'opacity-100' : 'opacity-50'}`} />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('soc')}
              >
                <div className="flex items-center">
                  SOC (%)
                  <ArrowUpDown className={`ml-1 h-4 w-4 ${sortColumn === 'soc' ? 'opacity-100' : 'opacity-50'}`} />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('soh')}
              >
                <div className="flex items-center">
                  SOH (%)
                  <ArrowUpDown className={`ml-1 h-4 w-4 ${sortColumn === 'soh' ? 'opacity-100' : 'opacity-50'}`} />
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('temperature')}
              >
                <div className="flex items-center">
                  Temp (°C)
                  <ArrowUpDown className={`ml-1 h-4 w-4 ${sortColumn === 'temperature' ? 'opacity-100' : 'opacity-50'}`} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {tableData.length > 0 ? (
              tableData.map((data, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  {selectedBatteryIds.length > 1 && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {data.batteryName}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatTimestamp(data.timestamp)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${getStatusColor('voltage', data.voltage, thresholds)}`}>
                    {data.voltage.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {data.current.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {data.power.toFixed(2)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${getStatusColor('soc', data.soc, thresholds)}`}>
                    {data.soc.toFixed(1)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${getStatusColor('soh', data.soh, thresholds)}`}>
                    {data.soh.toFixed(1)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${getStatusColor('temperature', data.temperature, thresholds)}`}>
                    {data.temperature.toFixed(1)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={selectedBatteryIds.length > 1 ? 8 : 7} 
                  className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  {selectedBatteryIds.length === 0
                    ? 'Select a battery to view data'
                    : 'No data available for the selected time range'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;