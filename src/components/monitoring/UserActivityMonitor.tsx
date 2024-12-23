import { useEffect, useState } from 'react';
import { Chart } from '@/components/ui/chart';
import { supabase } from '@/integrations/supabase/client';
import { ChartConfig } from '@/components/ui/chart';

export const UserActivityMonitor = () => {
  const [activityData, setActivityData] = useState([]);
  
  const chartConfig: ChartConfig = {
    type: 'line',
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  };

  useEffect(() => {
    const fetchActivityData = async () => {
      const { data, error } = await supabase
        .from('user_activity')
        .select('timestamp, activity_count')
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error fetching user activity:', error);
      } else {
        setActivityData(data);
      }
    };

    fetchActivityData();
  }, []);

  return (
    <div className="space-y-4">
      <Chart config={chartConfig}>
        <Chart.Series data={activityData.map(item => item.activity_count)} />
        <Chart.XAxis data={activityData.map(item => item.timestamp)} />
      </Chart>
    </div>
  );
};
