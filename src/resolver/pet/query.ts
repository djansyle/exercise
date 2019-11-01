import paginate from '../../library/paginate-query';
import { petCollection } from '../../library/database';

export default {
  Query: {
    pets(
      _obj: {},
      args: { first?: number; after?: string; filter: { owner?: string } },
    ) {
      return paginate(petCollection(), args);
    },
  },
};
