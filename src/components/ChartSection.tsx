"use client"

import React from "react"
import { useState, useEffect, useRef } from "react"
import { useBatteryContext } from "../context/BatteryContext"
import type { TimeRange, BatteryMetric } from "../types"
import { LineChart, BarChart3, Activity, Zap, Battery, Thermometer, ChevronDown } from 'lucide-react'
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore"
import { db } from "../config/firebase"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts"

type ChartParameter = "voltage" | "current" | "power" | "soc" | "soh" | "temperature"

const ChartSection: React.FC = () => {
  const { selectedBatteryIds, timeRange, setTimeRange, batteryData } = useBatteryContext()

  const [chartData, setChartData] = useState<BatteryMetric[]>([])
  const [chartParameters, setChartParameters] = useState<ChartParameter[]>(["voltage"])
  const [loading, setLoading] = useState(false)
  const [showLegend, setShowLegend] = useState(true)
  const chartContainerRef = useRef<HTMLDivElement>(null)

  // Fetch historical data from Firestore
  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (selectedBatteryIds.length === 0) {
        setChartData([])
        return
      }

      setLoading(true)

      try {
        const batteryRef = collection(db, "batteryData")
        const timeLimit = getTimeLimit(timeRange)

        const q = query(batteryRef, orderBy("timestamp", "desc"), where("timestamp", ">=", timeLimit), limit(100))

        const querySnapshot = await getDocs(q)
        const data: BatteryMetric[] = []

        querySnapshot.forEach((doc) => {
          const metric = doc.data()
          data.push({
            timestamp: metric.timestamp.toDate(), // Convert Firestore timestamp to Date
            voltage: Number(metric.voltage) || 0,
            current: Number(metric.current) || 0,
            power: Number(metric.power) || 0,
            soc: Number(metric.soc) || 0,
            soh: Number(metric.soh) || 0,
            temperature: Number(metric.temperature) || 0,
          })
        })

        // Sort by timestamp ascending
        data.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        setChartData(data)
      } catch (error) {
        console.error("Error fetching battery metrics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistoricalData()
  }, [selectedBatteryIds, timeRange])

  // Update chart data when new real-time data arrives
  useEffect(() => {
    if (selectedBatteryIds.length === 0 || batteryData.length === 0) return

    const selectedBattery = batteryData.find((b) => b.battery.id === selectedBatteryIds[0])
    if (!selectedBattery) return

    setChartData((prev) => {
      const newData = [...prev]

      // Add new data point
      newData.push({
        ...selectedBattery.currentMetrics,
      })

      // Keep only the last 100 points
      if (newData.length > 100) {
        newData.shift()
      }

      return newData
    })
  }, [batteryData, selectedBatteryIds])

  const getTimeLimit = (range: TimeRange): Date => {
    const now = new Date()
    switch (range) {
      case "1h":
        return new Date(now.getTime() - 60 * 60 * 1000)
      case "24h":
        return new Date(now.getTime() - 24 * 60 * 60 * 1000)
      case "7d":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      case "30d":
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000)
    }
  }

  // Toggle parameter selection
  const toggleParameter = (param: ChartParameter) => {
    setChartParameters((prev) => (prev.includes(param) ? prev.filter((p) => p !== param) : [...prev, param]))
  }

  // Format timestamp for chart labels
  const formatTimestamp = (timestamp: Date): string => {
    if (timeRange === "1h") {
      return timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
    if (timeRange === "24h") {
      return timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
    return timestamp.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  // Get color for parameter
  const getParamColor = (param: ChartParameter): string => {
    switch (param) {
      case "voltage":
        return "#0ea5e9" // sky blue
      case "current":
        return "#10b981" // emerald
      case "power":
        return "#8b5cf6" // violet
      case "soc":
        return "#f59e0b" // amber
      case "soh":
        return "#06b6d4" // cyan
      case "temperature":
        return "#f43f5e" // rose
      default:
        return "#6b7280" // gray
    }
  }

  // Get gradient ID for parameter
  const getParamGradientId = (param: ChartParameter): string => {
    return `color-gradient-${param}`
  }

  // Get icon for parameter
  const getParamIcon = (param: ChartParameter) => {
    switch (param) {
      case "voltage":
        return <Zap className="h-4 w-4" />
      case "current":
        return <Activity className="h-4 w-4" />
      case "power":
        return <LineChart className="h-4 w-4" />
      case "soc":
        return <Battery className="h-4 w-4" />
      case "soh":
        return <BarChart3 className="h-4 w-4" />
      case "temperature":
        return <Thermometer className="h-4 w-4" />
      default:
        return <BarChart3 className="h-4 w-4" />
    }
  }

  // Get unit for parameter
  const getParamUnit = (param: ChartParameter): string => {
    switch (param) {
      case "voltage":
        return "V"
      case "current":
        return "A"
      case "power":
        return "W"
      case "soc":
      case "soh":
        return "%"
      case "temperature":
        return "°C"
      default:
        return ""
    }
  }

  // Get full name for parameter
  const getParamName = (param: ChartParameter): string => {
    switch (param) {
      case "voltage":
        return "Voltage"
      case "current":
        return "Current"
      case "power":
        return "Power"
      case "soc":
        return "State of Charge"
      case "soh":
        return "State of Health"
      case "temperature":
        return "Temperature"
      default:
        return param
    }
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
          <p className="text-sm font-medium mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
            {formatTimestamp(new Date(label))}
          </p>
          <div className="space-y-2.5">
            {payload.map((entry: any, index: number) => (
              <div key={`tooltip-${index}`} className="flex items-center gap-3">
                <div 
                  className="w-3 h-8 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {entry.name}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: entry.color }}>
                    {entry.value.toFixed(2)} {getParamUnit(entry.dataKey as ChartParameter)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  // Render empty state
  const renderEmptyState = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 p-6">
      <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center shadow-inner">
        <LineChart className="h-10 w-10 text-gray-400 dark:text-gray-500 opacity-70" />
      </div>
      <p className="text-center mb-2 text-lg font-medium">
        {selectedBatteryIds.length === 0
          ? "Select a battery to view performance data"
          : "No data available for the selected time range"}
      </p>
      <p className="text-sm text-center text-gray-400 dark:text-gray-500 max-w-md">
        {selectedBatteryIds.length === 0
          ? "Choose a battery from the battery list to visualize its performance metrics"
          : "Try selecting a different time range or check back later for new data"}
      </p>
    </div>
  )

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 p-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-sky-500 to-sky-600 p-2.5 rounded-xl shadow-md mr-4 text-white">
              <LineChart className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Battery Performance</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Real-time and historical metrics visualization
              </p>
            </div>
          </div>

          {/* Custom Tabs for Time Range */}
          <div className="bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm p-1 rounded-xl h-10 flex shadow-inner">
            {(["1h", "24h", "7d", "30d"] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`
                  text-sm px-5 h-8 rounded-lg transition-all duration-300 font-medium
                  ${
                    timeRange === range
                      ? "bg-white dark:bg-gray-700 text-sky-600 dark:text-sky-400 shadow-sm transform scale-105"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                  }
                `}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Parameter toggles */}
      <div className="flex flex-wrap gap-2 p-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/50 border-b border-gray-100 dark:border-gray-700">
        {(["voltage", "current", "power", "soc", "soh", "temperature"] as ChartParameter[]).map((param) => (
          <button
            key={param}
            onClick={() => toggleParameter(param)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-sm
              transition-all duration-300 hover:shadow-md transform hover:-translate-y-0.5
              ${
                chartParameters.includes(param)
                  ? "border-0 shadow-md"
                  : "border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              }
            `}
            style={{
              background: chartParameters.includes(param) 
                ? `linear-gradient(135deg, ${getParamColor(param)}20, ${getParamColor(param)}40)` 
                : undefined,
              borderColor: chartParameters.includes(param) ? getParamColor(param) : undefined,
              color: chartParameters.includes(param) ? getParamColor(param) : undefined,
            }}
          >
            <div className="bg-white dark:bg-gray-800 p-1.5 rounded-lg shadow-sm">
              {getParamIcon(param)}
            </div>
            <span className="font-medium">{getParamName(param)}</span>
          </button>
        ))}
      </div>

      {/* Chart container */}
      <div ref={chartContainerRef} className="h-[450px] relative bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 p-6">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700 opacity-25"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-sky-500 animate-spin"></div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 font-medium">Loading chart data...</p>
            </div>
          </div>
        ) : chartData.length === 0 ? (
          renderEmptyState()
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                {chartParameters.map((param) => (
                  <linearGradient key={param} id={getParamGradientId(param)} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getParamColor(param)} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={getParamColor(param)} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} opacity={0.5} />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(timestamp) => formatTimestamp(new Date(timestamp))}
                stroke="#9ca3af"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                stroke="#9ca3af"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              {chartParameters.map((param) => (
                <React.Fragment key={param}>
                  <Area
                    type="monotone"
                    dataKey={param}
                    fill={`url(#${getParamGradientId(param)})`}
                    stroke="none"
                    fillOpacity={1}
                  />
                  <Line
                    type="monotone"
                    dataKey={param}
                    stroke={getParamColor(param)}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ 
                      r: 8, 
                      strokeWidth: 2, 
                      stroke: '#fff',
                      fill: getParamColor(param),
                    }}
                    name={getParamName(param)}
                    connectNulls
                  />
                </React.Fragment>
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      {chartData.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
          <div 
            className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
            onClick={() => setShowLegend(!showLegend)}
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Chart Legend
            </span>
            <ChevronDown 
              className={`h-4 w-4 text-gray-500 transition-transform duration-300 ${showLegend ? 'rotate-180' : ''}`} 
            />
          </div>
          
          {showLegend && (
            <div className="flex flex-wrap gap-x-8 gap-y-4 p-4 pt-2 animate-in slide-in-from-top duration-300">
              {chartParameters.map((param) => (
                <div key={param} className="flex items-center group">
                  <div 
                    className="w-10 h-5 rounded-full mr-3 shadow-sm" 
                    style={{ 
                      background: `linear-gradient(90deg, ${getParamColor(param)}90, ${getParamColor(param)}40)` 
                    }}
                  />
                  <div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-800 dark:text-gray-200 font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        {getParamName(param)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1.5">
                        ({getParamUnit(param)})
                      </span>
                    </div>
                    {chartData.length > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Current: <span className="font-medium" style={{ color: getParamColor(param) }}>
                          {chartData[chartData.length - 1][param].toFixed(2)} {getParamUnit(param)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ChartSection
