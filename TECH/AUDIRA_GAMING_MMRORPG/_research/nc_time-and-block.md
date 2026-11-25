> For the complete documentation index, see [llms.txt](https://docs.nine-chronicles.com/introduction/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.nine-chronicles.com/introduction/intro/game-contents/time-and-block.md).

# Time & Block

## Blockchain & Time <a href="#blockchain-and-time" id="blockchain-and-time"></a>

Block time is a measuring unit of the time it takes to produce a new block in a blockchain network. In the Nine Chronicles world, time is measured not on traditional units of time (seconds, minutes) but in blocks.

Various in-game operations require a certain amount of time before they can be completed. This amount of time is represented in the number of blocks for each operation. Block time can vary based on network performance and block difficulty but is on average approximately 10 seconds in the Nine Chronicles network.

![Average Block time and Difficulty in Nine Chronicles](https://1559839972-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2Fk52GDFQC2iLkf9e0z5MU%2Fuploads%2FO2zQk9yAphrdzmwZPVix%2FTime2.png?alt=media\&token=ce81752c-11c1-4932-90c3-c6612cb6c821)

The most important in-game operations which require a certain amount of time to be completed are:

* Round refresh for the Arena​
* ​Crafting & Upgrading​
* Action Points refresh via the Prosperity Meter​

## Arena Refresh Timer <a href="#arena-refresh-timer" id="arena-refresh-timer"></a>

Every round in the arena, players have five tickets at their disposal, which they can use in the span of **2,800** blocks. As soon as the 2,800 blocks pass, the tickets are replenished and a new round begins. One arena week currently lasts 112,000 blocks or 40 Round&#x73;**.** At the end of the arena week the results are tallied, leaderboards reset and players are able to start fighting anew.<br>

![Remaining blocks and time before a new arena round begins.](https://1559839972-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2Fk52GDFQC2iLkf9e0z5MU%2Fuploads%2FgkCp0PUR7MBOHcPsChTF%2FTime1.png?alt=media\&token=58d17797-b65e-4ebe-89b9-0e423398025a)

## The Prosperity Meter & Action Points <a href="#the-prosperity-meter-and-action-points" id="the-prosperity-meter-and-action-points"></a>

The Campaign is the main gameplay element in Nine Chronicles. In order for players to enter a stage in the Campaign, they have to use five Action Points. When players run out of action points they can use the Prosperity meter to refill their Action Points. The Prosperity meter can be used once 1700 blocks have passed since the last time it was used. Action Points required to enter a Campaign StageRemaining Blocks before the Prosperity Meter can be used

![Action Points required to enter a Campaign Stage](https://1559839972-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2Fk52GDFQC2iLkf9e0z5MU%2Fuploads%2FHHZ3CZC0F2IJNtWDNUNG%2FTime7.png?alt=media\&token=4b9be4fd-c450-4959-b177-b5d2addf9433)

![Remaining Blocks before the Prosperity Meter can be used](https://1559839972-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2Fk52GDFQC2iLkf9e0z5MU%2Fuploads%2Fiaonlso30rsbudl2uM6J%2FTime6.png?alt=media\&token=24873291-5a67-4caa-a726-bcb56489797d)

## Action Points Potions <a href="#action-points-potions" id="action-points-potions"></a>

Another way for users to replenish their Action Points is by using Action Points Potions (AP Potions). AP Potions can be used at any given time to refill the Action Points of a player and give them the ability to continue fighting in the campaign without having to wait for the Prosperity Meter to replenish AP Potions can be distinguished between tradeable and non-tradeable and can be acquired:

* By completing certain Campaign stages for the first time (Non-tradeable)
* In the in-game shop (Tradeable)
* As rewards from the Monster Collection (Tradeable)

## The Crafting Queue <a href="#the-crafting-queue" id="the-crafting-queue"></a>

As previously discussed in the Crafting and Upgrading sections, when items are being crafted or upgraded, they are processed via the Crafting Queue. Processing in the Crafting Queue can take a different amount of blocks depending on the rarity of the item, its grade, and the success of the processing. As a general rule, the higher the grade of the item and the rarer the outcome, the more blocks it is going to take for the processing in the Crafting queue to be complete.The Crafting Queue has four available slots which can be occupied simultaneously. Adding a new item in the Crafting Queue can only happen when there is an empty slot available.The information for the number of blocks that each item requires before it is processed can be found on the crafting & upgrading tabs of the blacksmith

![Required blocks for crafting](https://4131251449-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FSmtywhfKXUhbjWG1su6V%2Fuploads%2F7ZFSeoRDYLx3GzqIHXSt%2Fimage.png?alt=media\&token=5e4438ab-af91-4286-97d4-0c570c6b4f91)

![Required blocks for Upgrading](https://4131251449-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FSmtywhfKXUhbjWG1su6V%2Fuploads%2FG5626KNgwIdfByZThBtE%2Fimage.png?alt=media\&token=7c4e874f-8ab5-4eba-827b-cc93177f52ad)

## Hourglasses <a href="#hourglasses" id="hourglasses"></a>

Players have the ability to circumvent the processing times of the Crafting Queue by using Hourglasses to instantly process an item. The amount of hourglasses required to speed up either the *upgrading* or *crafting* of an item is given by this simple formula

$$Hourglasses = Remaining Blocks/3$$

![A full Crafting Queue with the ability to speed up the processing
](https://4131251449-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FSmtywhfKXUhbjWG1su6V%2Fuploads%2F0MrSsfoaDsGxHO7T2c6E%2F%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA%202022-08-02%20%E1%84%8B%E1%85%A9%E1%84%92%E1%85%AE%206.25.02.png?alt=media\&token=7121e123-aeea-4b62-b877-475b9e54a3b3)

Hourglasses can be distinguished between tradeable and non-tradeable and can be acquired:

* By completing certain Campaign stages for the first time (Non-tradeable)
* In the in-game shop (Tradeable)
* As rewards from the Monster Collection (Tradeable)
