import {
  PetType,
  PetColor,
  petCollection,
  ownerCollection,
} from '../../library/database';
import { v4 as uuid } from 'uuid';
import { ResourceNotFoundError } from '../../library/error';
import { ValidationError } from 'apollo-server-core';

const nonNullableProperties = ['type', 'name', 'color', 'age'];

export default {
  Mutation: {
    createPet(
      _obj: {},
      args: {
        input: {
          type: PetType;
          name: string;
          color: PetColor;
          age: number;
          owner?: string;
        };
      },
    ) {
      const { owner } = args.input;
      if (owner) {
        const ownerExists = ownerCollection().findOne({ id: owner });
        if (!ownerExists) {
          throw new ResourceNotFoundError(owner, 'owner');
        }
      }

      const id = uuid();
      petCollection().insert({
        id,
        owner: null,
        ...args.input,
        cursor: Date.now(),
      });

      return id;
    },

    editPet(
      _obj: {},
      args: {
        pet: string;
        input: {
          type?: PetType;
          name?: string;
          color?: PetColor;
          age?: number;
          owner?: string;
        };
      },
    ) {
      const invalidValues = nonNullableProperties.filter(
        (prop: any) => (args.input as any)[prop] === null,
      );

      if (invalidValues.length > 0) {
        const nullProperties = invalidValues.join(',');
        throw new ValidationError(
          `Cannot set "null" value to the following properties (${nullProperties}).`,
        );
      }

      const pet = petCollection().findOne({ id: args.pet });
      if (!pet) {
        throw new ResourceNotFoundError(args.pet, 'pet');
      }

      const { owner } = args.input;
      if (owner) {
        const ownerExists = ownerCollection().findOne({ id: owner });
        if (!ownerExists) {
          throw new ResourceNotFoundError(owner, 'owner');
        }
      }

      Object.assign(pet, args.input);
      return true;
    },
  },
};
