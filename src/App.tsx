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
  Heading,
  Image as Img,
  Text,
  useDisclosure,
  useOS,
} from '@yamada-ui/react';
import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import { IoMdDownload } from 'react-icons/io';
import { NotSupportModal } from './components/NotSupportModal';
import { FaImage } from "react-icons/fa";
import { FaRegSmileWink } from "react-icons/fa";

type exportImages = {
  name: string;
  url: string;
};

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
  const [faceCoverImage, setFaceCoverImage] = useState<HTMLImageElement>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFaceCoverImageUploading, setIsFaceCoverImageUploading] = useState<boolean>(false);
  const [isModelLoading, setIsModelLoading] = useState<boolean>(false);
  const [iconList, setIconList] = useState<HTMLImageElement[]>([]);
  const { isOpen: isNSModalOpen, onOpen: NSModalOpen } = useDisclosure();
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

      for (const fc of results) {
        let stamp = null;
        // const stamp = iconList[Math.floor(Math.random() * iconList.length)];
        if (faceCoverImage != undefined) {
          stamp = faceCoverImage;
        } else {
          stamp = iconList[Math.floor(Math.random() * iconList.length)];
        }
        context.drawImage(
          stamp,
          fc.box.x,
          fc.box.y,
          fc.box.width,
          fc.box.height,
        );
      }

      const base64 = canvas.toDataURL('image/jpeg');
      images.push({
        name: file.name,
        url: base64,
      });
    }
    setExportImages(images);
    setIsLoading(false);
  };

  /**
   * 顔を隠す写真を受け取る処理
   * @param files
   * @returns
   */
  const handleFaceCoverImage = async (files: File[] | undefined) => {
    setIsFaceCoverImageUploading(true);
    if (files == undefined || files[0] == undefined) return;
    const imageObj = new Image();
    imageObj.src = URL.createObjectURL(files[0]);
    setFaceCoverImage(imageObj);
    setIsFaceCoverImageUploading(false)
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
    <Container justifyContent='center'>
      <Heading textAlign='center'>Face Masking App</Heading>
      {
          faceCoverImage !== undefined &&
          <Container width='100%' display='flex' flexDirection='row' justifyContent='end'>
            <Text>右の写真で顔が隠されます。</Text>
            <Img src={faceCoverImage.src} width='100px' height='100px' objectFit='contain' />
          </Container>
        }
        <FileButton
          isLoading={isFaceCoverImageUploading}
          accept='image/*'
          onChange={handleFaceCoverImage}
          leftIcon={<FaRegSmileWink />}
        >
          顔を隠す写真を選択
        </FileButton>
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
          leftIcon={<FaImage />}
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
        >
          {exportImages.map((image, index) => (
            <CarouselSlide
              key={index}
              as={Center}
              position='relative'
              background='blackAlpha.100'
            >
              <Img src={image.url} w='full' h='full' objectFit='contain' />
              <Button
                as='a'
                position='absolute'
                margin='auto'
                w='fit-content'
                href={image.url}
                download={image.name}
                bottom={10}
                left={0}
                right={0}
                variant='solid'
                colorScheme='primary'
                rightIcon={<IoMdDownload />}
              >
                ダウンロード
              </Button>
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
      <NotSupportModal isOpen={isNSModalOpen} onClick={handleNSModalClick} />
    </Container>
  );
}

export default App;
