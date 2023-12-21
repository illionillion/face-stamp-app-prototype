import { Button, Modal, ModalBody, ModalFooter } from '@yamada-ui/react';
import type { FC } from 'react';

interface NotSupportModalProps {
    isOpen: boolean
    onClick: () => void
}

/**
 * 未サポートブラウザ時のモーダル
 * @param param0 
 * @returns 
 */
export const NotSupportModal:FC<NotSupportModalProps> = ({ isOpen, onClick }) => {
  return <Modal isOpen={isOpen} >
    <ModalBody>お使いのブラウザは対応していません。</ModalBody>
    <ModalFooter>
      <Button onClick={onClick}>別ブラウザで開く</Button>
    </ModalFooter>
  </Modal>;
};