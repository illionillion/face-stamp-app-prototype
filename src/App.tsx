import * as faceapi from '@vladmandic/face-api';
import { Carousel, CarouselIndicators, CarouselSlide } from '@yamada-ui/carousel';
import { Dropzone } from '@yamada-ui/dropzone';
import { Button, Center, Container, FileButton, Heading, Image as Img, Text, useOS } from '@yamada-ui/react';
import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import { IoMdDownload } from 'react-icons/io';

type exportImages = {
  name: string;
  url: string;
}

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
  const getContext = (ref: RefObject<HTMLCanvasElement>): CanvasRenderingContext2D => {
    const canvas: HTMLCanvasElement = ref.current as HTMLCanvasElement;

    return canvas.getContext('2d') as CanvasRenderingContext2D;
  };

  /**
   * モデルとアイコン画像の読み込み
   * @returns 
   */
  const loadData = async () => {
    if (isModelLoading) return;
    await faceapi.nets.ssdMobilenetv1.loadFromUri(import.meta.env.BASE_URL + 'model');
    setIconList(iconNameList.map(item => {
      const img = new Image();
      img.src = import.meta.env.BASE_URL + `icons/${item}`;
      return img;
    }));
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
        const stamp = iconList[Math.floor(Math.random() * iconList.length)];
        context.drawImage(stamp, fc.box.x, fc.box.y, fc.box.width, fc.box.height);
      }

      const base64 = canvas.toDataURL('image/jpeg');
      images.push({
        name: file.name,
        url: base64
      });

    }
    setExportImages(images);
    setIsLoading(false);
  };

  useEffect(() => {
    if (navigator.userAgent.toUpperCase().includes('LINE')) {
      window.location.href += '?openExternalBrowser=1'
    }
    loadData();
  }, []);

  return (
    <Container>
      <Heading textAlign="center">Face Masking App</Heading>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {isDropzone ?
        <Dropzone multiple
          accept={{
            'image/*': []
          }}
          isLoading={isLoading || !isModelLoading}
          onDropAccepted={handleAcceptedFile}
        >
          <Text>顔が写った画像をドラックアンドドロップ</Text>
        </Dropzone>
        :
        <FileButton
          multiple
          isLoading={isLoading || !isModelLoading}
          accept='image/*'
          onChange={handleAcceptedFile}
        >顔が写った画像を選択</FileButton>
      }
      {
        !!exportImages.length &&
        <Carousel slideSize="50%" align="center" controlProps={{
          background: 'blackAlpha.500'
        }}
        >
          {exportImages.map((image, index) => (
            <CarouselSlide key={index} as={Center} position="relative" justifyContent="center" alignContent="center" background='blackAlpha.100'>
              <Img src={image.url} w="full" />
              <Button
                as="a"
                position="absolute"
                margin="auto"
                w="fit-content"
                href={image.url}
                download={image.name}
                bottom={10}
                left={0}
                right={0}
                variant="solid"
                colorScheme="primary"
                rightIcon={<IoMdDownload />}
              >ダウンロード</Button>
            </CarouselSlide>
          ))}

          <CarouselIndicators sx={{
            '& > button': {
              _selected: {
                background: 'blackAlpha.950'
              },
              background: 'blackAlpha.500'
            }
          }} />
        </Carousel>}
    </Container>
  );
}

export default App;
