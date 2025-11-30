import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Alert, Button, Space, Typography, Collapse } from 'antd';
import { WarningOutlined, ReloadOutlined, RollbackOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console with full details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log to external error tracking service if available
    // Example: Sentry.captureException(error, { extra: errorInfo });
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = (): void => {
    // Reset error state and reload the page
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  handleReset = (): void => {
    // Try to recover without full page reload (graceful degradation)
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backgroundColor: 'var(--color-background-primary)',
          }}
        >
          <div style={{ maxWidth: '800px', width: '100%' }}>
            <Alert
              message={
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div style={{ textAlign: 'center' }}>
                    <WarningOutlined
                      style={{
                        fontSize: '64px',
                        color: 'var(--ant-color-error)',
                        marginBottom: '16px',
                      }}
                    />
                    <Title level={2} style={{ marginBottom: '8px' }}>
                      Oops! Something went wrong
                    </Title>
                    <Paragraph style={{ fontSize: '16px', marginBottom: '24px' }}>
                      We encountered an unexpected error. Please try reloading the page.
                    </Paragraph>
                  </div>

                  {this.state.error && (
                    <Collapse
                      ghost
                      items={[
                        {
                          key: '1',
                          label: 'Error Details',
                          children: (
                            <div>
                              <Text
                                strong
                                style={{
                                  color: 'var(--ant-color-error)',
                                  display: 'block',
                                  marginBottom: '8px',
                                }}
                              >
                                {this.state.error.name}: {this.state.error.message}
                              </Text>
                              {this.state.errorInfo && (
                                <pre
                                  style={{
                                    whiteSpace: 'pre-wrap',
                                    overflow: 'auto',
                                    maxHeight: '256px',
                                    fontSize: '12px',
                                    backgroundColor: 'var(--color-background-tertiary)',
                                    padding: '12px',
                                    borderRadius: '4px',
                                    fontFamily: 'monospace',
                                  }}
                                >
                                  {this.state.errorInfo.componentStack}
                                </pre>
                              )}
                            </div>
                          ),
                        },
                      ]}
                    />
                  )}

                  <Space
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      marginTop: '16px',
                    }}
                  >
                    <Button
                      icon={<RollbackOutlined />}
                      onClick={this.handleReset}
                      size="large"
                    >
                      Try Again
                    </Button>
                    <Button
                      type="primary"
                      icon={<ReloadOutlined />}
                      onClick={this.handleReload}
                      size="large"
                    >
                      Reload Page
                    </Button>
                  </Space>

                  <Paragraph
                    type="secondary"
                    style={{
                      textAlign: 'center',
                      fontSize: '12px',
                      marginTop: '16px',
                      marginBottom: 0,
                    }}
                  >
                    💡 If this problem persists, try clearing your browser cache or checking the
                    browser console for more details
                  </Paragraph>
                </Space>
              }
              type="error"
              showIcon={false}
              style={{
                padding: '32px',
                backgroundColor: 'var(--color-background-secondary)',
              }}
            />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
