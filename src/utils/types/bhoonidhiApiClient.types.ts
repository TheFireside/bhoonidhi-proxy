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
