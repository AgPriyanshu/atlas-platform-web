import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Employee, LoadStatus } from "api/workload/types";
import { useEffect, useMemo } from "react";
import { applyDagreLayout } from "./layout";
import { PersonNode } from "./person-node";

const NODE_TYPES: NodeTypes = { person: PersonNode };

const MINIMAP_COLORS: Record<LoadStatus, string> = {
  UNDER: "#22c55e",
  HEALTHY: "#fb923c",
  OVER: "#ef4444",
};

const buildGraph = (
  employees: Employee[]
): {
  nodes: Node[];
  edges: Edge[];
} => {
  const nodes: Node[] = employees.map((emp) => ({
    id: emp.id,
    type: "person",
    position: { x: 0, y: 0 },
    data: {
      name: emp.name,
      designation: emp.designation,
      loadStatus: emp.loadStatus,
      loadRatio: emp.loadRatio,
      activeTaskCount: emp.activeTaskCount,
      capacity: emp.capacity,
    },
  }));

  const edges: Edge[] = employees
    .filter((emp) => emp.manager !== null)
    .map((emp) => ({
      id: `${emp.manager}->${emp.id}`,
      source: emp.manager as string,
      target: emp.id,
      type: "smoothstep",
      style: { stroke: "#94a3b8", strokeWidth: 2 },
    }));

  return { nodes, edges };
};

interface OrgGraphProps {
  employees: Employee[];
  selectedId: string | null;
  onSelectEmployee: (id: string | null) => void;
}

const OrgGraphInner = ({
  employees,
  selectedId,
  onSelectEmployee,
}: OrgGraphProps) => {
  const { fitView } = useReactFlow();

  const { nodes: rawNodes, edges: rawEdges } = useMemo(
    () => buildGraph(employees),
    [employees]
  );

  const layoutNodes = useMemo(
    () => applyDagreLayout(rawNodes, rawEdges),
    [rawNodes, rawEdges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rawEdges);

  useEffect(() => {
    setNodes(layoutNodes);
    setEdges(rawEdges);
    setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 100);
  }, [layoutNodes, rawEdges, setNodes, setEdges, fitView]);

  const nodesWithSelection = nodes.map((n) => ({
    ...n,
    selected: n.id === selectedId,
  }));

  return (
    <ReactFlow
      className="org-graph"
      style={{ width: "100%", height: "100%" }}
      nodes={nodesWithSelection}
      edges={edges}
      nodeTypes={NODE_TYPES}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={(_event, node) => {
        onSelectEmployee(node.id === selectedId ? null : node.id);
      }}
      onPaneClick={() => onSelectEmployee(null)}
      fitView
      minZoom={0.2}
      maxZoom={2}
    >
      <Background gap={20} color="#e2e8f0" />
      <Controls />
      <MiniMap
        nodeColor={(node) =>
          MINIMAP_COLORS[
            (node.data as { loadStatus: LoadStatus }).loadStatus
          ] ?? "#94a3b8"
        }
        maskColor="rgba(0,0,0,0.05)"
      />
    </ReactFlow>
  );
};

export const OrgGraph = (props: OrgGraphProps) => (
  <ReactFlowProvider>
    <OrgGraphInner {...props} />
  </ReactFlowProvider>
);
