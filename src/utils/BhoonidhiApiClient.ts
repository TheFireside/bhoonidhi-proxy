import axios, { AxiosInstance } from 'axios';
import { AllCollections } from './types/bhoonidhiApiClient.types';

export class BhoonidhiApiClient {
  private axiosInstance: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = 'https://bhoonidhi.nrsc.gov.in') {
    this.baseURL=baseURL;
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
    data: Record<string, string> | URLSearchParams,
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

  async searchProducts(body: Record<string, string>, token: string, cookie?: string) {
    return this.post('/bhoonidhi/ProductSearch', body, { token, cookie });
  }

  async addToCart(body: Record<string, string>, token: string, cookie?: string) {
    return this.post('/bhoonidhi/OpenOrderCart', body, { token, cookie });
  }

  async addToCartV2(body: Record<string, string>, token: string, cookie?: string) {
    return this.post('/bhoonidhi/CartServlet', body, { token, cookie });
  }

  async getAllCollectionNames({
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

  /**
   * Constructs the download path for a product zip file, matching the logic from the reference code.
   * Only uses the required args.
   * @param args - Object containing required parameters
   * @returns The download path as a string
   */
  getDownloadPath(args: {
    sat: string;
    sen: string;
    year: string;
    month: string;
    prdId: string;
    token: string;
  }): string {
    // Only use the needed args
    const { sat, sen, year, month, prdId, token } = args;
    return `/bhoonidhi/data/${sat}/${sen}/${year}/${month}/${prdId}.zip?token=${token}&product_id=${prdId}`;
  }
}
