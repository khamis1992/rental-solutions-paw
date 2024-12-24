import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StepForward, StepBack, Play, Info } from "lucide-react";
import { toast } from "sonner";

interface TutorialStep {
  title: string;
  description: string;
  elementId?: string;
}

interface InteractiveTutorialProps {
  tutorialId: string;
  steps: TutorialStep[];
  onComplete?: () => void;
}

export const InteractiveTutorial = ({ tutorialId, steps, onComplete }: InteractiveTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      highlightElement(steps[currentStep + 1].elementId);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      highlightElement(steps[currentStep - 1].elementId);
    }
  };

  const handleComplete = () => {
    setIsPlaying(false);
    removeHighlight();
    localStorage.setItem(`tutorial-${tutorialId}-completed`, 'true');
    toast.success("Tutorial completed!");
    onComplete?.();
  };

  const highlightElement = (elementId?: string) => {
    removeHighlight();
    if (elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        element.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'transition-all', 'duration-300');
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const removeHighlight = () => {
    document.querySelectorAll('.ring-2').forEach(el => {
      el.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
    });
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      highlightElement(steps[currentStep].elementId);
    } else {
      removeHighlight();
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 p-4 w-96 shadow-lg z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Info className="h-5 w-5" />
          Tutorial Guide
        </h3>
        <Button variant="ghost" size="icon" onClick={togglePlay}>
          <Play className={`h-4 w-4 ${isPlaying ? 'text-primary' : ''}`} />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="min-h-[100px]">
          <h4 className="font-medium mb-2">{steps[currentStep].title}</h4>
          <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <StepBack className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              size="sm"
              onClick={handleNext}
            >
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              {currentStep < steps.length - 1 && <StepForward className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};