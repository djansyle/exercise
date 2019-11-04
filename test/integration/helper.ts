import { GraphQLClient } from 'graphql-request';
import Chance from 'chance';
import { v4 as uuid } from 'uuid';

import {
  Owner,
  Pet,
  PetType,
  PetColor,
  Breed,
} from '../../src/library/database';
import { PaginationParams } from '../../src/library/paginate-query';

const client = new GraphQLClient(
  `http://localhost:${process.env.HTTP_PORT}/graphql`,
);

export const chance = new Chance();

export function randomOwnerInfo() {
  return {
    id: uuid(),
    name: chance.name(),
    address: chance.address(),
    phone: chance.phone(),
    email: chance.email(),
    cursor: Date.now(),
  };
}

export function randomDogInfo(owner: string | null = null) {
  return {
    id: uuid(),
    type: 'DOG' as PetType,
    color: ['BLACK', 'BROWN', 'ORANGE', 'WHITE'][
      chance.integer({ min: 0, max: 3 })
    ] as PetColor,
    cursor: Date.now(),
    breed: ['LABRADOR_RETRIEVER', 'PUG', 'BEAGLE', 'SIBERIAN_HUSKY', 'BULLDOG'][
      chance.integer({ min: 0, max: 4 })
    ] as Breed,
    name: chance.name(),
    age: chance.integer({ min: 0, max: 20 }),
    owner,
  };
}

export function randomCatInfo(owner: string | null = null) {
  return {
    id: uuid(),
    type: 'CAT' as PetType,
    color: ['BLACK', 'BROWN', 'ORANGE', 'WHITE'][
      chance.integer({ min: 0, max: 3 })
    ] as PetColor,
    cursor: Date.now(),
    breed: ['PERSIAN', 'RUSSIAN', 'BENGEL', 'MAINE_COON', 'RAGDOLL', 'BIRMAN'][
      chance.integer({ min: 0, max: 5 })
    ] as Breed,
    name: chance.name(),
    age: chance.integer({ min: 0, max: 20 }),
    owner,
  };
}

export async function createOwnerMutation(
  args: {
    input: Omit<Owner, 'id' | 'cursor'>;
  },
  request = client.request.bind(client),
) {
  return request(
    `
    mutation createOwner($input: CreateOwnerInput!){
      createOwner(input: $input)
    }
  `,
    args,
  );
}

export async function ownerQuery(
  args: { id: string },
  request = client.request.bind(client),
) {
  return request(
    `
    query owner($id: ID!){
      owner(id: $id) {
        id
        name
        address
        phone
        email
      }
    }
  `,
    args,
  );
}

export async function ownersQuery(
  args: { first?: number; after?: string } = {},
  request = client.request.bind(client),
) {
  return request(
    `
    query owners($first: UInt, $after: String){
      owners(first: $first, after: $after) {
        totalCount
        edges {
          cursor
          node {
            id
            name
            address
            phone
            email
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `,
    args,
  );
}

export async function createPetMutation(
  args: {
    input: Omit<Pet, 'id' | 'cursor'>;
  },
  request = client.request.bind(client),
) {
  return request(
    `
    mutation createPet($input: CreatePetInput!) {
      createPet(input: $input)
    }
  `,
    args,
  );
}

export async function editPetMutation(
  args: {
    id: string;
    input: Partial<Omit<Pet, 'id' | 'cursor'>>;
  },
  request = client.request.bind(client),
) {
  return request(
    `
    mutation editPet($id: ID!, $input: EditPetInput!) {
      editPet(id: $id, input: $input)
    }
  `,
    args,
  );
}

export async function petsQuery(
  args: PaginationParams & { filter?: { owner?: string } } = {},
  request = client.request.bind(client),
) {
  return request(
    `
    query pets($first: UInt, $after: String, $filter: PetsFilterInput) {
      pets(first: $first, after: $after, filter: $filter) {
        totalCount
        edges {
          cursor
          node {
            id
            name
            color
            age
            breed
            __typename
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  `,
    args,
  );
}
