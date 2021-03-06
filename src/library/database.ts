import Loki from 'lokijs';

export type Owner = {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  cursor: number;
};

export type PetColor = 'WHITE' | 'BROWN' | 'BLACK' | 'ORANGE';
export type PetType = 'CAT' | 'DOG';
export type DogBreed =
  | 'LABRADOR_RETRIEVER'
  | 'PUG'
  | 'BEAGLE'
  | 'SIBERIAN_HUSKY'
  | 'BULLDOG';

export type CatBreed =
  | 'PERSIAN'
  | 'RUSSIAN'
  | 'BENGEL'
  | 'MAINE_COON'
  | 'RAGDOLL'
  | 'BIRMAN';

export type Breed = DogBreed | CatBreed;

export type Pet = {
  id: string;
  name: string;
  color: PetColor;
  type: PetType;
  age: number;
  owner: string | null;
  breed: Breed;
  cursor: number;
};

function ensureCollectionExists(ref: Loki, name: string) {
  const collection = ref.getCollection(name);
  if (!collection) {
    return ref.addCollection(name);
  }

  return collection;
}

export const db = new Loki('store.db');

export async function initialize() {
  return new Promise((resolve, reject) => {
    db.loadDatabase({}, err => {
      if (err) {
        reject(err);
        return;
      }

      ['owner', 'pet'].map(ensureCollectionExists.bind(null, db));
      resolve();
    });
  });
}

export async function flush() {
  return new Promise((resolve, reject) => {
    db.saveDatabase(err => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

export function ownerCollection() {
  return db.getCollection<Owner>('owner');
}

export function petCollection() {
  return db.getCollection<Pet>('pet');
}
