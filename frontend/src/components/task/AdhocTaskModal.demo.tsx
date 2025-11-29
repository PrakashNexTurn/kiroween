/**
 * Demo/Test file for AdhocTaskModal
 * This file demonstrates the usage of AdhocTaskModal component
 */

import { useState } from 'react';
import { AdhocTaskModal } from './AdhocTaskModal';
import { Button } from '../common';

export function AdhocTaskModalDemo() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = async (instruction: string) => {
    console.log('Executing instruction:', instruction);
    setIsExecuting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsExecuting(false);
    setIsOpen(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">AdhocTaskModal Demo</h1>
      
      <Button onClick={() => setIsOpen(true)}>
        Open Adhoc Task Modal
      </Button>

      <AdhocTaskModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onExecute={handleExecute}
        isExecuting={isExecuting}
      />
    </div>
  );
}
