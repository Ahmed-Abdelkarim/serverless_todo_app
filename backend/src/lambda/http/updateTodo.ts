import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { updateTodo } from '../../BusinessLogic/todosClass';
import { createLogger } from '../../utils/logger'

const logger = createLogger('updateTodo')
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  
  const updatedItem = updateTodo(event)

  logger.info('Updating Item ', updatedItem)

  return{
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin':'*',
      'Access-Control-Allow-Credentials': true
    },
    body:""
  }
}
