import { GraphQLClient } from 'graphql-request';
import Chance from 'chance';
import { v4 as uuid } from 'uuid';

import { Owner, Pet, PetBreed, PetColor } from '../../src/library/database';
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

export function randomPetInfo(owner?: string): Pet {
  return {
    id: uuid(),
    breed: ['DOG', 'CAT'][chance.integer({ min: 0, max: 1 })] as PetBreed,
    color: ['BLACK', 'BROWN', 'ORANGE', 'WHITE'][
      chance.integer({ min: 0, max: 3 })
    ] as PetColor,
    cursor: Date.now(),
    name: chance.name(),
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
