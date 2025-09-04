export enum EColsize {
  INTEGER = 12,
  HALF = 6,
}
export interface ICampaignSlider {
  desk: IDataSlider[];
  mobile: IDataSlider[];
}
export interface IDataSlider {
  id: number;
  id_camp: number;
  extension: string;
  width: number;
  height: number;
  title: string;
  alt: string;
  ordem: number;
}

export interface IImageDataBanner {
  path: string;
  title: string;
  alt: string;
  width: number;
  height: number;
  link: string;
}
export interface IDataBanner {
  id: number;
  colsize: string;
  ordem: number;
  image: IImageDataBanner;
}
export interface ITypeBanner {
  id: string;
  lines: IDataBanner;
}
export interface ICampaignBanner {
  page: ITypeBanner[];
}
