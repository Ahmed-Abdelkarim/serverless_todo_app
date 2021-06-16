import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { parseUserId } from '../../auth/utils'
import { createLogger } from '../../utils/logger'
const logger = createLogger('CreateTodo')

import * as AWS from 'aws-sdk' 
import * as uuid from 'uuid'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const bucketName = process.env.TODOS_S3_BUCKET

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = parseUserId(jwtToken)
  
  const itemId = uuid.v4()
  const createdAt = new Date(Date.now()).toISOString();

  const newItem = {
    userId: userId,
    todoId: itemId,
    createdAt,
    ...newTodo,
    done: false,
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${itemId}`
  }
  await docClient.put({
    TableName: todosTable,
    Item: newItem
  }).promise()

  logger.info('created Todo ', newTodo.name)
  
  return{
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin':'*',
      'Access-Control-Allow-Credentials':'*'
    },
    body: JSON.stringify({
      item: newItem
    })
  }
}

