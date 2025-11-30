/**
 * NotFoundPage Component
 * 404 error page displayed when route is not found
 */

import { motion } from 'framer-motion';
import { Button, Result } from 'antd';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigation } from '../utils';

/**
 * NotFoundPage component
 * Displays a 404 error message with navigation options
 * Includes animations and helpful actions to return to the app
 */
export function NotFoundPage() {
  const { goToHome, goBack } = useNavigation();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '672px' }}
      >
        <Result
          status="404"
          title={
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 style={{ fontSize: '32px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                👻 The Ghost Got Lost
              </h1>
            </motion.div>
          }
          subTitle={
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              style={{ fontSize: '18px', color: 'var(--color-text-secondary)' }}
            >
              Even spirits get confused sometimes. This page has vanished into the void!
            </motion.p>
          }
          extra={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                justifyContent: 'center',
              }}
            >
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={goBack}
              >
                Go Back
              </Button>
              <Button
                type="primary"
                icon={<HomeOutlined />}
                onClick={goToHome}
              >
                Go Home
              </Button>
            </motion.div>
          }
        />
      </motion.div>
    </div>
  );
}
