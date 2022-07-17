import PudgyPenguins from './PudgyPenguin.json';
const penguinCount = PudgyPenguins.length;

/**
 * Adds up number of each trait and returns it in a map
 * @returns {object} mapping of traits with counts
 */
function countAttributes () {
  const attributesMap = {};
  
  // set up a mapping of attributes across PudgyPenguins, getting total counts
  PudgyPenguins.forEach(({attributes}) => {
    attributes.forEach(({trait_type, value}) => {
      // if first time this attribute trait type is found, set it with a value count of 1 for this value
      if (!attributesMap[trait_type]) {
        attributesMap[trait_type] = {
          [value]: {
            count: 1,
          }
        }
      // or of this attribute trait type and value, then set this value and type
      } else if (!attributesMap[trait_type][value]) {
        attributesMap[trait_type][value] = {
          count: 1,
        }
      // otherwise increment count by 1
      } else {
        const newCount = attributesMap[trait_type][value].count + 1;
        attributesMap[trait_type][value].count = newCount;
      }
    })
  })

  return attributesMap;
}

/**
 * Adds a ratio to the map
 * @param mapping mapping of traits with counts
 * @returns {object} mapping of traits, now with a ratio key
 */
function setRatio (mapping) {
  for (const trait_type in mapping) {
    for (const trait in mapping[trait_type]) {
      mapping[trait_type][trait].ratio = mapping[trait_type][trait].count / penguinCount;
    }
  }

  return mapping;
}

/**
 * Adds a rarity to a Penguin
 * Assumes rarity is inversely proportional to ratio / commonality of trait, so * using sum of 1/ratio per ratio per penguin
 * @param penguins Penguins with traits
 * @param ratioMapping Mapping of traits with ratios
 * @returns {Array} Penguins with a rarity assignment, with no changes to order
 */
function setRarity (penguins, ratioMapping) {
  penguins.forEach(penguin => {
    let rarity = 0;
    penguin.attributes.forEach(({trait_type, value}) => {
      rarity += 1 / ratioMapping[trait_type][value].ratio;
    })
    penguin.rarity = rarity;
  });

  return penguins;
}

const ratioMapping = setRatio(countAttributes())
const penguinsWithRarity = setRarity(PudgyPenguins, ratioMapping);
const penguinsSortedByRarity = penguinsWithRarity.sort((a, b) => b.rarity - a.rarity)

console.log(penguinsSortedByRarity);