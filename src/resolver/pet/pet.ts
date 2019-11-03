import changeCase from 'change-case';
import { PetType } from '../../library/database';

export default {
  Pet: {
    __resolveType(parent: { type: PetType }) {
      return changeCase.pascalCase(parent.type);
    },
  },
};
