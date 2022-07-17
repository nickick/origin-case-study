import PudgyPenguins from './PudgyPenguin.json';
const penguinCount = PudgyPenguins.length;

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

function setRatio (mapping) {
  for (const trait_type in mapping) {
    for (const trait in mapping[trait_type]) {
      mapping[trait_type][trait].ratio = mapping[trait_type][trait].count / penguinCount;
    }
  }

  return mapping;
}

console.log(setRatio(countAttributes()))