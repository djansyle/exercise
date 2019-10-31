import { ApolloError } from 'apollo-server-express';

export class ResourceNotFoundError extends ApolloError {
  public constructor(id: string, type: string) {
    super(`Resource with id ${id} does not exist.`, 'RESOURCE_NOT_FOUND', { id, type });
  }
}