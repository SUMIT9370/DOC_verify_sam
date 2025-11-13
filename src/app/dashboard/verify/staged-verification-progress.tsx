'use client';

import React from 'react';
import { CheckCircle, Loader, FileUp, ScanText, Search, Bot, Database, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type VerificationStage = 'pending' | 'uploading' | 'analyzing' | 'saving' | 'complete' | 'failed';

const stagesConfig = [
  { id: 'uploading', label: 'Uploading', icon: FileUp },
  { id: 'analyzing', label: '7-Stage Analysis', icon: Bot },
  { id: 'saving', label: 'Saving Result', icon: Database },
];

interface StagedVerificationProgressProps {
  currentStage: VerificationStage;
}

export const StagedVerificationProgress: React.FC<StagedVerificationProgressProps> = ({ currentStage }) => {
  const currentStageIndex = stagesConfig.findIndex(s => s.id === currentStage);

  return (
    <div className="w-full pt-4">
      <div className="flex items-center justify-between">
        {stagesConfig.map((stage, index) => {
          const isCompleted = currentStageIndex > index;
          const isActive = currentStageIndex === index;
          const isPending = currentStageIndex < index;

          let statusIcon = <Circle className="h-4 w-4 text-muted-foreground" />;
          if (isCompleted) {
            statusIcon = <CheckCircle className="h-4 w-4 text-green-500" />;
          } else if (isActive) {
            statusIcon = <Loader className="h-4 w-4 text-primary animate-spin" />;
          }
          
          // Special case for failed state
          if (currentStage === 'failed' && isActive) {
            statusIcon = <XCircle className="h-4 w-4 text-destructive" />;
          }

          return (
            <React.Fragment key={stage.id}>
              <div className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
                isCompleted && "text-green-600"
              )}>
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center border-2",
                  isActive && "border-primary",
                  isCompleted && "border-green-500 bg-green-50",
                  isPending && "border-border"
                )}>
                  <stage.icon className={cn(
                      "h-4 w-4",
                      isActive && "animate-pulse"
                  )} />
                </div>
                <p className="text-xs font-medium text-center">{stage.label}</p>
              </div>

              {index < stagesConfig.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 transition-colors",
                  isCompleted ? "bg-green-500" : "bg-border"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
