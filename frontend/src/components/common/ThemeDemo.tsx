/**
 * Theme Demo Component
 * Demonstrates Ant Design ConfigProvider integration with custom themes
 * This component shows how theme tokens are applied to Ant Design components
 */

import { Button, Card, Input, Select, Space, Typography } from 'antd';
import { useTheme } from '../../hooks/useTheme';

const { Title, Text } = Typography;

export function ThemeDemo() {
  const { currentTheme, availableThemes, setTheme } = useTheme();

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Title level={2}>Ant Design Theme Integration Demo</Title>
          <Text>
            This demo shows that Ant Design components are now using the custom theme
            configuration through ConfigProvider.
          </Text>
        </Card>

        <Card title="Theme Selector">
          <Space>
            <Text>Current Theme: {currentTheme}</Text>
            <Select
              value={currentTheme}
              onChange={setTheme}
              style={{ width: 200 }}
              options={availableThemes.map(theme => ({
                label: theme.charAt(0).toUpperCase() + theme.slice(1),
                value: theme,
              }))}
            />
          </Space>
        </Card>

        <Card title="Button Variants">
          <Space wrap>
            <Button type="primary">Primary Button</Button>
            <Button>Default Button</Button>
            <Button type="dashed">Dashed Button</Button>
            <Button type="text">Text Button</Button>
            <Button type="link">Link Button</Button>
            <Button type="primary" danger>
              Danger Button
            </Button>
          </Space>
        </Card>

        <Card title="Input Components">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input placeholder="Basic input" />
            <Input.TextArea placeholder="Text area" rows={3} />
            <Input.Search placeholder="Search input" />
          </Space>
        </Card>

        <Card title="Status Colors">
          <Space wrap>
            <Button type="primary">Primary (Brand)</Button>
            <Button type="primary" style={{ backgroundColor: 'var(--color-status-success)' }}>
              Success
            </Button>
            <Button type="primary" style={{ backgroundColor: 'var(--color-status-warning)' }}>
              Warning
            </Button>
            <Button type="primary" danger>
              Error
            </Button>
            <Button type="primary" style={{ backgroundColor: 'var(--color-status-info)' }}>
              Info
            </Button>
          </Space>
        </Card>
      </Space>
    </div>
  );
}
