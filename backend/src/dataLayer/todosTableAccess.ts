import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

const XAWS = AWSXRay.captureAWS(AWS);
export default class TodosTableAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosIndex = process.env.TODOS_INDEX
  ) {}

  async getAllTodos(userId) {
    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.todosIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
          ':userId': userId
        },
      ScanIndexForward: false
      }).promise();

      return result.Items;
  }

  async addTodo(newItem) {
    await this.docClient.put({
        TableName: this.todosTable,
        Item: newItem
    }).promise();
    return newItem;
  }

  async updateTodo(todoId, userId, updatedTodo) {
    await this.docClient.update({
      TableName: this.todosTable,      
      Key: {
        userId,
        todoId
      },
      UpdateExpression: "set #name = :name, #dueDate = :dueDate, #done = :done",
      ExpressionAttributeValues:{
          ":name": updatedTodo.name,
          ":dueDate": updatedTodo.dueDate,
          ":done": updatedTodo.done
      },
      ExpressionAttributeNames: {
        '#name': 'name',
        '#dueDate': 'dueDate',
        '#done': 'done'
      },
      ReturnValues:"UPDATED_NEW"    
    }).promise();
  }

  async deleteTodo(todoId, userId){
    await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
          todoId,
          userId
      }
    }).promise();
  }
}