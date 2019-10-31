import { GraphQLScalarType, Kind } from 'graphql';
import { UserInputError } from 'apollo-server-core';

function parse(value: number) {
  if (typeof value !== 'number' || value < 0) {
    throw new UserInputError('Not a valid unsigned int value.');
  }

  return value;
}

export default {
  UInt: new GraphQLScalarType({
    name: 'UInt',
    description: 'Unsigned int',
    serialize(value: number) {
      return parse(value);
    },

    parseValue(value: number) {
      return parse(value);
    },

    parseLiteral(ast) {
      if (ast.kind !== Kind.INT) {
        throw new UserInputError('Value must be an integer.');
      }

      return parse(parseInt(ast.value, 10));
    },
  }),
};
