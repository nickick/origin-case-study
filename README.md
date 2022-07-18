# Origin Takehome Rarity Score Calculator
## To run
```
$> npm install
$> npm run start
```
To run rarity ranking on fetched Pudgy Penguins from IPFS:
```
$> npm run start -- --fetchRemote
```


---

## Instructions
- You can take as long as you wish to complete the exercise
- Time commitment: expected to take half a day to a day to complete
- Use the language of your choice (though JS, TypeScript or Python are strongly preferred)
- We'll have a discord channel for you to dialog with us while working on the take-home. Keep us posted of your progress along the way
- The problem is fairly open ended. It is expected you'll ask questions. 
- Deliverable: code + instructions to install and run it (use of a GitHub repo to commit the code preferred)
- Once completed, we'll schedule time for you to walk us through your solution and discuss it.


## NFT collection rarity score calculation and analysis
Context:
- Notice that a collection has a set of traits. For ex. in the Pudgy Penguins collection trait types are Face, Body, Head, Skin, Background
- Notice that each NFT has a unique set of trait values that differentiate it from the other NFTs in the collection.

Dataset:
- We've pre-downloaded the entire metadata set for the Pudgy Penguins collection as a JSON file here. You can use it as input.

Question:
- Implement a rarity score algorithm to rank all the NFTs in a collection from 1 (rarest) to N (most common)
- Apply your ranking algorithm to the Pudgy Penguins collection

Bonus questions (optional):
Note: The questions are in arbitrary order. Pick any of them that is interesting to you. Or all of them if you feel like it!
- Bonus 1: Compare the scores your algorithm produces against scores produced by other tools and marketplaces (https://marketplace.pudgypenguins.com, https://gem.xyz, https://raritysniper.com, …)
- Bonus 2: Write a script to fetch all the metadata for every NFT of a collection directly from the collection's official location (vs using our pre-downloaded data set). For example the metadata for the Pudgy Penguin NFT with ID #1 is [hosted here](https://ipfs.io/ipfs/QmWXJXRdExse2YHRY21Wvh4pjRxNRQcWVhcKw4DLVnqGqs/1).
- Bonus 3: Analyze the correlation between the rarity ranking your algorithm produces with the 2ndary sales transaction volume and price on a NFT marketplace of your choice. Hint: this LooksRare API could be used to fetch the data
