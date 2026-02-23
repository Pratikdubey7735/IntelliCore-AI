"use client"

import { useCallback, useState } from "react"
import Navbar from "@/components/Navbar"
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  NodeProps
} from "reactflow"
import "reactflow/dist/style.css"

const SCHEMA: Record<string, { column: string; type: string; description: string }[]> = {
  student: [
    { column: "student_name", type: "VARCHAR", description: "Full name of student" },
    { column: "data_structures", type: "INTEGER", description: "Marks in Data Structures" },
    { column: "c", type: "INTEGER", description: "Marks in C Programming" },
    { column: "python", type: "INTEGER", description: "Marks in Python" },
    { column: "software_engineering", type: "INTEGER", description: "Marks in Software Engineering" },
    { column: "coa", type: "INTEGER", description: "Marks in COA" },
  ],
  cricket: [
    { column: "player_name", type: "VARCHAR", description: "Name of cricket player" },
    { column: "years_active", type: "VARCHAR", description: "Career span" },
    { column: "matches", type: "VARCHAR", description: "Total matches played" },
    { column: "innings", type: "VARCHAR", description: "Total innings" },
    { column: "runs", type: "VARCHAR", description: "Total runs scored" },
    { column: "high_score", type: "VARCHAR", description: "Highest score" },
    { column: "batting_average", type: "VARCHAR", description: "Career batting average" },
    { column: "hundreds", type: "VARCHAR", description: "Total centuries" },
    { column: "fifties", type: "VARCHAR", description: "Total half centuries" },
    { column: "ducks", type: "VARCHAR", description: "Total ducks" },
  ],
  employee: [
    { column: "employee_name", type: "VARCHAR", description: "Full name of employee" },
    { column: "age", type: "INTEGER", description: "Age in years" },
    { column: "department", type: "VARCHAR", description: "Department name" },
    { column: "education", type: "VARCHAR", description: "Education qualification" },
    { column: "gender", type: "VARCHAR", description: "Gender" },
    { column: "marital_status", type: "VARCHAR", description: "Marital status" },
    { column: "monthly_income", type: "INTEGER", description: "Monthly salary" },
    { column: "years_of_experience", type: "INTEGER", description: "Work experience" },
    { column: "percent_salary_hike", type: "INTEGER", description: "Salary hike percentage" },
    { column: "performance_rating", type: "INTEGER", description: "Performance rating 1-5" },
  ]
}

const TABLE_COLORS: Record<string, { bg: string; border: string; badge: string; badgeText: string }> = {
  student: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/40",
    badge: "bg-blue-500",
    badgeText: "text-white"
  },
  cricket: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/40",
    badge: "bg-emerald-500",
    badgeText: "text-white"
  },
  employee: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/40",
    badge: "bg-purple-500",
    badgeText: "text-white"
  }
}

function TableNode({ data }: NodeProps) {
  const colors = TABLE_COLORS[data.table] || TABLE_COLORS.student
  return (
    <div className={`rounded-xl border-2 ${colors.border} ${colors.bg} min-w-64 shadow-xl backdrop-blur-sm`}>
      <Handle type="target" position={Position.Left} className="opacity-0" />

      {/* Header */}
      <div className={`px-4 py-3 border-b ${colors.border} flex items-center justify-between`}>
        <h3 className="text-white font-bold text-sm capitalize">{data.table}</h3>
        <span className={`${colors.badge} ${colors.badgeText} text-xs px-2 py-0.5 rounded-full`}>
          {data.columns.length} cols
        </span>
      </div>

      {/* Columns */}
      <div className="p-3 space-y-1">
        {data.columns.map((col: any) => (
          <div
            key={col.column}
            className="flex items-center justify-between gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all group"
          >
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${colors.badge}`} />
              <span className="text-slate-200 text-xs font-medium">{col.column}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-xs hidden group-hover:block transition-all">
                {col.description}
              </span>
              <span className="text-slate-400 text-xs bg-slate-800 px-1.5 py-0.5 rounded">
                {col.type}
              </span>
            </div>
          </div>
        ))}
      </div>

      <Handle type="source" position={Position.Right} className="opacity-0" />
    </div>
  )
}

const nodeTypes = { tableNode: TableNode }

const initialNodes: Node[] = [
  {
    id: "student",
    type: "tableNode",
    position: { x: 50, y: 50 },
    data: { table: "student", columns: SCHEMA.student }
  },
  {
    id: "cricket",
    type: "tableNode",
    position: { x: 450, y: 50 },
    data: { table: "cricket", columns: SCHEMA.cricket }
  },
  {
    id: "employee",
    type: "tableNode",
    position: { x: 250, y: 480 },
    data: { table: "employee", columns: SCHEMA.employee }
  }
]

const initialEdges: Edge[] = [
  {
    id: "e1",
    source: "student",
    target: "cricket",
    label: "Intellicore AI",
    style: { stroke: "#3b82f6", strokeWidth: 2, strokeDasharray: "5,5" },
    labelStyle: { fill: "#94a3b8", fontSize: 11 },
    labelBgStyle: { fill: "#1e293b" },
    animated: true
  },
  {
    id: "e2",
    source: "cricket",
    target: "employee",
    label: "Queried Together",
    style: { stroke: "#8b5cf6", strokeWidth: 2, strokeDasharray: "5,5" },
    labelStyle: { fill: "#94a3b8", fontSize: 11 },
    labelBgStyle: { fill: "#1e293b" },
    animated: true
  },
  {
    id: "e3",
    source: "student",
    target: "employee",
    label: "Same System",
    style: { stroke: "#06b6d4", strokeWidth: 2, strokeDasharray: "5,5" },
    labelStyle: { fill: "#94a3b8", fontSize: 11 },
    labelBgStyle: { fill: "#1e293b" },
    animated: true
  }
]

export default function SchemaPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedTable(node.id)
  }, [])

  return (
    <div className="flex flex-col h-full">
      <Navbar title="Schema Graph" />
      <div className="flex flex-1 gap-4 p-6">

        {/* Graph */}
        <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-slate-950"
          >
            <Background color="#1e293b" gap={20} />
            <Controls className="bg-slate-800 border-slate-700" />
            <MiniMap
              nodeColor={(n) => {
                if (n.id === "student") return "#3b82f6"
                if (n.id === "cricket") return "#10b981"
                return "#8b5cf6"
              }}
              className="bg-slate-800 border-slate-700"
            />
          </ReactFlow>
        </div>

        {/* Side Panel */}
        <div className="w-72 shrink-0 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
            <h3 className="text-slate-800 dark:text-white font-semibold mb-3 text-sm">How to Use</h3>
            <ul className="space-y-2 text-slate-500 dark:text-slate-400 text-xs">
              <li>• Drag tables to reposition them</li>
              <li>• Scroll to zoom in and out</li>
              <li>• Click a table to see its details</li>
              <li>• Hover over a column to see description</li>
              <li>• Use minimap to navigate</li>
            </ul>
          </div>

          {selectedTable && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
              <h3 className="text-slate-800 dark:text-white font-semibold mb-3 text-sm capitalize">
                {selectedTable} Table
              </h3>
              <div className="space-y-2">
                {SCHEMA[selectedTable].map(col => (
                  <div key={col.column} className="border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 dark:text-slate-300 text-xs font-medium">{col.column}</span>
                      <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded">{col.type}</span>
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5">{col.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!selectedTable && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
              <p className="text-slate-400 text-xs text-center">Click on any table node to see its column details here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}