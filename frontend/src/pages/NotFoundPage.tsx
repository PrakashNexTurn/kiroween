/**
 * NotFoundPage Component
 * 404 error page displayed when route is not found
 */

import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common';
import { useNavigation } from '../utils';

/**
 * NotFoundPage component
 * Displays a 404 error message with navigation options
 * Includes animations and helpful actions to return to the app
 */
export function NotFoundPage() {
  const { goToHome, goBack } = useNavigation();

  const handleGoHome = () => {
    goToHome();
  };

  const handleGoBack = () => {
    goBack();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        {/* 404 Number */}
        <motion.h1
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-9xl font-bold mb-4"
          style={{ color: 'var(--color-brand-primary)' }}
        >
          404
        </motion.h1>

        {/* Error Message */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-3xl font-semibold mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Page Not Found
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-lg mb-8"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          The page you're looking for doesn't exist or has been moved.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            onClick={handleGoBack}
            variant="secondary"
            className="flex items-center justify-center gap-2"
          >
            <ArrowLeft size={20} />
            Go Back
          </Button>
          <Button
            onClick={handleGoHome}
            variant="primary"
            className="flex items-center justify-center gap-2"
          >
            <Home size={20} />
            Go Home
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
