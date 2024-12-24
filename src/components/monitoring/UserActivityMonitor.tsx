import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface ActivityData {
  timestamp: string;
  activity_count: number;
}

export const UserActivityMonitor = () => {
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  
  useEffect(() => {
    const fetchActivityData = async () => {
      const { data, error } = await supabase
        .from('user_activity')
        .select('*')
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
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleString()}
            />
            <Line 
              type="monotone" 
              dataKey="activity_count" 
              stroke="#8884d8" 
              name="Activity Count"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};