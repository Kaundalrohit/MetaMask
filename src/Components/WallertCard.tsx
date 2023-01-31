import React, { useState } from 'react'
import { ethers } from 'ethers'
// import './WalletCard.css'

const WalletCard = () => {

    const [errorMessage, setErrorMessage] = useState<any>(null);
    const [defaultAccount, setDefaultAccount] = useState<any>(null);
    const [userBalance, setUserBalance] = useState<any>(null);
    const [connButtonText, setConnButtonText] = useState('Connect Wallet');

    const connectWalletHandler = () => {
        if ((window as any).ethereum && (window as any).ethereum.isMetaMask) {
            console.log('MetaMask Here!');

            (window as any).ethereum.request({ method: 'eth_requestAccounts' })
                .then((result: any) => {
                    accountChangedHandler(result[0]);
                    setConnButtonText('Wallet Connected');
                    getAccountBalance(result[0]);
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
        getAccountBalance(newAccount.toString());
    }

    const getAccountBalance = (account: any) => {
        (window as any).ethereum.request({ method: 'eth_getBalance', params: [account, 'latest'] })
            .then((balance: any) => {
                setUserBalance(ethers.utils.formatEther(balance));
            })
            .catch((error: any) => {
                setErrorMessage(error.message);
            });
    };

    const chainChangedHandler = () => {
        // reload the page to avoid any errors with chain change mid use of application
        window.location.reload();
    }


    // listen for account changes
    (window as any).ethereum.on('accountsChanged', accountChangedHandler);

    (window as any).ethereum.on('chainChanged', chainChangedHandler);

    return (
        <div className='walletCard'>
            <h4> {"Connection to MetaMask using window.ethereum methods"} </h4>
            <button onClick={connectWalletHandler}>{connButtonText}</button>
            <div className='accountDisplay'>
                <h3>Address: {defaultAccount}</h3>
            </div>
            <div className='balanceDisplay'>
                <h3>Balance: {userBalance}</h3>
            </div>
            {errorMessage}
        </div>
    );
}

export default WalletCard;