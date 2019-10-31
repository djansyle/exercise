import paginate from '../../library/paginate-query';
import { petCollection } from '../../library/database';

export default {
  Owner: {
    pets(owner: { id: string }, args: { first?: number; after?: string }) {
      return paginate(petCollection(), {
        ...args,
        filter: { owner: owner.id },
      });
    },
  },
};
