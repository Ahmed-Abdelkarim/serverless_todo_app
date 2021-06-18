import 'source-map-support/register';
import * as uuid from 'uuid';
import { APIGatewayProxyEvent } from 'aws-lambda';
import TodosTableAccess from '../dataLayer/todosTableAccess';
import TodosStorageAccess from '../dataLayer/todosStorageAccess';
import { getUserId } from '../lambda/utils';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';

const todosTable= new TodosTableAccess()
const todosStorage = new TodosStorageAccess()

export async function getTodos(event: APIGatewayProxyEvent) {
  const userId = getUserId(event)
  return await todosTable.getAllTodos(userId);
}

export async function createTodo(event: APIGatewayProxyEvent) {
  const userId = getUserId(event)
  const itemId = uuid.v4()
  const createdAt = new Date(Date.now()).toISOString()
  const bucketName = todosStorage.getBucketName()
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const newItem = {
    userId: userId,
    todoId: itemId,
    createdAt,
    ...newTodo,
    done: false,
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${itemId}`
  }
  return await todosTable.addTodo(newItem);
}

export async function updateTodo(event: APIGatewayProxyEvent) {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  const userId = getUserId(event)
  return await todosTable.updateTodo(todoId,userId,updatedTodo);
}

export async function deleteTodo(event: APIGatewayProxyEvent) {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  return await todosTable.deleteTodo(todoId, userId);
}

export async function generateUploadUrl(event: APIGatewayProxyEvent) {
  const todoId = event.pathParameters.todoId
  const bucketName = todosStorage.getBucketName();
  const urlExpiration = process.env.SIGNED_URL_EXPIRATION;

  const createSignedUrlRequest = {
      Bucket: bucketName,
      Key: todoId,
      Expires: parseInt(urlExpiration)
  }
  return await todosStorage.getUploadUrl(createSignedUrlRequest);
}