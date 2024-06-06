

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


const checkAndSetAllowance = async (wallet, tokenAddress, approvalAddress, amount) => {
  
    if (tokenAddress === ethers.constants.AddressZero) {
        return
    }
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


const params ={
    'fromTokenAddress': from,
    'toTokenAddress': to,
    'amount': amount,
    'fromTokenChainId': "80001",
    'toTokenChainId': "43113", 
    'partnerId': "0",
}




//quotedata

const quoteData = await getQuote(params);

console.log(quoteData)

if(window.ethereum) {
    console.log('detected');

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log(accounts[0])
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      
    //check allowance

      await checkAndSetAllowance(
          signer,
          from, 
          quoteData.allowanceTo, 
          ethers.constants.MaxUint256 
      );
      
    }
    catch(err) {
      console.log(err)
    }
}

    //execute the transaction

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
			'fromTokenAddress': from,
			'toTokenAddress': to,
			'fromTokenChainId': "80001",
			'toTokenChainId': "43113", // Fuji
	
			'widgetId': 0, // get your unique wdiget id by contacting us on Telegram
		}, quoteData); // params have been defined in step 1 and quoteData has also been fetched in step 1
	
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
    