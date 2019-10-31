import { expect } from 'chai';
import uuid from 'uuid';
import Loki from 'lokijs';

import * as database from '../../../src/library/database';

describe('Library: Database', function() {
  describe('#initialize', function() {
    before(async function() {
      await database.initialize();
    });

    after(async function() {
      ['owner', 'pet'].map(collection =>
        database.db.removeCollection(collection),
      );
      await database.flush();
    });

    it("should add 'owner' collection", function() {
      expect(database.db.getCollection('owner')).to.be.ok;
    });

    it("should add 'pet' collection", function() {
      expect(database.db.getCollection('pet')).to.be.ok;
    });
  });

  describe('#flush', function() {
    before(async function() {
      this.id = uuid();

      await database.initialize();
      database.db.addCollection('flush').insert({ id: this.id });

      await database.flush();
    });

    it('should save changes to the database', async function() {
      const db = new Loki('store.db');
      await new Promise((resolve, reject) =>
        db.loadDatabase({}, err => {
          if (err) {
            reject(err);
            return;
          }

          resolve();
        }),
      );

      expect(db.getCollection('flush').findOne({ id: this.id })).to.be.ok;
    });
  });
});
