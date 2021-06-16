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

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = parseUserId(jwtToken)
  
  const itemId = uuid.v4()

  const newItem = {
    userId: userId,
    todoId: itemId,
    ...newTodo,
  }
  await docClient.put({
    TableName: todosTable,
    Item: newItem
  }).promise()

  logger.info('created Todo ', newTodo.name)
  
  return{
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin':'*'
    },
    body: JSON.stringify({
      newItem,
    })
  }
}

