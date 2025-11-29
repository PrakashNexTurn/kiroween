/**
 * Demo for GenerateSteeringModal Component
 * Demonstrates the modal in different states
 */

import { useState } from 'react';
import { GenerateSteeringModal } from './GenerateSteeringModal';
import { Button } from '../common';
import { showSuccess, showError } from '../common/Toast';

export function GenerateSteeringModalDemo() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasExistingFiles, setHasExistingFiles] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (force: boolean) => {
    setIsGenerating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate success
    const shouldSucceed = Math.random() > 0.3;
    
    if (shouldSucceed) {
      showSuccess(`Steering files generated successfully! (force: ${force})`);
      setIsOpen(false);
    } else {
      showError('Failed to generate steering files. Please try again.');
    }
    
    setIsGenerating(false);
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">GenerateSteeringModal Demo</h1>
      
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={hasExistingFiles}
              onChange={(e) => setHasExistingFiles(e.target.checked)}
              className="h-4 w-4"
            />
            <span>Simulate existing files</span>
          </label>
        </div>

        <Button onClick={() => setIsOpen(true)}>
          Open Generate Steering Modal
        </Button>
      </div>

      <GenerateSteeringModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        hasExistingFiles={hasExistingFiles}
      />
    </div>
  );
}
