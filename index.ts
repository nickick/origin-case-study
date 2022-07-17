import PudgyPenguins from './PudgyPenguin.json';

const attributesMap = {};

// set up a mapping of attributes across PudgyPenguins, getting total counts
PudgyPenguins.forEach(({attributes}) => {
  attributes.forEach(({trait_type, value}) => {
    // if first time this attribute trait type is found, set it with a value count of 1 for this value
    if (!attributesMap[trait_type]) {
      attributesMap[trait_type] = {
        [value]: 1,
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

console.log(attributesMap)