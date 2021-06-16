import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { parseUserId } from '../../auth/utils'
import { createLogger } from '../../utils/logger'
const logger = createLogger('CreateTodo')

import * as AWS from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = parseUserId(jwtToken)
  // TODO: Remove a TODO item by id
  try{
    await docClient.delete({
      TableName: todosTable,
      Key: {
          todoId,
          userId
      }
    }).promise();
    logger.info(' TODO item Deleted!')

  }
  catch(e){
      logger.info(`TODO Deletion Error ${e}`)

      throw new Error(e);
  }
  return{
    statusCode: 202,
    headers: {
      'Access-Control-Allow-Origin':'*',
      'Access-Control-Allow-Credentials':true
    },
    body:""
  }
}
