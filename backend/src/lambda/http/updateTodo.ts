import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createLogger } from '../../utils/logger'
import { parseUserId } from '../../auth/utils'
import * as AWS from 'aws-sdk' 

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const logger = createLogger('updateTodo')
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = parseUserId(jwtToken)
  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  
  const updatedItem = await docClient.update({      
    TableName: todosTable,      
    Key: {
      userId,
      todoId
    },
    UpdateExpression: "set name = :name, dueDate = :dueDate, done = :done",
    ExpressionAttributeValues:{
        ":name": updatedTodo.name,
        ":dueDate": updatedTodo.dueDate,
        ":done": updatedTodo.done
    },
    ReturnValues:"UPDATED_NEW"
  }).promise()

  logger.info('Updating Item ', updatedItem)

  return{
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin':'*'
    },
    body:""
  }
}
