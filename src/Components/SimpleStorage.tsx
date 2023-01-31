import React, { useState } from 'react'
import { ethers } from 'ethers'
import SimpleStorage_abi from '../SimpleStorage_abi.json'

const SimpleStorage = () => {

    // deploy simple storage contract and paste deployed contract address here. This value is local ganache chain
    let contractAddress = '0xCF31E7c9E7854D7Ecd3F3151a9979BC2a82B4fe3';

    const [errorMessage, setErrorMessage] = useState<any>(null);
    const [defaultAccount, setDefaultAccount] = useState<any>(null);
    const [connButtonText, setConnButtonText] = useState<any>('Connect Wallet');

    const [currentContractVal, setCurrentContractVal] = useState(null);

    const [provider, setProvider] = useState<any>(null);
    const [signer, setSigner] = useState<any>(null);
    const [contract, setContract] = useState<any>(null);

    const connectWalletHandler = () => {
        if (((window as any) as any).ethereum && ((window as any) as any).ethereum.isMetaMask) {

            ((window as any) as any).ethereum.request({ method: 'eth_requestAccounts' })
                .then((result: any) => {
                    accountChangedHandler(result[0]);
                    setConnButtonText('Wallet Connected');
                })
                .catch((error: any) => {
                    setErrorMessage(error.message);
                });

        } else {
            console.log('Need to install MetaMask');
            setErrorMessage('Please install MetaMask browser extension to interact');
        }
    }

    // update account, will cause component re-render
    const accountChangedHandler = (newAccount: any) => {
        setDefaultAccount(newAccount);
        updateEthers();
    }

    const chainChangedHandler = () => {
        // reload the page to avoid any errors with chain change mid use of application
        (window as any).location.reload();
    }


    // listen for account changes
    (window as any).ethereum.on('accountsChanged', accountChangedHandler);

    (window as any).ethereum.on('chainChanged', chainChangedHandler);

    const updateEthers = () => {
        let tempProvider = new ethers.providers.Web3Provider((window as any).ethereum);
        setProvider(tempProvider);

        let tempSigner = tempProvider.getSigner();
        setSigner(tempSigner);

        let tempContract = new ethers.Contract(contractAddress, SimpleStorage_abi, tempSigner);
        setContract(tempContract);
    }

    const setHandler = (event: any) => {
        event.preventDefault();
        console.log('sending ' + event.target.setText.value + ' to the contract');
        contract.set(event.target.setText.value);
    }

    const getCurrentVal = async () => {
        let val = await contract.get();
        setCurrentContractVal(val);
    }

    return (
        <div>
            <h4> {"Get/Set Contract interaction"} </h4>
            <button onClick={connectWalletHandler}>{connButtonText}</button>
            <div>
                <h3>Address: {defaultAccount}</h3>
            </div>
            <form onSubmit={setHandler}>
                <input id="setText" type="text" />
                <button type={"submit"}> Update Contract </button>
            </form>
            <div>
                <button onClick={getCurrentVal} style={{ marginTop: '5em' }}> Get Current Contract Value </button>
            </div>
            {currentContractVal}
            {errorMessage}
        </div>
    );
}

export default SimpleStorage;