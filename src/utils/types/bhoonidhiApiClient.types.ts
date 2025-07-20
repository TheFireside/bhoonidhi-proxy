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

interface CollectionSensor {
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
