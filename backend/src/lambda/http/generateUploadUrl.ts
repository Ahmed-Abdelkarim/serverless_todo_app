import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { parseUserId } from '../../auth/utils'
import * as AWS from 'aws-sdk' 
 

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

const bucketName = process.env.TODOS_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = parseUserId(jwtToken)
  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  const url = getUploadUrl(todoId)
  
  await docClient.update({
    TableName: todosTable,
    Key: { userId, todoId },
    UpdateExpression: "set attachmentUrl=:URL",
    ExpressionAttributeValues: {
      ":URL": url.split("?")[0]
  },
  ReturnValues: "UPDATED_NEW"
  }).promise();

  return{
    statusCode: 202,
    headers: {
      'Access-Control-Allow-Origin':'*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadUrl: url
    })
  }
}

function getUploadUrl(todoId: string){
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    key: todoId,
    Expires: parseInt(urlExpiration)
  })
}
