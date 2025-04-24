import React, { useState } from 'react';
import { useBatteryContext } from '../context/BatteryContext';
import { Battery } from '../types';
import { Moon, Sun, Battery as BatteryIcon, ChevronDown, ChevronUp, X } from 'lucide-react';

const Header: React.FC = () => {
  const { 
    batteryData, 
    selectedBatteryIds, 
    setSelectedBatteryIds,
    isDarkMode, 
    toggleDarkMode 
  } = useBatteryContext();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleBatterySelection = (batteryId: string) => {
    setSelectedBatteryIds(
      selectedBatteryIds.includes(batteryId)
        ? selectedBatteryIds.filter(id => id !== batteryId)
        : [...selectedBatteryIds, batteryId]
    );
  };

  const selectAllBatteries = () => {
    setSelectedBatteryIds(batteryData.map(d => d.battery.id));
  };

  const clearBatterySelection = () => {
    setSelectedBatteryIds([]);
  };

  // Get currently selected batteries
  const selectedBatteries = batteryData.filter(d => 
    selectedBatteryIds.includes(d.battery.id)
  );

  // Format the last updated time
  const formatLastUpdated = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    }).format(date);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md transition-colors duration-300">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center">
            <BatteryIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-2" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Battery Health Monitor
            </h1>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Battery selector dropdown */}
            <div className="relative w-full sm:w-auto">
              <button
                onClick={toggleDropdown}
                className="w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none transition-colors duration-200"
              >
                <span>
                  {selectedBatteryIds.length === 0
                    ? 'Select batteries'
                    : selectedBatteryIds.length === 1
                    ? batteryData.find(d => d.battery.id === selectedBatteryIds[0])?.battery.name
                    : `${selectedBatteryIds.length} batteries selected`}
                </span>
                {isDropdownOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {isDropdownOpen && (
                <div className="absolute z-10 w-full min-w-[240px] mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
                  <div className="p-2 border-b border-gray-200 dark:border-gray-600 flex justify-between">
                    <button
                      onClick={selectAllBatteries}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      Select All
                    </button>
                    <button
                      onClick={clearBatterySelection}
                      className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      Clear
                    </button>
                  </div>
                  <ul className="py-1 max-h-60 overflow-auto">
                    {batteryData.map(({ battery }) => (
                      <li key={battery.id} className="px-2">
                        <label className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedBatteryIds.includes(battery.id)}
                            onChange={() => toggleBatterySelection(battery.id)}
                            className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-200">
                            {battery.name}
                          </span>
                          <span 
                            className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                              battery.isConnected 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                          >
                            {battery.isConnected ? 'Connected' : 'Offline'}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                  <div className="p-2 border-t border-gray-200 dark:border-gray-600">
                    <button
                      onClick={toggleDropdown}
                      className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Status bar with selected batteries */}
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedBatteries.map(({ battery }) => (
            <div 
              key={battery.id}
              className="flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
            >
              <span 
                className={`w-2 h-2 rounded-full ${
                  battery.isConnected ? 'bg-green-500' : 'bg-red-500'
                }`} 
              />
              <span>{battery.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {battery.isConnected 
                  ? `Updated: ${formatLastUpdated(battery.lastUpdated)}` 
                  : 'Offline'}
              </span>
              <button 
                onClick={() => toggleBatterySelection(battery.id)}
                className="ml-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {selectedBatteryIds.length === 0 && (
            <div className="text-sm text-gray-500 dark:text-gray-400 italic">
              No batteries selected. Please select at least one battery to view data.
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;