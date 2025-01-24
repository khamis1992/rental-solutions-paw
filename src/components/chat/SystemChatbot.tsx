import { useState } from 'react';
import { Card } from '@/components/ui/card';

export const SystemChatbot = () => {
  const [messages] = useState<string[]>([]);

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {messages.map((message, index) => (
          <div key={index} className="text-sm">
            {message}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default SystemChatbot;