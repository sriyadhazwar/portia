import AWS from "aws-sdk";

export class S3Client {
  protected client: AWS.S3;
  private accessID: string = process.env.TELUNJUK_AWS_ACCESS_KEY_ID || "";
  private secretKey: string = process.env.TELUNJUK_AWS_SECRET_ACCESS_KEY || "";
  private endpoint: string = process.env.TELUNJUK_AWS_ENDPOINT || "";
  private bucket: string = process.env.TELUNJUK_AWS_BUCKET || "";

  constructor() {
    this.client = new AWS.S3({
      endpoint: this.endpoint,
      useAccelerateEndpoint: false,
      credentials: new AWS.Credentials(this.accessID, this.secretKey, "")
    });
  }

  public async put(
    request: AWS.S3.Types.PutObjectRequest
  ): Promise<AWS.S3.Types.PutObjectOutput> {
    return new Promise((resolve, reject) => {
      this.client.putObject(request, (error, data) => {
        if (error) {
          return reject(error);
        }

        return resolve(data);
      });
    });
  }

  public createPutPublicJsonRequest(filename: string, contents: string) {
    console.log("location: " + filename);
    const request: AWS.S3.Types.PutObjectRequest = {
      Bucket: this.bucket,
      Key: filename + ".html",
      Body: contents,
      ContentType: "application/json; charset=utf-8",
      ACL: "public-read",
      CacheControl: "max-age=60"
    };

    return request;
  }
}
