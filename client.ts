import { GraphQLClient } from 'graphql-request';
import R from 'ramda';

import {
  createOwnerMutation,
  randomOwnerInfo,
  ownersQuery,
  randomDogInfo,
  randomCatInfo,
  createPetMutation,
  editPetMutation,
  ownerQuery,
  petsQuery,
} from './test/integration/helper';
import { Owner, Pet } from './src/library/database';

if (!process.env.ENDPOINT) {
  throw new Error('Missing "ENDPOINT" environment variable.');
}

const inputInfo = R.omit(['id', 'cursor']);

const client = new GraphQLClient(process.env.ENDPOINT as string);
// const chance = new Chance();

const request = client.request.bind(client);

async function execute() {
  console.log('Creating owner.');
  const ownerInfo = inputInfo(randomOwnerInfo());
  let result = await createOwnerMutation({ input: ownerInfo }, request);
  const ownerId = result.createOwner;
  console.log(`Owner has been created with id: ${ownerId}`);
  console.log('Owners:');
  result = await ownersQuery({}, request);

  let owners = R.path<{ node: Owner }[]>(['owners', 'edges'])(result)!.map(
    R.prop('node'),
  );
  console.dir(owners);
  console.log('========================================================');
  console.log(`Creating pet.`);

  const petInfo = inputInfo(
    (Math.random() * 4) % 2 === 0 ? randomDogInfo() : randomCatInfo(),
  );

  result = await createPetMutation({ input: petInfo }, request);
  const petId = result.createPet;
  console.log(`Pet has been created with id: ${petId}`);
  console.log(`Adding owner to the pet.`);

  result = await editPetMutation(
    { pet: petId, input: { owner: ownerId } },
    request,
  );
  if (!result.editPet) {
    console.error('Failed to update pet.');
    return;
  }

  console.log('Pet has been owned by the owner.');
  console.log("Retrieving owner info and it's pets.");
  result = await ownerQuery({ id: ownerId }, request);
  console.log('Owner: ');
  console.log(result.owner);

  console.log('Pets: ');
  result = await petsQuery({ filter: { owner: ownerId } }, request);
  console.log(
    R.path<{ node: Pet }[]>(['pets', 'edges'])(result)!.map(R.prop('node')),
  );
}

execute();
