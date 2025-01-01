import React from 'react';
import { RecommendationsList } from './RecommendationsList';

interface AnalyticsInsight {
  id: string;
  title: string;
  priority: string;
  description: string;
  category: string;
  insight: string;
  recommendation: string;
  example?: string;
}

export const CodeAnalysisDashboard = () => {
  const recommendations: AnalyticsInsight[] = [
    {
      id: '1',
      title: 'Optimize Database Queries',
      priority: 'high',
      description: 'Multiple unnecessary database queries detected',
      category: 'Performance',
      insight: 'Database queries can be optimized',
      recommendation: 'Implement query batching',
      example: 'Example query optimization'
    },
    {
      id: '2',
      title: 'Improve API Response Times',
      priority: 'medium',
      description: 'API response times are above acceptable limits',
      category: 'Performance',
      insight: 'Consider caching frequently requested data',
      recommendation: 'Implement caching strategies',
      example: 'Use Redis for caching'
    },
    {
      id: '3',
      title: 'Enhance Security Measures',
      priority: 'high',
      description: 'Security vulnerabilities found in the application',
      category: 'Security',
      insight: 'Implement better authentication mechanisms',
      recommendation: 'Use OAuth2 for authentication',
      example: 'Integrate with Auth0'
    },
    {
      id: '4',
      title: 'Refactor Legacy Code',
      priority: 'low',
      description: 'Legacy code is difficult to maintain',
      category: 'Maintainability',
      insight: 'Refactor code to improve readability',
      recommendation: 'Adopt modern coding standards',
      example: 'Use functional programming principles'
    },
    {
      id: '5',
      title: 'Update Dependencies',
      priority: 'medium',
      description: 'Outdated dependencies can lead to security risks',
      category: 'Maintenance',
      insight: 'Regularly update dependencies to their latest versions',
      recommendation: 'Use npm audit to check for vulnerabilities',
      example: 'Run npm update regularly'
    }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Code Analysis Recommendations</h2>
      <RecommendationsList recommendations={recommendations} />
    </div>
  );
};
