import { ownerCollection, Owner } from '../../library/database';
import paginate from '../../library/paginate-query';

export default {
  Query: {
    owners(_obj: {}, args: { first?: number; after?: string }) {
      return paginate<Owner>(ownerCollection(), args);
    },

    owner(_obj: {}, args: { id: string }) {
      return ownerCollection().findOne(args);
    },
  },
};
