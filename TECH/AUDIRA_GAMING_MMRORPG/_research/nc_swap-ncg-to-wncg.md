> For the complete documentation index, see [llms.txt](https://docs.nine-chronicles.com/introduction/llms.txt). Markdown versions of documentation pages are available by appending `.md` to page URLs; this page is available as [Markdown](https://docs.nine-chronicles.com/introduction/tokenomics/swap-ncg-to-wncg.md).

# Swap NCG to WNCG

As you may already know, WNCG is backed 1:1 with NCG. You could transfer NCGs from the main launcher of the game to your Ethereum account as WNCG.

### Here’s the detailed steps:

1\. From the main launcher menu, click the Send NCG button.

<figure><img src="https://4131251449-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FSmtywhfKXUhbjWG1su6V%2Fuploads%2FAVGILL5pGPG6pEaQ53oa%2FSendNCG.jpg?alt=media&amp;token=9c61087f-d383-4ce7-a915-c1a9deb2a003" alt=""><figcaption></figcaption></figure>

2\. From this screen below, you can choose to Send NCG to another user or Swap NCG to WNCG. To swap NCG to WNCG, select the second option (**Swap to WNCG**).

<figure><img src="https://4131251449-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FSmtywhfKXUhbjWG1su6V%2Fuploads%2Fs5PkZoItpmXflccl8z88%2FSwapToWNCG.jpg?alt=media&amp;token=b0c018dc-6fb7-4d53-b128-a7e6f48ae82b" alt=""><figcaption></figcaption></figure>

3\. To swap NCG to WNCG, (1) enter the **ETH Address** which will be receiving the WNCG and (2) the amount of NCG you want to transfer. This will send your NCG to the bridge endpoint, which will verify the transaction, and then mint WNCG to send to the above Ethereum address.

FYI, The official WNCG token address for the bridge contract running on the Ethereum network is: [**0xf203Ca1769ca8e9e8FE1DA9D147DB68B6c919817**](https://etherscan.io/token/0xf203Ca1769ca8e9e8FE1DA9D147DB68B6c919817)

### **Please note that:**

* Minimum 100 NCG per transfer (to prevent DDOS/ETH gas)
* Maximum 20,000 NCG ➡ WNCG swap in 24 hours (will be raised gradually with bridge upgrades)
* NCG → WNCG conversion will have a fee to cover for gas in WNCG minting process and to account for other development/ecosystem costs.&#x20;
  * 10 NCG for less than 1,000 NCG&#x20;
  * 1% base fee for between 1,000 NCG and 10,000 NCG, inclusive
  * 2% additional surcharge for amount exceeding 10,000 NCG
    * ex. Swap 15,000 NCG -> (15,000 \* 0.01) + (5,000 \* 0.02) = 150 (base fee) + 100 (additional surcharge) = 250 NCG Fee
* WNCG → NCG conversion will have a 0% fee.
  * You can transfer from [Nine Chronicles Portal](https://nine-chronicles.com/my-account#Transfer)
