import { ownerCollection, Owner } from '../../library/database';
import paginate from '../../library/paginate-query';

export default {
  Query: {
    async owners(_obj: {}, args: { first?: number; after?: string }) {
      return paginate<Owner>(ownerCollection(), args);
    },
  },
};
