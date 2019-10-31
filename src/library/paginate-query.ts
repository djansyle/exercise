import { Collection } from 'lokijs';
import R from 'ramda';

export default function paginate<T extends Object>(
  col: Collection<T & { cursor: number }>,
  args: {
    first?: number;
    after?: string;
    filter?: { [key: string]: any };
  },
) {
  const chain = col.chain();
  let query: any = args.filter || {};

  if (args.after) {
    Object.assign(query, { cursor: { $gt: parseInt(args.after, 36) } });
  }

  const edges = (args.first ? chain.limit(args.first) : chain)
    .find(query)
    .data()
    .map(edge => ({ ...edge, cursor: edge.cursor.toString(36) }));

  const totalMatch = col.count(query);
  const totalCount = col.count();
  const endCursor = edges.length > 0 ? R.prop('cursor')(R.last(edges)) : null;

  return {
    totalCount,
    edges: R.map(edge => ({ cursor: edge.cursor, node: edge }), edges),
    pageInfo: {
      hasNextPage: totalMatch > edges.length,
      endCursor,
    },
  };
}
