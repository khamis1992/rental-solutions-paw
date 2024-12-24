import React from 'react';
import { InteractiveTutorial } from './InteractiveTutorial';

const dashboardSteps = [
  {
    title: "Welcome to Rental Solutions",
    description: "Let's take a quick tour of your dashboard. This tutorial will show you the main features and how to use them effectively.",
    elementId: "dashboard-header"
  },
  {
    title: "Quick Actions",
    description: "Here you can quickly create new agreements, add vehicles, or register customers. Click on any card to get started.",
    elementId: "quick-actions"
  },
  {
    title: "Statistics Overview",
    description: "View key metrics about your rental operations, including active rentals, revenue, and fleet status.",
    elementId: "dashboard-stats"
  },
  {
    title: "Recent Activity",
    description: "Keep track of recent changes and updates in your rental operations.",
    elementId: "recent-activity"
  },
  {
    title: "System Alerts",
    description: "Important notifications and alerts will appear here. Make sure to check them regularly.",
    elementId: "dashboard-alerts"
  }
];

export const DashboardTutorial = () => {
  const handleComplete = () => {
    // Additional actions after tutorial completion
    console.log("Dashboard tutorial completed");
  };

  return (
    <InteractiveTutorial
      tutorialId="dashboard-main"
      steps={dashboardSteps}
      onComplete={handleComplete}
    />
  );
};