import Axios from 'axios';

export default class HttpRequestAxiosService {
  public axios: any;
  public cancelToken: any;

  constructor() {
    this.axios = Axios.create();
  }

  public post(url = '', data? : any, config = {}) {
    return this.axios
      .post(url, data, config)
      .then(this.parseResponse)
      .catch( (err: any) => err.response.data);
  }

  public put(url = '', data?: any, config = {}) {
    return this.axios
      .put(url, data, config)
      .then(this.parseResponse)
      .catch((err: any) => err.response.data);
  }

  public get(url = '', config = {}) {
    return this.axios
      .get(url, config)
      .then(this.parseResponse)
      .catch((err: any) => err.response.data);
  }

  public delete(url = '', config = {}) {
    return this.axios
      .delete(url, config)
      .then(this.parseResponse)
      .catch((err: any) => err.response.data);
  }

  private parseResponse = (response: any) => {
    const { data } = response;
    return data;
  };
}
