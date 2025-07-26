import { BhoonidhiApiServices } from './bhoonidhiApiService';
import * as StackDTO from '../types/stackapi/index';

export class StacService {
  private static instance: StacService;

  private constructor(private bhoonidhiService: BhoonidhiApiServices) {}

  public static getInstance(): StacService {
    if (!StacService.instance) {
      StacService.instance = new StacService(BhoonidhiApiServices.getInstance());
    }
    return StacService.instance;
  }

  public getStacLandingPage(baseURL: string = process.env.BASE_URL || ''): StackDTO.StacCatalog {
    return {
      stac_version: '1.0.0',
      id: 'bhoonidhi-proxy-catalog',
      title: 'Bhoonidhi proxy STAC Catalog',
      description: 'A catalog of Bhoonidhi products',
      type: 'Catalog',
      conformsTo: [
        'https://api.stacspec.org/v1.0.0/core',
        'https://api.stacspec.org/v1.0.0/collections',
        'https://api.stacspec.org/v1.0.0/ogcapi-features',
        'https://api.stacspec.org/v1.0.0/item-search',
        'http://www.opengis.net/spec/ogcapi-features-1/1.0/conf/core',
        'http://www.opengis.net/spec/ogcapi-features-1/1.0/conf/oas30',
        'http://www.opengis.net/spec/ogcapi-features-1/1.0/conf/geojson',
      ],
      links: [
        {
          rel: 'self',
          href: baseURL,
          type: 'application/json',
        },
        {
          rel: 'root',
          href: baseURL,
          type: 'application/json',
        },
        {
          rel: 'conformance',
          href: baseURL + '/conformance',
          type: 'application/json',
        },
        {
          rel: 'service-doc',
          type: 'text/html',
          href: baseURL + '/api.html',
        },
        {
          rel: 'search',
          href: baseURL + '/data/search',
          type: 'application/json',
        },
        {
          rel: 'collections',
          href: baseURL + '/data/collections',
          type: 'application/json',
        },
      ],
    };
  }

  async getAllCollections({
    userId,
    userEmail,
    token,
  }: {
    userId: string;
    userEmail: string;
    token: string;
  }) {
    const response = await this.bhoonidhiService.getAllCollections({
      userId,
      userEmail,
      token,
    });

    return this.bhoonidhiService.getAllCollectionsFromResponse(response);
  }
}
