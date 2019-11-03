import {
  PetType,
  PetColor,
  petCollection,
  ownerCollection,
  Breed,
} from '../../library/database';
import { v4 as uuid } from 'uuid';
import {
  ResourceNotFoundError,
  InvalidBreedError,
  NonNullablePropertyError,
} from '../../library/error';

const NonNullableProperties = ['type', 'name', 'color', 'age'];
const DogBreed = [
  'LABRADOR_RETRIEVER',
  'PUG',
  'BEAGLE',
  'SIBERIAN_HUSKY',
  'BULLDOG',
];

const CatBreed = [
  'PERSIAN',
  'RUSSIAN',
  'BENGEL',
  'MAINE_COON',
  'RAGDOLL',
  'BIRMAN',
];

function isValidBreed(type: PetType, breed: Breed) {
  if (type === 'CAT') {
    return CatBreed.includes(breed);
  }

  return DogBreed.includes(breed);
}

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
          breed: Breed;
          owner?: string;
        };
      },
    ) {
      const { type, breed } = args.input;
      if (!isValidBreed(type, breed)) {
        throw new InvalidBreedError(type, breed);
      }

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
          breed?: Breed;
          owner?: string;
        };
      },
    ) {
      const invalidValues = NonNullableProperties.filter(
        (prop: any) => (args.input as any)[prop] === null,
      );

      if (invalidValues.length > 0) {
        throw new NonNullablePropertyError(invalidValues);
      }

      let { type, breed } = args.input;
      const pet = petCollection().findOne({ id: args.pet });
      if (!pet) {
        throw new ResourceNotFoundError(args.pet, 'pet');
      }

      if (!type) {
        type = pet.type;
      }

      if (!breed) {
        breed = pet.breed;
      }

      if (!isValidBreed(type, breed)) {
        throw new InvalidBreedError(type, breed);
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
