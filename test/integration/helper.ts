import { GraphQLClient } from 'graphql-request';
import Chance from 'chance';
import { v4 as uuid } from 'uuid';

import { Owner, Pet, PetType, PetColor } from '../../src/library/database';
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

export function randomPetInfo(owner: string | null = null): Pet {
  return {
    id: uuid(),
    type: ['DOG', 'CAT'][chance.integer({ min: 0, max: 1 })] as PetType,
    color: ['BLACK', 'BROWN', 'ORANGE', 'WHITE'][
      chance.integer({ min: 0, max: 3 })
    ] as PetColor,
    cursor: Date.now(),
    name: chance.name(),
    age: chance.integer({ min: 0, max: 20 }),
    owner,
  };
}

export async function createOwnerMutation(args: {
  input: Omit<Owner, 'id' | 'cursor'>;
}) {
  return client.request(
    `
    mutation createOwner($input: CreateOwnerInput!){
      createOwner(input: $input)
    }
  `,
    args,
  );
}

export async function ownerQuery(args: { id: string }) {
  return client.request(
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
) {
  return client.request(
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

export async function createPetMutation(args: {
  input: Omit<Pet, 'id' | 'cursor'>;
}) {
  return client.request(
    `
    mutation createPet($input: CreatePetInput!) {
      createPet(input: $input)
    }
  `,
    args,
  );
}

export async function editPetMutation(args: {
  pet: string;
  input: Partial<Omit<Pet, 'id' | 'cursor'>>;
}) {
  return client.request(
    `
    mutation editPet($pet: ID!, $input: EditPetInput!) {
      editPet(pet: $pet, input: $input)
    }
  `,
    args,
  );
}

export async function petsQuery(
  args: PaginationParams & { filter?: { owner?: string } } = {},
) {
  return client.request(
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
            type
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
