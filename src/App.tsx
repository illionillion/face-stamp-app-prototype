import * as faceapi from '@vladmandic/face-api';
import {
  Carousel,
  CarouselIndicators,
  CarouselSlide,
} from '@yamada-ui/carousel';
import { Dropzone } from '@yamada-ui/dropzone';
import {
  Button,
  Center,
  Container,
  FileButton,
  HStack,
  Heading,
  Image as Img,
  Text,
  useDisclosure,
  useOS,
} from '@yamada-ui/react';
import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import { IoMdDownload } from 'react-icons/io';
import { MdEditDocument } from 'react-icons/md';
import type { exportImages, stampImage } from './@types/exportImages';
import { EditModal } from './components/EditModal';
import { NotSupportModal } from './components/NotSupportModal';

/**
 * アイコン名のリスト
 */
const iconNameList = [
  'beaming_face_with_smiling_eyes-64.png',
  'face_with_tears_of_joy-64.png',
  'grinning_face_with_big_eyes-64.png',
  'grinning_face_with_smiling_eyes-64.png',
  'grinning_face-64.png',
  'grinning_squinting_face-64.png',
  'rolling_on_the_floor_laughing-64.png',
  'smiling_face_with_halo-64.png',
  'smiling_face_with_hearts-64.png',
  'smiling_face_with_smiling_eyes-64.png',
  'winking_face-64.png',
];

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [exportImages, setExportImages] = useState<exportImages[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModelLoading, setIsModelLoading] = useState<boolean>(false);
  const [iconList, setIconList] = useState<HTMLImageElement[]>([]);
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const { isOpen: isNSModalOpen, onOpen: NSModalOpen } = useDisclosure();
  const {
    isOpen: isEditModalOpen,
    onOpen: EditModalOpen,
    onClose: EditModalClose,
  } = useDisclosure();
  const [editData, setEditData] = useState<exportImages | undefined>(undefined);
  const os = useOS();
  const isDropzone = os === 'linux' || os === 'macos' || os === 'windows';

  /**
   * Canvasの取得
   * @param ref
   * @returns
   */
  const getCanvas = (ref: RefObject<HTMLCanvasElement>): HTMLCanvasElement => {
    const canvas: HTMLCanvasElement = ref.current as HTMLCanvasElement;

    return canvas;
  };

  /**
   * Contextの取得
   * @param ref
   * @returns
   */
  const getContext = (
    ref: RefObject<HTMLCanvasElement>,
  ): CanvasRenderingContext2D => {
    const canvas: HTMLCanvasElement = ref.current as HTMLCanvasElement;

    return canvas.getContext('2d') as CanvasRenderingContext2D;
  };

  /**
   * モデルとアイコン画像の読み込み
   * @returns
   */
  const loadData = async () => {
    if (isModelLoading) return;
    await faceapi.nets.ssdMobilenetv1.loadFromUri(
      import.meta.env.BASE_URL + 'model',
    );
    setIconList(
      iconNameList.map((item) => {
        const img = new Image();
        img.src = import.meta.env.BASE_URL + `icons/${item}`;
        return img;
      }),
    );
    setIsModelLoading(true);
  };

  /**
   * ファイル受け取り時の処理
   * @param files
   * @returns
   */
  const handleAcceptedFile = async (files: File[] | undefined) => {
    if (files === undefined || files.length === 0) return;
    setIsLoading(true);
    const images: exportImages[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imageObj = new Image();
      imageObj.src = URL.createObjectURL(file);
      const results = await faceapi.detectAllFaces(imageObj);
      const canvas = getCanvas(canvasRef);
      const context = getContext(canvasRef);
      canvas.width = imageObj.width;
      canvas.height = imageObj.height;
      context.drawImage(imageObj, 0, 0, imageObj.width, imageObj.height);

      const stamp: stampImage[] = [];

      for (const fc of results) {
        const stampObj = iconList[Math.floor(Math.random() * iconList.length)];
        context.drawImage(
          stampObj,
          fc.box.x,
          fc.box.y,
          fc.box.width,
          fc.box.height,
        );
        stamp.push({
          stamp: stampObj,
          x: fc.box.x,
          y: fc.box.y,
          width: fc.box.width,
          height: fc.box.height,
        });
      }

      const base64 = canvas.toDataURL('image/jpeg');
      images.push({
        name: file.name,
        url: base64,
        stamps: stamp,
        image: imageObj,
      });
    }
    setExportImages(images);
    setIsLoading(false);
  };

  const handleOpenEditModal = (index: number) => {
    EditModalOpen();
    setEditData(exportImages[index]);
  };

  const handleCloseEditModal = () => {
    EditModalClose();
    setEditData(undefined);
  };

  /**
   * モーダルのボタンクリック時に遷移
   */
  const handleNSModalClick = () => {
    window.location.href += '?openExternalBrowser=1';
  };

  /**
   * LINEのブラウザかチェック
   */
  const isLine = () => {
    if (
      navigator.userAgent.toUpperCase().includes('LINE') &&
      navigator.userAgent.toUpperCase().includes('ANDROID')
    ) {
      NSModalOpen();
      window.location.href += '?openExternalBrowser=1';
    }
  };

  useEffect(() => {
    isLine();
    loadData();
  }, []);

  return (
    <Container height='100dvh' justifyContent='center'>
      <Heading textAlign='center'>Face Masking App</Heading>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {isDropzone ? (
        <Dropzone
          multiple
          accept={{
            'image/*': [],
          }}
          isLoading={isLoading || !isModelLoading}
          onDropAccepted={handleAcceptedFile}
        >
          <Text>顔が写った画像をドラックアンドドロップ</Text>
        </Dropzone>
      ) : (
        <FileButton
          multiple
          isLoading={isLoading || !isModelLoading}
          accept='image/*'
          onChange={handleAcceptedFile}
        >
          顔が写った画像を選択
        </FileButton>
      )}
      {!!exportImages.length && (
        <Carousel
          slideSize={isDropzone ? '50%' : 'full'}
          align='center'
          controlProps={{
            background: 'blackAlpha.500',
          }}
          index={carouselIndex}
          onChange={setCarouselIndex}
        >
          {exportImages.map((image, index) => (
            <CarouselSlide
              key={index}
              as={Center}
              position='relative'
              background='blackAlpha.100'
            >
              <Img src={image.url} w='full' h='full' objectFit='contain' />
              <HStack
                position='absolute'
                bottom={10}
                left={0}
                right={0}
                justifyContent='center'
              >
                <Button
                  w='fit-content'
                  variant='solid'
                  colorScheme='primary'
                  rightIcon={<MdEditDocument />}
                  onClick={() => handleOpenEditModal(index)}
                >
                  編集
                </Button>
                <Button
                  as='a'
                  w='fit-content'
                  href={image.url}
                  download={image.name}
                  variant='solid'
                  colorScheme='primary'
                  rightIcon={<IoMdDownload />}
                >
                  ダウンロード
                </Button>
              </HStack>
            </CarouselSlide>
          ))}

          <CarouselIndicators
            sx={{
              '& > button': {
                _selected: {
                  background: 'blackAlpha.950',
                },
                background: 'blackAlpha.500',
              },
            }}
          />
        </Carousel>
      )}
      <EditModal
        editData={editData}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
      />
      <NotSupportModal isOpen={isNSModalOpen} onClick={handleNSModalClick} />
    </Container>
  );
}

export default App;
