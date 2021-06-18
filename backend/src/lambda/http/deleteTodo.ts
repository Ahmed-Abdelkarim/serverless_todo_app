import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { deleteTodo } from '../../BusinessLogic/todosClass';
import { createLogger } from '../../utils/logger'
const logger = createLogger('CreateTodo')



export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  try{
    await deleteTodo(event)
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
