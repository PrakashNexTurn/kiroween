import React, { useState } from 'react';
import {
  Button,
  Card,
  Modal,
  Input,
  Textarea,
  Badge,
  ProgressBar,
  LoadingSpinner,
  Select,
  showSuccess,
  showError,
  showInfo,
  showWarning,
} from './index';
import { Phase } from '../../types/project.types';

export const ComponentsDemo: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [selectValue, setSelectValue] = useState('option1');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (e.target.value.trim() === '') {
      setInputError('This field is required');
    } else {
      setInputError('');
    }
  };

  return (
    <div className="p-8 space-y-8 bg-background-primary min-h-screen">
      <h1 className="text-4xl font-bold text-text-primary mb-8">UI Components Demo</h1>

      {/* Buttons */}
      <Card>
        <h2 className="text-2xl font-semibold text-text-primary mb-4">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" size="sm">Primary Small</Button>
          <Button variant="primary" size="md">Primary Medium</Button>
          <Button variant="primary" size="lg">Primary Large</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="ghost">Ghost</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Card>

      {/* Cards */}
      <Card>
        <h2 className="text-2xl font-semibold text-text-primary mb-4">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card hover>
            <h3 className="font-semibold text-text-primary">Hover Card</h3>
            <p className="text-text-secondary">Hover over me!</p>
          </Card>
          <Card backgroundColor="#E3F2FD">
            <h3 className="font-semibold text-text-primary">Custom Color</h3>
            <p className="text-text-secondary">Blue background</p>
          </Card>
          <Card>
            <h3 className="font-semibold text-text-primary">Regular Card</h3>
            <p className="text-text-secondary">Standard card</p>
          </Card>
        </div>
      </Card>

      {/* Modal */}
      <Card>
        <h2 className="text-2xl font-semibold text-text-primary mb-4">Modal</h2>
        <Button onClick={() => setShowModal(true)}>Open Modal</Button>
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Example Modal"
          size="md"
        >
          <p className="text-text-secondary mb-4">
            This is a modal dialog. Press Escape or click the backdrop to close.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowModal(false)}>Confirm</Button>
          </div>
        </Modal>
      </Card>

      {/* Inputs */}
      <Card>
        <h2 className="text-2xl font-semibold text-text-primary mb-4">Inputs</h2>
        <div className="space-y-4 max-w-md">
          <Input
            label="Name"
            placeholder="Enter your name"
            value={inputValue}
            onChange={handleInputChange}
            error={inputError}
          />
          <Input
            label="Email"
            type="email"
            placeholder="email@example.com"
            helperText="We'll never share your email"
          />
          <Input label="Disabled" disabled value="Cannot edit" />
        </div>
      </Card>

      {/* Textarea */}
      <Card>
        <h2 className="text-2xl font-semibold text-text-primary mb-4">Textarea</h2>
        <div className="space-y-4 max-w-md">
          <Textarea
            label="Description"
            placeholder="Enter description"
            value={textareaValue}
            onChange={(e) => setTextareaValue(e.target.value)}
            rows={3}
          />
          <Textarea
            label="Auto-resize Textarea"
            placeholder="Type to see auto-resize"
            autoResize
          />
        </div>
      </Card>

      {/* Select */}
      <Card>
        <h2 className="text-2xl font-semibold text-text-primary mb-4">Select / Dropdown</h2>
        <div className="space-y-4 max-w-md">
          <Select
            label="Choose an option"
            value={selectValue}
            onChange={(e) => setSelectValue(e.target.value)}
            options={[
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' },
              { value: 'option3', label: 'Option 3' },
              { value: 'option4', label: 'Option 4' },
            ]}
            helperText="Select one of the available options"
          />
          <Select
            label="Phase Filter"
            value="all"
            options={[
              { value: 'all', label: 'All Phases' },
              { value: Phase.INIT, label: 'INIT' },
              { value: Phase.SPEC, label: 'SPEC' },
              { value: Phase.BUILD, label: 'BUILD' },
              { value: Phase.TEST, label: 'TEST' },
              { value: Phase.FIX, label: 'FIX' },
              { value: Phase.COMPLETE, label: 'COMPLETE' },
            ]}
          />
          <Select
            label="Size Small"
            size="sm"
            value="small"
            options={[
              { value: 'small', label: 'Small Select' },
              { value: 'other', label: 'Other Option' },
            ]}
          />
          <Select
            label="Size Large"
            size="lg"
            value="large"
            options={[
              { value: 'large', label: 'Large Select' },
              { value: 'other', label: 'Other Option' },
            ]}
          />
          <Select
            label="Disabled Select"
            disabled
            value="disabled"
            options={[
              { value: 'disabled', label: 'Cannot change this' },
            ]}
          />
          <Select
            label="Select with Error"
            error="Please select a valid option"
            value=""
            options={[
              { value: '', label: 'Select an option...' },
              { value: 'valid', label: 'Valid Option' },
            ]}
          />
        </div>
      </Card>

      {/* Badges */}
      <Card>
        <h2 className="text-2xl font-semibold text-text-primary mb-4">Badges</h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant={Phase.INIT} size="sm">INIT</Badge>
          <Badge variant={Phase.SPEC}>SPEC</Badge>
          <Badge variant={Phase.BUILD} size="lg">BUILD</Badge>
          <Badge variant={Phase.TEST}>TEST</Badge>
          <Badge variant={Phase.FIX}>FIX</Badge>
          <Badge variant={Phase.COMPLETE}>COMPLETE</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="info">Info</Badge>
          <Badge customColor="#9C27B0">Custom</Badge>
        </div>
      </Card>

      {/* Progress Bars */}
      <Card>
        <h2 className="text-2xl font-semibold text-text-primary mb-4">Progress Bars</h2>
        <div className="space-y-4">
          <ProgressBar percentage={25} variant="primary" />
          <ProgressBar percentage={50} variant="success" />
          <ProgressBar percentage={75} variant="warning" />
          <ProgressBar percentage={100} variant="danger" />
          <ProgressBar percentage={60} showLabel={false} height="lg" />
        </div>
      </Card>

      {/* Loading Spinners */}
      <Card>
        <h2 className="text-2xl font-semibold text-text-primary mb-4">Loading Spinners</h2>
        <div className="flex gap-8 items-center">
          <LoadingSpinner size="sm" />
          <LoadingSpinner size="md" />
          <LoadingSpinner size="lg" />
          <LoadingSpinner size="md" color="#FF5722" />
        </div>
      </Card>

      {/* Toast Notifications */}
      <Card>
        <h2 className="text-2xl font-semibold text-text-primary mb-4">Toast Notifications</h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => showSuccess('Operation completed successfully!')}>
            Show Success
          </Button>
          <Button onClick={() => showError('An error occurred!')}>
            Show Error
          </Button>
          <Button onClick={() => showInfo('Here is some information')}>
            Show Info
          </Button>
          <Button onClick={() => showWarning('Warning: Please be careful')}>
            Show Warning
          </Button>
        </div>
      </Card>
    </div>
  );
};
