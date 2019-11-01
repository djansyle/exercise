import chaiAsPromised from 'chai-as-promised';
import chai, { expect } from 'chai';
import R from 'ramda';

import { ownerCollection } from '../../src/library/database';
import './common';
import {
  createOwnerMutation,
  randomOwnerInfo,
  ownersQuery,
  ownerQuery,
} from './helper';
import { toCursor } from '../../src/library/paginate-query';

chai.use(chaiAsPromised);

describe('GraphQL: Owner', function() {
  afterEach(function() {
    ownerCollection().clear();
  });

  describe('Mutation: createOwner', function() {
    it('should create and return an id of the owner', async function() {
      const input = R.omit(['id', 'cursor'])(randomOwnerInfo());

      const id = await expect(createOwnerMutation({ input }))
        .to.eventually.be.an('object')
        .to.have.property('createOwner')
        .that.is.a('string');

      expect(
        R.pick(['name', 'address', 'phone', 'email'])(
          ownerCollection().findOne({ id }),
        ),
      ).to.deep.equal(input);
    });
  });

  describe('Query: owners', function() {
    beforeEach(function() {
      this.owners = R.range(0, 2).map(randomOwnerInfo);

      // loki adds additional information in the owners if we don't create a copy of it
      ownerCollection().insert(this.owners.map(R.clone));
    });

    it('should be able to get a list of owners', async function() {
      const result = await expect(ownersQuery())
        .to.eventually.be.an('object')
        .to.have.property('owners')
        .that.is.an('object');

      expect(result).to.have.property('totalCount', 2);
      expect(result).to.have.property('pageInfo');
      expect(result)
        .to.have.property('edges')
        .to.have.lengthOf(2);

      const { edges, pageInfo } = result;

      expect(R.map(R.prop('node'))(edges)).to.have.deep.members(
        R.map(R.omit(['cursor']))(this.owners),
      );

      expect(pageInfo).to.have.property(
        'endCursor',
        toCursor(R.last<{ cursor: number }>(this.owners).cursor),
      );
    });
  });

  describe('Query: owner', function() {
    beforeEach(function() {
      this.owner = randomOwnerInfo();
      ownerCollection().insert(R.clone(this.owner));
    });

    it('should be able to owner info', async function() {
      const result = await expect(ownerQuery({ id: this.owner.id }))
        .to.eventually.be.an('object')
        .to.have.property('owner')
        .that.is.an('object');

      expect(result).to.deep.equal(R.omit(['cursor'])(this.owner));
    });
  });
});
