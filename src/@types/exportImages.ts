
export type stampImage = {
  stamp: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type exportImages = {
  name: string;
  url: string;
  stamps: stampImage[];
  image: HTMLImageElement;
};
