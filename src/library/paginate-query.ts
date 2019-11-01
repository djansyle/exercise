import { Collection } from 'lokijs';
import R from 'ramda';

export type ConnectionInfo<T extends Object = {}> = {
  totalCount: number;
  edges: { cursor: string; node: T }[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
};

export type PaginationParams = { first?: number; after?: string };

export function toCursor(val: number) {
  return val.toString(36);
}

export default function paginate<T extends Object>(
  col: Collection<T & { cursor: number }>,
  args: {
    first?: number;
    after?: string;
    filter?: { [key: string]: any };
  } = {},
): ConnectionInfo<T> {
  const chain = col.chain();
  let query: any = args.filter || {};

  if (args.after) {
    Object.assign(query, { cursor: { $lt: parseInt(args.after, 36) } });
  }

  let result = chain.find(query);
  if (args.first) {
    result = result.limit(args.first);
  }

  const edges = result
    .simplesort('cursor', { desc: true })
    .data()
    .map(node => ({ node, cursor: node.cursor.toString(36) }));

  const totalMatch = col.count(query);
  const totalCount = col.count();
  const endCursor = edges.length > 0 ? R.prop('cursor')(R.last(edges)) : null;

  return {
    totalCount,
    edges,
    pageInfo: {
      hasNextPage: totalMatch > edges.length,
      endCursor,
    },
  };
}
