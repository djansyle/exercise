import chaiAsPromised from 'chai-as-promised';
import chai, { expect } from 'chai';
import R from 'ramda';

import { petCollection, ownerCollection } from '../../src/library/database';
import './common';
import {
  randomOwnerInfo,
  randomDogInfo,
  randomCatInfo,
  createPetMutation,
  editPetMutation,
  petsQuery,
} from './helper';

import { toCursor } from '../../src/library/paginate-query';

chai.use(chaiAsPromised);

describe('GraphQL: Pet', function() {
  beforeEach(function() {
    this.owner = randomOwnerInfo();
    this.pet = randomDogInfo();

    ownerCollection().insert(R.clone(this.owner));
  });

  afterEach(function() {
    ownerCollection().clear();
    petCollection().clear();
  });

  describe('Mutation: createPet', function() {
    beforeEach(function() {
      this.pet = R.omit(['id', 'cursor'])(this.pet);
    });

    describe('Given no owner has been provided', function() {
      it('should be able to create pet', async function() {
        const id = await expect(createPetMutation({ input: this.pet }))
          .to.eventually.be.an('object')
          .to.have.property('createPet')
          .that.is.a('string');
        expect(petCollection().findOne({ id })).to.be.ok;
      });
    });

    describe('Given owner has been provided', function() {
      describe('When owner exists', function() {
        it('should be able to create pet', async function() {
          const id = await expect(
            createPetMutation({ input: { ...this.pet, owner: this.owner.id } }),
          )
            .to.eventually.be.an('object')
            .to.have.property('createPet')
            .that.is.a('string');

          expect(petCollection().findOne({ id })).to.have.property(
            'owner',
            this.owner.id,
          );
        });
      });

      describe('When owner does not exists', function() {
        it('should give an error with code "RESOURCE_NOT_FOUND"', async function() {
          const error = await expect(
            createPetMutation({ input: { ...this.pet, owner: 'nonexisting' } }),
          ).to.eventually.be.rejected;

          expect(R.path(['response', 'errors'])(error)).to.have.lengthOf(1);

          const { extensions } = error.response.errors[0];
          expect(extensions).to.have.property('code', 'RESOURCE_NOT_FOUND');

          const pet = petCollection().findOne({ id: this.pet.id });
          expect(pet).to.not.equal('nonexisting');
        });
      });
    });
  });

  describe('Mutation: editPet', function() {
    beforeEach(function() {
      this.pet = randomDogInfo();
    });

    describe('Given pet exists', function() {
      beforeEach(function() {
        petCollection().insert(R.clone(this.pet));
      });

      describe('When fields contains invalid values', function() {
        it('should give an error with code "GRAPHQL_VALIDATION_FAILED"', async function() {
          let error = await expect(
            editPetMutation({ id: this.pet.id, input: { name: null } }),
          ).to.eventually.be.rejected;

          expect(R.path(['response', 'errors'])(error)).to.have.lengthOf(1);

          let { extensions } = error.response.errors[0];
          expect(extensions).to.have.property(
            'code',
            'GRAPHQL_VALIDATION_FAILED',
          );

          const pet = petCollection().findOne({ id: this.pet.id });
          expect(pet)
            .to.have.property('owner', this.pet.owner)
            .and.to.not.equal('nonexisting');

          // our current pet is a dog breed
          error = await expect(
            editPetMutation({ id: this.pet.id, input: { breed: 'PERSIAN' } }),
          ).to.eventually.be.rejected;

          expect(R.path(['response', 'errors'])(error)).to.have.lengthOf(1);
          ({ extensions } = error.response.errors[0]);

          expect(extensions).to.have.property(
            'code',
            'GRAPHQL_VALIDATION_FAILED',
          );
        });
      });

      describe('When owner is provided', function() {
        describe('And owner exists', function() {
          beforeEach(function() {
            this.owner = randomOwnerInfo();
            ownerCollection().insert(R.clone(this.owner));
          });

          it('should be able to update the pet', async function() {
            await expect(
              editPetMutation({
                id: this.pet.id,
                input: { owner: this.owner.id },
              }),
            )
              .to.eventually.be.an('object')
              .to.have.property('editPet', true);

            const pet = petCollection().findOne({ id: this.pet.id });
            expect(pet)
              .to.have.property('owner', this.owner.id)
              .and.to.not.equal(this.pet.owner);
          });
        });

        describe('And owner does not exists', function() {
          it('should give an error with code "RESOURCE_NOT_FOUND"', async function() {
            const error = await expect(
              editPetMutation({
                id: this.pet.id,
                input: { owner: 'nonexisting' },
              }),
            ).to.eventually.be.rejected;

            expect(R.path(['response', 'errors'])(error)).to.have.lengthOf(1);

            const { extensions } = error.response.errors[0];
            expect(extensions).to.have.property('code', 'RESOURCE_NOT_FOUND');
          });
        });
      });
    });
  });

  describe('Query: pets', function() {
    beforeEach(function() {
      this.owner = randomOwnerInfo();

      // added + 100 to make sure that it's the latest one
      this.pets = [
        { ...randomDogInfo(), cursor: Date.now() + 100 },
        randomDogInfo(this.owner.id),
      ];

      petCollection().insert(R.clone(this.pets));
    });

    describe('Given owner supplied is null', function() {
      it('should return stray pets', async function() {
        await expect(petsQuery({ filter: { owner: null } }))
          .to.eventually.be.an('object')
          .to.have.property('pets')
          .to.have.property('edges')
          .lengthOf(1);
      });
    });

    describe('Given no owner has been supplied', function() {
      it('should be able to retrieve all', async function() {
        await expect(petsQuery({ filter: {} }))
          .to.eventually.be.an('object')
          .to.have.property('pets')
          .to.have.property('totalCount', 2);
      });
    });

    describe('Given owner has been supplied', function() {
      it('should be able retrieve pets only for the owner', async function() {
        await expect(petsQuery({ filter: { owner: this.owner.id } }))
          .to.eventually.be.an('object')
          .to.have.property('pets')
          .to.have.property('edges')
          .lengthOf(1);
      });
    });

    it('should be able to retrieve pet information', async function() {
      const res = await expect(
        petsQuery({
          first: 1,
          after: toCursor(this.pets[0].cursor),
          filter: { owner: this.owner.id },
        }),
      )
        .to.eventually.be.an('object')
        .to.have.property('pets');

      const { edges, totalCount, pageInfo } = res;
      expect(totalCount).to.equal(2);

      expect(edges).to.deep.equal([
        {
          cursor: toCursor(this.pets[1].cursor),
          node: R.omit(['cursor', 'owner', 'type'])({
            ...this.pets[1],
            __typename: 'Dog',
          }),
        },
      ]);

      expect(pageInfo).to.have.property(
        'endCursor',
        toCursor(this.pets[1].cursor),
      );

      expect(pageInfo).to.have.property('hasNextPage', false);
    });
  });
});
