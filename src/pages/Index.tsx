import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { UpcomingRentals } from "@/components/dashboard/UpcomingRentals";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { AiAnalyticsInsights } from "@/components/analytics/AiAnalyticsInsights";
import { IntelligentScheduling } from "@/components/dashboard/IntelligentScheduling";
import { usePerformanceMonitoring } from "@/hooks/use-performance-monitoring";
import { useDashboardSubscriptions } from "@/hooks/use-dashboard-subscriptions";
import { ReactFlow, Background, Controls, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback } from "react";

const initialNodes = [
  {
    id: 'stats',
    type: 'dashboardNode',
    position: { x: 0, y: 0 },
    data: { component: DashboardStats }
  },
  {
    id: 'rentals',
    type: 'dashboardNode',
    position: { x: 0, y: 200 },
    data: { component: UpcomingRentals }
  },
  {
    id: 'alerts',
    type: 'dashboardNode',
    position: { x: 400, y: 200 },
    data: { component: DashboardAlerts }
  },
  {
    id: 'activity',
    type: 'dashboardNode',
    position: { x: 0, y: 500 },
    data: { component: RecentActivity }
  },
  {
    id: 'scheduling',
    type: 'dashboardNode',
    position: { x: 400, y: 500 },
    data: { component: IntelligentScheduling }
  },
  {
    id: 'insights',
    type: 'dashboardNode',
    position: { x: 0, y: 800 },
    data: { component: AiAnalyticsInsights }
  }
];

const DashboardNode = ({ data }) => {
  const Component = data.component;
  return (
    <div className="bg-background rounded-lg shadow-lg min-w-[300px]">
      <Component />
    </div>
  );
};

const nodeTypes = {
  dashboardNode: DashboardNode
};

const Index = () => {
  usePerformanceMonitoring();
  useDashboardSubscriptions();

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState([]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <DashboardLayout>
      <div style={{ width: '100%', height: 'calc(100vh - 64px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          nodeTypes={nodeTypes}
          onDragOver={onDragOver}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </DashboardLayout>
  );
};

export default Index;