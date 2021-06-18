import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { CreateSignedURLRequest } from '../requests/CreateSignedUrlRequest';

const XAWS = AWSXRay.captureAWS(AWS);

export default class TodosStorageAccess {
  constructor(
    private readonly s3 = new XAWS.S3({
      signatureVersion: 'v4'
    }),
    private readonly bucketName = process.env.TODOS_S3_BUCKET,
  ){}
  getBucketName() {
    return this.bucketName;
  }

  getUploadUrl(createSignedUrlRequest: CreateSignedURLRequest) {
      return this.s3.getSignedUrl('putObject', 
      createSignedUrlRequest
      );
  }
}