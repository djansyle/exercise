import {
  PetBreed,
  PetColor,
  petCollection,
  ownerCollection,
} from '../../library/database';
import { v4 as uuid } from 'uuid';
import { ResourceNotFoundError } from '../../library/error';

function ownerExists(id: string) {
  const owner = ownerCollection().findOne({ id });
  if (!owner) {
    throw new ResourceNotFoundError(id, 'owner');
  }
}

export default {
  Mutation: {
    createPet(
      _obj: {},
      args: {
        input: {
          breed: PetBreed;
          name: string;
          color: PetColor;
          age: number;
          owner?: string;
        };
      },
    ) {

      const { owner } = args.input;
      if (owner) {
        ownerExists(owner);
      }

      const id = uuid();
      petCollection().insert({
        id,
        ...args.input,
        cursor: Date.now(),
      });

      return id;
    },

    editPet(
      _obj: {},
      args: {
        id: string;
        input: {
          breed?: PetBreed;
          name?: string;
          color?: PetColor;
          age?: number;
          owner?: string;
        };
      },
    ) {
      const pet = petCollection().find({ id: args.id });
      if (!pet) {
        throw new ResourceNotFoundError(args.id, 'pet');
      }

      const { owner } = args.input;
      if (owner) {
        ownerExists(owner);
      }

      Object.assign(pet, args.input);
      return true;
    },
  },
};
