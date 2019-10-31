import changeCase from 'change-case';
import { PetBreed } from '../../library/database';

export default {
  Pet: {
    __resolveType(parent: { breed: PetBreed }) {
      return changeCase.pascalCase(parent.breed);
    },
  },
};
