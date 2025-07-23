export interface BhoonidhiLoginResponse {
  MSG: string;
  JWT: string;
  USERCATNAME: string;
  USEREMAIL: string;
  TnC_ACC: string;
  USERID: string;
  GSTINFO: string;
  USERNAME: string;
  NUser: string;
  GE_NGE: string;
  USERCAT: string;
  CARTCOUNT: string;
}

export interface CollectionSensor {
  res: string;
  func: string;
  endDate: string;
  dispProd: string;
  satName: string;
  dispName: string;
  senName: string;
  dispSen: string;
  senRefSch: string;
  stDate: string;
  products: string;
}

interface CollectionItem {
  thisMinRes: string;
  ref: string;
  sensors: CollectionSensor[];
  totalEndDate: string;
  cat: string;
  thisMaxRes: string;
  satName: string;
  priced: string;
  totalStartDate: string;
}

export interface AllCollections {
  Results: CollectionItem[];
}

export enum ProductType {
  Standard = 'Standard',
}

export enum QueryType {
  shape = 'shape',
}

export enum IsMX {
  Yes = 'Yes',
  No = 'No',
}

export interface SearchProductsBody {
  userId: string;
  prod: ProductType | string;
  selSats: string;
  offset: string;
  sdate: string;
  edate: string;
  query: string;
  queryType: QueryType | string;
  isMX: IsMX | string;
  loc?: string;
  lat?: string;
  lon?: string;
  radius?: string;
  tllat?: string;
  tllon?: string;
  brlat?: string;
  brlon?: string;
  shpCat?: string;
  shapefilename?: string;
  filters: string;
  [key: string]: string | undefined;
}

export interface CartItem {
  IMAGE_CHAIN: string;
  CURR_SCENE_NO: string;
  SCENE_SPEC: string;
  OBSID: string;
  SRT_ID: string;
  CrnSWLon: string;
  SAT_SPEC_SCHEME: string;
  PASS_TYPE: string;
  STATUS: string;
  PRICED: string;
  SCENE_NO: string;
  ID: string;
  CrnNELat: string;
  QUALITY_SCORE: string;
  BINPERIOD: string;
  TILE_ID: string;
  CrnNELon: string;
  SCENE_CENTER_LAT: string;
  O2_MODE: string;
  SCENE_CENTER_LONG: string;
  SCENE_ID: string;
  ImgCrnNWLon: string;
  DOP: string;
  ACQUISITION_MODE: string;
  PITCH: string;
  CrnNWLat: string;
  SENSOR: string;
  ImgCrnNELat: string;
  ImgCrnSWLat: string;
  SAT_SPEC: string;
  ImgCrnSELon: string;
  IMG_PATH: string;
  IMAGING_MODE: string;
  PRODTYPE: string;
  ImgCrnNELon: string;
  GROUND_ORBIT_NO: string;
  PROD_AV: string;
  SCENE_SPEC_SCHEME: string;
  COVERAGE: string;
  TABLETYPE: string;
  SEGMENT_NO: string;
  PRODUCTID: string;
  YAW: string;
  ImgCrnSELat: string;
  CrnSELat: string;
  SCENE_SEQ: string;
  CrnSWLat: string;
  ROLL: string;
  FILENAME: string;
  ImgCrnSWLon: string;
  SATELLITE: string;
  CrnSELon: string;
  DIRPATH: string;
  AGENCY: string;
  srt: string;
  SUBSCENE_ID: string;
  DCOUNT: string;
  ImgCrnNWLat: string;
  OverLapPercent: string;
  BINRESOLUTION: string;
  IMAGING_ORBIT_NO: string;
  CrnNWLon: string;
}

export interface CartItems {
  Results: CartItem[];
}
