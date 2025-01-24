export type AgentResponse = {
  content: string;
  confidence: number;
  metadata?: Record<string, any>;
};

export interface Agent {
  name: string;
  canHandle: (message: string) => Promise<number>; // Returns confidence score 0-1
  process: (message: string, context?: any) => Promise<AgentResponse>;
}

export type AgentRegistry = {
  [key: string]: Agent;
};