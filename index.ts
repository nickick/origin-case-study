import PromisePool from '@supercharge/promise-pool';
import process from 'process';
import PudgyPenguins from './PudgyPenguin.json';

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

// const penguinCount = PudgyPenguins.length;
const penguinIpfsRoot = 'https://ipfs.io/ipfs/QmWXJXRdExse2YHRY21Wvh4pjRxNRQcWVhcKw4DLVnqGqs'
const penguinCount = argv('fetchRemote') ? 8888 : PudgyPenguins.length;

/**
 * Function to fetch Pudgy Penguins from IPFS. Runs with 100 calls concurrently, seems like at 200+ we start getting errors on fetch.
 * @returns {Array} array of Pudgy Penguins
 */
async function fetchPenguins () {
  const penguins = Array.from(Array(penguinCount).keys());

  const { results, errors } = await PromisePool
    .for(penguins)
    .withConcurrency(100)
    .process(async id => {
      const response = await fetch(`${penguinIpfsRoot}/${id}`)
      const data = await response.json();
      console.log('Fetching PudgyPenguin ID #', id);
      return data;
    })

  console.log(errors);

  return results;
}

/**
 * Adds up number of each trait and returns it in a map
 * @param penguins array of penguins with name and attributes array
 * @returns {object} mapping of traits with counts
 */
function countAttributes (penguins) {
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

  return attributesMap;
}

/**
 * Adds a ratio to the map.
 * @param mapping mapping of traits with counts
 * @returns {object} mapping of traits, now with a ratio key
 */
function getRatioMapping (mapping) {
  const ratioMapping = {};

  for (const trait_type in mapping) {
    if (!ratioMapping[trait_type]) {
      // use a trait count to keep number of total possible traits
      // rarer traits are those that are rare in a smaller set of choices
      ratioMapping[trait_type] = {
        traitCount: 0,
      };
    }

    for (const trait in mapping[trait_type]) {
      // increment trait count when encountering a trait in this mapping for first time
      if (!ratioMapping[trait_type][trait]) {
        ratioMapping[trait_type].traitCount += 1;
      }
      ratioMapping[trait_type][trait] = mapping[trait_type][trait] / penguinCount;
    }
  }

  return ratioMapping;
}

/**
 * Adds a rarity to a Penguin
 * Assumes rarity is inversely proportional to ratio / commonality of trait, so * using sum of 1/ratio per ratio per penguin
 * Also assumes rarity is inversely proportional to number of total possible   * traits in a given trait_type
 * @param penguins Penguins with traits
 * @param ratioMapping Mapping of traits with ratios
 * @returns {Array} Penguins with a rarity assignment, with no changes to order
 */
function setRarity (penguins, ratioMapping) {
  penguins.forEach(penguin => {
    let rarity = 0;
    penguin.attributes.forEach((attribute) => {
      const { trait_type, value } = attribute;
      const attributeRarity = 1 / ratioMapping[trait_type][value] * 1 / ratioMapping[trait_type].traitCount;
      attribute.rarity = attributeRarity;
      rarity += attributeRarity;
    })
    penguin.rarity = rarity;
  });

  return penguins;
}

async function sortByRarity (fetchRemote) {
  const penguins = fetchRemote ? await fetchPenguins() : PudgyPenguins;
  const ratioMapping = getRatioMapping(countAttributes(penguins));
  const penguinsWithRarity = setRarity(penguins, ratioMapping);
  return penguinsWithRarity.sort((a, b) => b.rarity - a.rarity);
}

async function main () {
  console.log(await sortByRarity(argv('fetchRemote')));
}

main();
