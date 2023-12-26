import {
  Button,
  Image,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@yamada-ui/react';
import type { FC } from 'react';
import type { exportImages } from '../@types/exportImages';

interface EditModalProps {
  editData: exportImages | undefined;
  isOpen: boolean;
  onClose: () => void;
}

export const EditModal: FC<EditModalProps> = ({
  editData,
  isOpen,
  onClose,
}) => {
  return (
    !!editData && (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalHeader>編集モード</ModalHeader>
        <ModalBody>
          <Image src={editData.url} w='full' h='full' objectFit='contain' />
        </ModalBody>
        <ModalFooter>
          <Button colorScheme='danger' onClick={onClose}>
            キャンセル
          </Button>
          <Button colorScheme='success'>保存</Button>
        </ModalFooter>
      </Modal>
    )
  );
};
