import { Agent, AgentRegistry, AgentResponse } from './types';
import { normalizeQuery } from '@/utils/chatSynonyms';

export class CoordinatorAgent {
  private agents: AgentRegistry = {};

  registerAgent(agent: Agent) {
    this.agents[agent.name] = agent;
  }

  async route(message: string): Promise<AgentResponse> {
    const normalizedMessage = normalizeQuery(message);
    
    // Get confidence scores from all agents
    const scores = await Promise.all(
      Object.values(this.agents).map(async (agent) => ({
        agent,
        confidence: await agent.canHandle(normalizedMessage)
      }))
    );

    // Sort by confidence and filter those above threshold
    const qualifiedAgents = scores
      .filter(({ confidence }) => confidence > 0.3)
      .sort((a, b) => b.confidence - a.confidence);

    if (qualifiedAgents.length === 0) {
      return {
        content: "I'm not sure how to help with that. Could you rephrase your question?",
        confidence: 0
      };
    }

    // If multiple agents are qualified, we might need to combine their responses
    const responses = await Promise.all(
      qualifiedAgents.map(({ agent }) => agent.process(normalizedMessage))
    );

    // For now, just return the highest confidence response
    return responses[0];
  }
}