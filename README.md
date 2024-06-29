## `What is Router Nitro ?`

Router Nitro is a cross-chain swapping engine or protocol designed to enable cross-chain asset transfers. It serves as a mechanism for seamlessly moving digital assets or tokens between different blockchain networks

The Lastest Version employs a trustless method for managing cross-chain asset transfers. In this system, a forwarder entity delivers the requested asset to the user on the destination chain. After confirming the forwarder's successful settlement on the destination chain, they can access the user's deposited funds on the source chain

## `Build Don't Talk`

I know, you got bored of the theory. Not going into much theory from now on, let's start building. Clone the repository in your local.

```
git clone https://github.com/router-resources/BuidingonNitro.git
```
Install the necessary packages

```
npm install
```
Run on localhost

```
npm run dev
```
Your application will start running


## `How to build using Nitro ?`

It's very easy to integrate Nitro in your dapp. All you need is a 20 lines of copy paste code ! **Clone this repository**,hit **npm install** to install all the neccessary package and libraries and hit **npm start** to start the demo dapp. All you need to do is change some parameters based on the dapp that you are building. You find all the suppoted chains and assets [ here](https://docs.routerprotocol.com/develop/voyager/voyager-v2.0/supported-chains-tokens)

This Demo app demonstrate how to use Nitro to transsfer AFTT Tokens from Holsky Chain to Avalanche Fuji Chain . Note, this dapp is just made for demonstration purpose. After having this dapp code on your local system, you can modify for any chain and any token compatible with Nitro  (by changing the parameters) based on the dapp you want to build.

After you have run the dapp on your localhost, it's time to undertand how does the dapp works.

All you need is just 3 easy steps to integrate Nitro into any dapp :-

**Step1: Get the Quote**

**Step2: Check and set allowance**

**Step3: Execute the transaction**

![Untitled Workspace](https://github.com/router-resources/Voyager-2-Cookbook/assets/124175970/0e7775f5-cf4f-41b1-a57d-bfc57e2fc44f)


All these steps and very easy to understand and also you don't need to code as when you'll clone the repoitory ,you'll find all these steps are already implemented for you. All you neeed to do is understand what each step is.


## `Step#1 Getting the Quote`

The Nitro enables you to interact with the Voyager contract and initiate cross-chain token transfers. The first step in this process is to request a quote, which provides you with essential details about the proposed token transfer.

To request a quote, follow these steps:

1. Define the PATH_FINDER_API_URL: Set the PATH_FINDER_API_URL variable to the URL of the Pathfinder API for the Voyager testnet. This is where you will send your quote request.

   ```javascript
   const PATH_FINDER_API_URL = "https://api.pf.testnet.routerprotocol.com/api"
   ```

2. Create the `getQuote` Function: This function handles the quote request. It uses the `axios` library to make an HTTP GET request to the Voyager Pathfinder API.

   ```
   const getQuote = async (params) => {
		const endpoint = "v2/quote"
		const quoteUrl = `${PATH_FINDER_API_URL}/${endpoint}`
	
		console.log(quoteUrl)
	
		try {
			const res = await axios.get(quoteUrl, { params })
			return res.data;
		} catch (e) {
			console.error(`Fetching quote data from pathfinder: ${e}`)
		}    
	}
   ```

3. Call the `getQuote` Function: Use this function to request a quote by passing appropriate parameters.In this repository , this function is called using a a button.

   ```javascript
  
   const quoteParams = {
				'fromTokenAddress': source_token_address,
				'toTokenAddress': destination_token_address,
				'amount': amount,
				'fromTokenChainId': source_chain_id,
				'toTokenChainId': destination_chain_id, 
				'widgetId': 0,
			}
   
   const quoteData = await getQuote(quoteParams);
   console.log("Quote Data:", quoteData);
   ```
These parameters define the details of the token transfer you wish to execute. Let's break down what each parameter represents:

- `'fromTokenAddress'`: This should specify the address of the token you want to transfer from (the source token).

- `'toTokenAddress'`: Provide the address of the token you want to transfer to (the destination token).

- `'amount'`: Set the amount of the token you wish to transfer.

- `'fromTokenChainId'`: This parameter represents the chain ID of the source blockchain. In this case, it's set to "80001."

- `'toTokenChainId'`: Similarly, this parameter specifies the chain ID of the destination blockchain, which, in this example, is "43113" (Fuji).

- `'widgetId'`: This parameter is used to identify the widget responsible for the transfer. You'll typically need to obtain a unique widget ID through contact with the Voyager team, often via Telegram or other means. For now, let's keep it as 0.

With these parameters, you can now call the `getQuote` function with this `params` object to initiate a quote request for your specific token transfer. 


### Response
The `getQuote` function returns the quote data, which typically includes details about the token transfer, such as source and destination chains, token amount, fees, and other relevant information.Click the **Get Quote** button and go to console to see the quote data printed on console.

## Step#2 Checking for Approval

In Step 2 of using Nitro, you'll verify and configure the allowance for token transfers. This process allows Router's swap or transfer contract to safely move tokens on your behalf between blockchain networks.

```

import { ethers, Contract } from 'ethers'

// ERC20 Contract ABI for "Approve" and "Allowance" functions
const erc20_abi = [
    {
        "name": "approve",
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "name": "allowance",
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            }
        ],
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

// Fetch the current allowance and update if needed

const checkAndSetAllowance = async (wallet, tokenAddress, approvalAddress, amount) => {
		
		if (tokenAddress === ethers.constants.AddressZero) {
			return
		}
	
		// Using the provided token address and the ERC20 ABI, we create an instance of the ERC20 contract.
		const erc20 = new ethers.Contract(tokenAddress, erc20_abi, wallet);
		const allowance = await erc20.allowance(await wallet.getAddress(), approvalAddress);
		if (allowance.lt(amount)) {
			const approveTx = await erc20.approve(approvalAddress, amount, {gasPrice: await wallet.provider.getGasPrice()});
			try {
				await approveTx.wait();
				console.log(`Transaction mined succesfully: ${approveTx.hash}`)
			}
			catch (error) {
				console.log(`Transaction failed with error: ${error}`)
			}
		}
		else{

			console.log("enough allowance")
			alert("enough allowance")
		}
	}
```
### 1. Define ERC20 Contract ABI

We begin by defining the ABI (Application Binary Interface) for ERC20 tokens, specifically focusing on the "approve" and "allowance" functions. This ABI is essential for interacting with ERC20 token contracts.

### 2. The `checkAndSetAllowance` Function

This function checks your current allowance and, if necessary, sets a new allowance. It first checks if the token is the native token (ETH), in which case no approval is needed.

### 3. Creating an ERC20 Contract

Using the provided token address and the ERC20 ABI, we create an instance of the ERC20 contract. This contract represents the token you want to set an allowance for.

### 4. Checking Current Allowance

We retrieve your current allowance for the token. The allowance is the maximum amount the Voyager system (or any other address) can withdraw from your wallet.

### 5. Setting the Allowance

If the current allowance is less than the desired amount, we proceed to set a new allowance. We initiate an approval transaction to the ERC20 contract, granting permission to Router's swap or transfer contract to withdraw tokens on your behalf.

### 6. Handling Transactions

The code handles the approval transaction, monitors its status, and logs the transaction hash upon successful confirmation.

When the button is clicked your signer (wallet) is set up and the `checkAndSetAllowance` function is called with the required parameters. You can find it in quote.allowanceTo in the quoteData obtained from step 1


Please replace `"YOUR_PRIVATE_KEY"` and other placeholders with your actual private key and the specific token details.

Then the above can be called to check for allowance

```
	if(window.ethereum) {
		  console.log('detected');
	
		  try {
			const accounts = await window.ethereum.request({
			  method: "eth_requestAccounts",
			});

			console.log(accounts[0])
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();

			

			await checkAndSetAllowance(
				signer,
				from, // fromTokenAddress (USDT on Mumbai)
				quoteData.allowanceTo, // quote.allowanceTo in getQuote(params) response from step 1
				ethers.constants.MaxUint256 // amount to approve (infinite approval)
			);
			setStep2('✅')
		  }
		  catch(err) {
			console.log(err)
		  }
		}

```

## Step 3: Executing the Transaction

In this step, we will explore how to execute a transaction .This process involves sending a transaction to perform the cross-chain token transfer initiated in Step 1 and configured in Step 2.

### 1. The `getTransaction` Function

This function is responsible for actually executing the transaction. It takes in the following parameters

- **`params`**: Parameters required for the transaction, which should include the source and destination token addresses, slippage tolerance, sender and receiver addresses, and the widget ID.
- **`quoteData`**: Quote data obtained from Step 1.


```
  const getTransaction = async (params, quoteData) => {
		const endpoint = "v2/transaction"
		const txDataUrl = `${PATH_FINDER_API_URL}/${endpoint}`
	
		console.log(txDataUrl)
	
		try {
			const res = await axios.post(txDataUrl, {
				...quoteData,
				slippageTolerance: 0.5,
				senderAddress: account,
				receiverAddress: account,
			})
			return res.data;
		} catch (e) {
			console.error(`Fetching tx data from pathfinder: ${e}`)
		}    
	}

```
Then the above function can be called to execute the transaction

```

if(window.ethereum) {
		console.log('detected');
  
		try {
		  const accounts = await window.ethereum.request({
			method: "eth_requestAccounts",
		  });

		  console.log(accounts[0])
		  const provider = new ethers.providers.Web3Provider(window.ethereum);
		  const signer = provider.getSigner();

		  

		  const txResponse = await getTransaction({
			'fromTokenAddress': source_token_address,
			'toTokenAddress': destination_token_address,
			'fromTokenChainId': source_chain_id,
			'toTokenChainId': destination_chain_id, 
			'widgetId': 0, 
		}, quoteData); 
		
		// sending the transaction using the data given by the pathfinder
		const tx = await signer.sendTransaction(txResponse.txn)
		try {
			await tx.wait();
			console.log(`Transaction mined successfully: ${tx.hash}`)
			alert(`Transaction mined successfully: ${tx.hash}`)
			
		}
		catch (error) {
			console.log(`Transaction failed with error: ${error}`)
		}
		}
		catch(err) {
		  console.log(err)
		}
	  }
    
  ```

- **Signer Setup**: Configures a signer using the specified JSON-RPC provider. Replace `"YOUR_PRIVATE_KEY"` with your actual private key. You can also use the `provider.getSigner()` method if you're implementing this for a user interface (UI).

- **Retrieve Transaction Data**: Calls the `getTransaction` function with the necessary parameters to fetch the transaction data from the Nitro system.




**Send Transaction**: Initiates the transaction using the data obtained from the Nitro system.

**Transaction Handling**: Monitors the transaction status. If the transaction is successfully mined, it logs the transaction hash. If there is an error, it logs an error message.

Please replace `"YOUR_PRIVATE_KEY"` with your actual private key and ensure that you have the required parameters, including `params` and `quoteData` obtained from Step 1.
