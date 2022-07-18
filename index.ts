import PromisePool from '@supercharge/promise-pool';
import process from 'process';
import PudgyPenguinsRaw from './PudgyPenguin.json';

type Attribute = {
  value: string;
  trait_type: string;
}

type Penguin = {
  name: string;
  attributes: Attribute[];
  image?: string;
  rarity?: number;
}

const PudgyPenguins: Penguin[] = PudgyPenguinsRaw;

// taken from https://stackoverflow.com/questions/4351521/how-do-i-pass-command-line-arguments-to-a-node-js-program
// wanted a quick way to toggle where to pull penguins from
const argv = key => {
  // Return true if the key exists and a value is defined
  if ( process.argv.includes( `--${ key }` ) ) return true;
  const value = process.argv.find( element => element.startsWith( `--${ key }=` ) );
  // Return null if the key does not exist and a value is not defined
  if ( !value ) return null;
  return value.replace( `--${ key }=` , '' );
}

/**
 * Function to fetch Pudgy Penguins from IPFS. Runs with 100 calls concurrently, seems like at 200+ we start getting errors on fetch.
 * @returns {Array} array of Pudgy Penguins
 */
async function fetchPenguins (url: string, count: number): Promise<Penguin[]> {
  const penguins = Array.from(Array(count).keys());

  const { results, errors } = await PromisePool
    .for(penguins)
    .withConcurrency(100)
    .process(async id => {
      const response = await fetch(`${url}/${id}`)
      const data = await response.json();
      if (id % 100 === 0) {
        console.log('Fetching PudgyPenguin ID #', id);
      }
      return data;
    })

  console.log('Errors while fetching:', errors);

  return results;
}

type AttributeMapping = {
  [traitType: string]: {
    [trait: string]: number,
  }
}

/**
 * Adds up number of each trait and returns it in a map
 * @param penguins array of penguins with name and attributes array
 * @returns {[object, number]} mapping of traits with counts, and a total penguin count
 */
function countAttributes (penguins: Penguin[]): [AttributeMapping, number] {
  const attributesMap = {};
  
  // set up a mapping of attributes across PudgyPenguins, getting total counts
  penguins.forEach(({attributes}) => {
    attributes.forEach(({trait_type, value}) => {
      // if first time this attribute trait type is found, set it with a value count of 1 for this value
      if (!attributesMap[trait_type]) {
        attributesMap[trait_type] = {
          [value]: 1
        }
      // or of this attribute trait type and value, then set this value and type
      } else if (!attributesMap[trait_type][value]) {
        attributesMap[trait_type][value] = 1;
      // otherwise increment count by 1
      } else {
        attributesMap[trait_type][value] += 1;
      }
    })
  })

  return [attributesMap, penguins.length];
}

type RarenessMapping = {
  [traitType: string]: {
    traitCount: number,
    [trait: string]: number,
  }
}

/**
 * Create a rareness map. { [trait_type]: { [trait_value]: n }}, where n is between 0 and 1
 * @param [mapping, count] mapping of trait counts and a total count of NFTs
 * @returns {object} mapping of rareness
 */
function getRarenessMapping ([mapping, count]: [AttributeMapping, number]): RarenessMapping {
  const rarenessMapping = {};

  for (const trait_type in mapping) {
    if (!rarenessMapping[trait_type]) {
      // use a trait count to keep number of total possible traits
      // rarer traits are those that are rare in a smaller set of choices
      rarenessMapping[trait_type] = {
        traitCount: 0,
      };
    }

    for (const trait in mapping[trait_type]) {
      // increment trait count when encountering a trait in this mapping for first time
      if (!rarenessMapping[trait_type][trait]) {
        rarenessMapping[trait_type].traitCount += 1;
      }
      rarenessMapping[trait_type][trait] = mapping[trait_type][trait] / count;
    }
  }

  return rarenessMapping;
}

/**
 * Adds a rarity to a Penguin
 * Sums the inverses of the rarenesses (sum 1/n)
 * Also adds rarity inversely proportional to number of total possible traits in a given trait_type
 * @param penguins Penguins with traits
 * @param rarenessMapping Mapping of traits with rareness
 * @returns {Array} Penguins with a rarity assignment, with no changes to order
 */
function setRarity (penguins: Penguin[], rarenessMapping: RarenessMapping): Penguin[] {
  penguins.forEach(penguin => {
    let rarity = 0;
    penguin.attributes.forEach((attribute) => {
      const { trait_type, value } = attribute;
      rarity += 1 / rarenessMapping[trait_type][value] * 1 / rarenessMapping[trait_type].traitCount;
    })
    penguin.rarity = rarity;
  });

  return penguins;
}

// const penguinCount = PudgyPenguins.length;
const penguinIpfsRoot = 'https://ipfs.io/ipfs/QmWXJXRdExse2YHRY21Wvh4pjRxNRQcWVhcKw4DLVnqGqs'
const penguinCount = 8888;

async function sortByRarity (fetchRemote) {
  const penguins = fetchRemote ? await fetchPenguins(penguinIpfsRoot, penguinCount) : PudgyPenguins;
  const rarenessMapping = getRarenessMapping(countAttributes(penguins));
  const penguinsWithRarity = setRarity(penguins, rarenessMapping);
  return penguinsWithRarity.sort((a, b) => b.rarity - a.rarity);
}

async function main () {
  console.log(await sortByRarity(argv('fetchRemote')));
}

main();
