import { ApolloError, ValidationError } from 'apollo-server-express';
import { PetType, Breed } from './database';

export class ResourceNotFoundError extends ApolloError {
  public constructor(id: string, type: string) {
    super(`Resource with id ${id} does not exist.`, 'RESOURCE_NOT_FOUND', {
      id,
      type,
    });
  }
}

export class InvalidBreedError extends ValidationError {
  constructor(type: PetType, breed: Breed) {
    super(`Pet type ${type} does not have a breed ${breed}`);
  }
}

export class NonNullablePropertyError extends ValidationError {
  constructor(property: string[]) {
    super(
      `Cannot set "null" value to the following properties (${property.join(
        ',',
      )}).`,
    );
  }
}
