import axios, { AxiosInstance } from 'axios';
import {
  AllCollections,
  CartItems,
  CollectionSensor,
  ProductMeta,
  SearchProductsBody,
} from './types/bhoonidhiApiClient.types';

export class BhoonidhiApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string = 'https://bhoonidhi.nrsc.gov.in') {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        Accept: 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7,hi;q=0.6,mr;q=0.5',
        Connection: 'keep-alive',
        'Content-Type': 'application/json',
        DNT: '1',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest',
        'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        token: '',
      },
    });
  }

  private async post(
    url: string,
    data: Record<string, unknown> | URLSearchParams,
    {
      token,
      cookie,
      isForm = false,
      extraHeaders = {},
    }: {
      token?: string;
      cookie?: string;
      isForm?: boolean;
      extraHeaders?: Record<string, string>;
    } = {},
  ) {
    const headers: Record<string, string> = {
      ...(isForm ? { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } : {}),
      ...(token ? { token } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
      ...extraHeaders,
      Origin: 'https://bhoonidhi.nrsc.gov.in',
      Referer: 'https://bhoonidhi.nrsc.gov.in/bhoonidhi/index.html',
    };
    const body = isForm ? JSON.stringify(data) : data;
    const response = await this.axiosInstance.post(url, body, { headers });
    return response.data;
  }

  async getAccessToken(args: {
    userId: string;
    password: string;
    oldDB?: string;
    action?: string;
  }) {
    return this.post('/bhoonidhi/LoginServlet', {
      userId: args.userId,
      password: args.password,
      oldDB: args.oldDB ?? 'false',
      action: args.action ?? 'VALIDATE_LOGIN',
    });
  }

  async logout({ token }: { token: string }) {
    return this.post('/bhoonidhi/LoginServlet', { action: 'LOGGED_OUT' }, { token });
  }

  async getLocations({ action = 'FILTERLOC', filter }: { action?: string; filter: string }) {
    return this.post('/bhoonidhi/GetLocations', { action, filter });
  }

  async getConfigs(args: {
    currFilter: string;
    userEmail: string;
    userId: string;
    priced?: string;
    resolutions?: string;
    imaging_spectra?: string;
    satellites?: string;
    sensors?: string;
    product_types?: string;
    themes?: string;
    token: string;
    cookie?: string;
    action?: string;
  }) {
    return this.post(
      '/bhoonidhi/SatSenServlet',
      {
        action: args.action ?? 'GETCONFIGFILTERS',
        currFilter: args.currFilter,
        userEmail: args.userEmail,
        userId: args.userId,
        priced: args.priced ?? 'NA',
        resolutions: args.resolutions ?? 'NA',
        imaging_spectra: args.imaging_spectra ?? 'NA',
        satellites: args.satellites ?? 'NA',
        sensors: args.sensors ?? 'NA',
        product_types: args.product_types ?? 'NA',
        themes: args.themes ?? 'NA',
      },
      { token: args.token, cookie: args.cookie, isForm: true },
    );
  }

  async validateSession({ token, cookie }: { token: string; cookie?: string }) {
    return this.post('/bhoonidhi/LoginServlet', { action: 'VALIDATE_SESSION' }, { token, cookie });
  }

  async getAllEvents({ token, cookie }: { token: string; cookie?: string }) {
    return this.post('/bhoonidhi/Events', { action: 'GetAllEvents' }, { token, cookie });
  }

  async getAllShapeNames({ token, cookie }: { token: string; cookie?: string }) {
    return this.post('/bhoonidhi/LocLibServlet', { action: 'GETSHPNAMES' }, { token, cookie });
  }

  async readShapeName({
    token,
    cookie,
    shpName,
    shpCat,
  }: {
    token: string;
    cookie?: string;
    shpName: string;
    shpCat: string;
  }) {
    return this.post(
      '/bhoonidhi/ReadShape',
      { action: 'VALIDATESHP', shpName, shpCat },
      { token, cookie },
    );
  }

  async searchProducts(body: SearchProductsBody, token: string, cookie?: string) {
    return this.post('/bhoonidhi/ProductSearch', body, { token, cookie });
  }

  async viewCart(
    body: { userId: string; cartDate: string; action?: string },
    token: string,
    cookie?: string,
  ): Promise<CartItems> {
    return this.post(
      '/bhoonidhi/CartServlet',
      {
        ...body,
        action: body.action ?? 'VIEWCART',
      },
      { token, cookie },
    );
  }

  async addToCart(body: Record<string, string>, token: string, cookie?: string) {
    return this.post('/bhoonidhi/OpenOrderCart', body, { token, cookie });
  }

  async addToCartV2(body: Record<string, string>, token: string, cookie?: string) {
    return this.post('/bhoonidhi/CartServlet', body, { token, cookie });
  }

  async getAllCollections({
    userId,
    userEmail,
    token,
    cookie,
  }: {
    userId: string;
    userEmail: string;
    token: string;
    cookie?: string;
  }): Promise<AllCollections> {
    return this.post(
      '/bhoonidhi/SatSenServlet',
      { userId, action: 'GETAVCONFIG', userEmail },
      { token, cookie, isForm: true },
    );
  }

  async getCollectionDataAvailability(
    body: Record<string, string>,
    token: string,
    cookie?: string,
  ) {
    return this.post('/bhoonidhi/ProductSearch', body, { token, cookie });
  }

  async confirmCartItems(body: Record<string, string>, token: string, cookie?: string) {
    return this.post('/bhoonidhi/CartServlet', body, { token, cookie });
  }

  async getProductMeta({
    productID,
    token,
    cookie,
    tableType = 'PMETA',
  }: {
    productID: string;
    token: string;
    cookie?: string;
    tableType?: string;
  }): Promise<ProductMeta> {
    return this.post(
      '/bhoonidhi/GetProductMeta',
      {
        action: 'GETPRODMETA',
        productID,
        tableType,
      },
      { token, cookie },
    );
  }

  /**
   * Constructs the download path for a product zip file, matching the logic from the reference code.
   * Applies the same path logic as the downloadProd function.
   * @param args - Object containing required parameters
   * @returns The download path as a string
   */
  getDownloadPath(args: {
    sat: string;
    sen: string;
    imgPath: string;
    prdId: string;
    sid?: string;
    token: string;
  }): string {
    const { sat, sen, imgPath, prdId, sid, token } = args;
    const prodPath = '/bhoonidhi/data/';
    const serverURL = this.axiosInstance.defaults.baseURL;
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
    const cartDate = new Date().toLocaleDateString('en-GB', options).replace(/ /g, '%20');
    let path = imgPath.toUpperCase();
    let mon = '';

    if (path.includes('NOEDA')) {
      path = path.replace('//IMGARCHIVE/NOEDAJPG//', prodPath);
      mon = prdId.split('_')[2]?.substr(2, 3) ?? '';
    } else {
      path = path.substring(0, imgPath.length - 3);
      path = path.replace('/IMGARCHIVE/PRODUCTJPGS/', prodPath) + '/';
    }

    if (sen === 'OLI') {
      path = path.replace('L8/OLI', 'L8/O');
      path = path.replace('L9/OLI', 'L9/O');
    }
    if (sat === 'NVS') {
      path = path.replace('NVS/', 'NV/');
    }
    if (sat === 'NPP') {
      path = path.replace('NPP/VIR/', 'NPP/V/');
    }
    if (sat === 'JP1') {
      path = path.replace('JP1/VIR/', 'JP1/V/');
    }
    if (sat === 'RS2') {
      path = path.replace('RS2/LIS3/', 'RS2/3/');
      path = path.replace('RS2/AWIF/', 'RS2/W/');
      path = path.replace('RS2/LIS4/', 'RS2/F/');
      path = path.replace('RS2/L4FMX/', 'RS2/F/');
    }
    if (sat === 'R2A') {
      path = path.replace('R2A/LIS3/', 'R2A/3/');
      path = path.replace('R2A/AWIF/', 'R2A/W/');
      path = path.replace('R2A/LIS4/', 'R2A/F/');
      path = path.replace('R2A/L4FMX/', 'R2A/F/');
    }
    if (prdId.startsWith('P5_PAN_CD')) {
      if (prdId.includes('_30m')) {
        path = '/bhoonidhi/data/CARTODEM/P5/PAN/30m/';
      } else if (prdId.includes('_2.5m')) {
        path = '/bhoonidhi/data/CARTODEM/P5/PAN/2.5m/';
      } else if (prdId.includes('_10m')) {
        path = '/bhoonidhi/data/CARTODEM/P5/PAN/10m/';
      }
    }

    if (mon !== '') {
      path = path + '/' + mon + '/';
    }

    let downURL = serverURL + path;
    downURL = downURL + prdId + '.zip';
    downURL = downURL + '?token=' + token;
    downURL = downURL + '&product_id=' + prdId;
    if (sid && (sat !== 'NVS' || sen !== 'A')) {
      downURL = downURL + ('&cartDate=' + cartDate + '&sid=' + sid);
    }

    return downURL;
  }

  public getAllCollectionsFromResponse(response: AllCollections): Array<string> {
    if (!response?.Results) return [];
    return response.Results.flatMap((item) =>
      Array.isArray(item.sensors)
        ? item.sensors.map((sensor: CollectionSensor) => sensor.dispName).filter((name) => !!name)
        : [],
    );
  }

  public getCollectionDetailsFromResponse(response: AllCollections, collectionID: string) {
    if (!response?.Results) return null;
    for (const item of response.Results) {
      if (Array.isArray(item.sensors)) {
        const found = item.sensors.find(
          (sensor: CollectionSensor) => sensor.dispName === collectionID,
        );
        if (found) return found;
      }
    }
    return null;
  }
}
