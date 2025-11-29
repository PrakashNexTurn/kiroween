/**
 * AdhocTaskHistory Demo
 * Demonstrates the AdhocTaskHistory component with sample data
 */

import { AdhocTaskHistory } from './AdhocTaskHistory';
import type { AdhocTaskHistoryItem } from './AdhocTaskHistory';

/**
 * Sample history data for demonstration
 */
const sampleHistory: AdhocTaskHistoryItem[] = [
  {
    id: '1',
    instruction: 'Fix all linting errors in the codebase. Run the linter, identify all issues, and correct them according to the project\'s code style guidelines.',
    status: 'success',
    executedAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    logs: 'Running linter...\nFound 5 issues\nFixed: Missing semicolons\nFixed: Unused imports\nFixed: Inconsistent spacing\nAll linting errors resolved successfully!',
    filesModified: ['src/app.tsx', 'src/utils/helpers.ts', 'src/components/Button.tsx'],
  },
  {
    id: '2',
    instruction: 'Add comprehensive unit tests for the authentication module',
    status: 'success',
    executedAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    logs: 'Creating test file...\nWriting test cases for login\nWriting test cases for logout\nWriting test cases for token refresh\nAll tests passing (15/15)',
    filesModified: ['tests/auth.test.ts'],
  },
  {
    id: '3',
    instruction: 'Refactor the database connection logic to use connection pooling',
    status: 'failure',
    executedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    logs: 'Analyzing database connection code...\nAttempting to implement connection pooling...\nError: Unable to find database configuration file',
    error: 'DatabaseConfigError: Configuration file not found at expected path',
    filesModified: [],
  },
  {
    id: '4',
    instruction: 'Update the README with installation instructions and usage examples',
    status: 'success',
    executedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    logs: 'Reading existing README...\nAdding installation section\nAdding usage examples\nAdding troubleshooting section\nREADME updated successfully',
    filesModified: ['README.md'],
  },
];

/**
 * Demo component showing AdhocTaskHistory with sample data
 */
export function AdhocTaskHistoryDemo() {
  const handleRerun = (instruction: string) => {
    console.log('Rerunning instruction:', instruction);
    alert(`Rerunning: ${instruction.substring(0, 50)}...`);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">AdhocTaskHistory Demo</h1>
      
      <div className="space-y-8">
        {/* With History */}
        <section>
          <h2 className="text-xl font-semibold mb-4">With History</h2>
          <AdhocTaskHistory history={sampleHistory} onRerun={handleRerun} />
        </section>

        {/* Empty State */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Empty State</h2>
          <AdhocTaskHistory history={[]} onRerun={handleRerun} />
        </section>
      </div>
    </div>
  );
}
