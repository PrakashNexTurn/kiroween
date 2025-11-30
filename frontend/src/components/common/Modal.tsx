import React from 'react';
import { Modal as AntModal } from 'antd';
import type { ModalProps as AntModalProps } from 'antd';

export interface ModalProps extends Omit<AntModalProps, 'open' | 'onCancel' | 'width'> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  ...props
}) => {
  // Map custom size to Ant Design width
  const getWidth = () => {
    switch (size) {
      case 'sm':
        return 400;
      case 'md':
        return 520;
      case 'lg':
        return 720;
      case 'xl':
        return 920;
      default:
        return 520;
    }
  };

  return (
    <AntModal
      open={isOpen}
      onCancel={onClose}
      title={title}
      width={getWidth()}
      closable={showCloseButton}
      footer={null}
      {...props}
    >
      {children}
    </AntModal>
  );
};
