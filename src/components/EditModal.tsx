import {
  Button,
  Image,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@yamada-ui/react';
import { fabric } from 'fabric';
import type { Canvas } from 'fabric/fabric-impl';
import { useState, type FC, useEffect, useRef } from 'react';
import type { exportImages } from '../@types/exportImages';
interface EditModalProps {
  editData: exportImages | undefined;
  isOpen: boolean;
  onClose: () => void;
}

const CANVAS_ID = 'canvas';
const initialBrushColor = 'red';

export const EditModal: FC<EditModalProps> = ({
  editData,
  isOpen,
  onClose,
}) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const [isLoad, setIsLoad] = useState<boolean>(false);
  const [fabricCanvas, setFabricCanvas] = useState<Canvas>();

  // キャンバスの初期化処理
  useEffect(() => {
    setIsLoad(false);
    setTimeout(() => {
      if (!editData || !imageRef.current) return;
      const canvas = new fabric.Canvas(CANVAS_ID, {
        width: imageRef.current.width,
        height: imageRef.current.height,
      });
      canvas.setWidth(imageRef.current.width);
      canvas.setHeight(imageRef.current.height);
      canvas.freeDrawingBrush.color = initialBrushColor;
      editData.stamps.forEach((element, index) => {
        const fabricImage = new fabric.Image(element.stamp);
        fabricImage.set({
          top: element.y,
          left: element.x,
          scaleX: element.width / element.stamp.width,
          scaleY: element.height / element.stamp.height,
        });
        canvas.add(fabricImage);
      });
      const backgroundImage = new fabric.Image(editData.image);
      canvas.setBackgroundImage(
        backgroundImage,
        canvas.renderAll.bind(canvas),
        {},
      );
      canvas.setZoom(imageRef.current.width / editData.image.width);
      setFabricCanvas(canvas);
      setIsLoad(true);
    }, 1000);
  }, [editData]);

  return (
    !!editData && (
      <Modal isOpen={isOpen} size='6xl' onClose={onClose}>
        <ModalHeader>編集モード</ModalHeader>
        <ModalBody>
          <canvas id={CANVAS_ID} />
          <Image
            ref={imageRef}
            src={editData.url}
            w='full'
            h='full'
            objectFit='contain'
            display={isLoad ? 'none' : 'block'}
            visibility='hidden'
          />
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
