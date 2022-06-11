import HttpRequestAxiosService from './http-request-axios.service';

export class HttpRequestService extends HttpRequestAxiosService {
  constructor(baseURL: any) {
    super();
    this.axios.defaults.baseURL = baseURL;
  }
}
