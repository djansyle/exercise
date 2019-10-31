import { v4 as uuid } from 'uuid';
import { ownerCollection } from '../../library/database';

export default {
  Mutation: {
    createOwner(
      _obj: {},
      args: {
        input: {
          name: string;
          address: string;
          phone?: string;
          email?: string;
        };
      },
    ) {
      const id = uuid();
      ownerCollection().insert({ ...args.input, id, cursor: Date.now() });
      return id;
    },
  },
};
