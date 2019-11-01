import { expect } from 'chai';
import Loki from 'lokijs';
import R from 'ramda';

import paginate, { ConnectionInfo } from '../../../src/library/paginate-query';

const db = new Loki('test');

function toCursor(val: number) {
  return val.toString(36);
}

function getCursors(result: ConnectionInfo) {}

describe('Library: Paginate', function() {
  before(function() {
    const collection = db.addCollection('owner');
    collection.insert({ id: 1, name: 'foo', age: 10, cursor: 103 });
    collection.insert({ id: 3, name: 'doe', age: 20, cursor: 102 });
    collection.insert({ id: 2, name: 'john', age: 25, cursor: 100 });

    this.collection = collection;
  });

  describe('Given no parameter', function() {
    beforeEach(function() {});

    it('should return pagination format', function() {
      const res = paginate(this.collection);
      expect(res)
        .to.have.property('pageInfo')
        .to.deep.equal({ hasNextPage: false, endCursor: toCursor(100) });
      expect(res).to.have.property('totalCount', 3);
      expect(res)
        .to.have.property('edges')
        .length(3);
    });

    it('should retrieve all the records that is sorted', function() {
      const res = R.compose<ConnectionInfo, ConnectionInfo['edges'], string[]>(
        R.map(R.prop('cursor')),
        R.prop('edges'),
      )(paginate<{ cursor: number }>(this.collection));

      expect(res).to.deep.equal([103, 102, 100].map(toCursor));
    });
  });

  describe("Given 'first' = 1", function() {
    it('should only 1 record', function() {
      expect(paginate(this.collection, { first: 1 }))
        .to.have.property('edges')
        .lengthOf(1);
    });
  });

  describe("Given 'after' is being provided", function() {
    it('should only retrieve records after the cursor', function() {
      const res = paginate(this.collection, { after: toCursor(103) });
      expect(res)
        .to.have.property('edges')
        .lengthOf(2);
      expect(R.map(R.path(['node', 'id']))(res.edges)).to.deep.equal([3, 2]);
    });
  });

  describe("Given 'filter' is provided", function() {
    it('should only retrieve records that matches the query', function() {
      const res = paginate(this.collection, { filter: { age: { $gt: 10 } } });
      expect(res)
        .to.have.property('edges')
        .lengthOf(2);
      expect(R.map(R.path(['node', 'id']))(res.edges)).to.deep.equal([3, 2]);
    });
  });

  describe('Given all argument is provided', function() {
    it('should be able to retrieve records that matches the criteria', function() {
      const res = paginate(this.collection, {
        after: toCursor(103),
        first: 2,
        filter: { age: { $gt: 10 } },
      });
      expect(R.map(R.path(['node', 'id']))(res.edges)).to.deep.equal([3, 2]);
    });
  });
});
