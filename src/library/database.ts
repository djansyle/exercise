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
export type PetBreed = 'CAT' | 'DOG';

export type Pet = {
  id: string;
  name: string;
  color: PetColor;
  breed: PetBreed;
  owner?: string;
  cursor: number;
}

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

export function ownerCollection() {
  return db.getCollection<Owner>('owner')
}

export function petCollection() {
  return db.getCollection<Pet>('pet');
}
