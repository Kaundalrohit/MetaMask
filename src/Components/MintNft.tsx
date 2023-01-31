import { ethers } from "ethers"
import { Fragment } from "react"
import VoucherRohit from "../utils/VoucherRohit"
import EhisabERC721 from './../artifacts/EhisabERC721.json'
import MARKETPLACE_ARTIFACTS from './../artifacts/EhisabMarketplace.json'
import Erc1155 from './../artifacts/Erc1155.json'

export default () => {

    const MARKETPLACE_ADDRESS = "0xc047A78f99458D56932b761a93D6CfCB13Bd298c"
    const ERC721_ADDRESS = "0xf96cdb86aed0898a8f1aab7158b71b90797e1545"


    const ethereumInstalled = () => {
        return (window as any).ethereum
    }
    const loginWithMetamaskConnect = async () => {
        // debugger
        const ethereum = ethereumInstalled()
        if (ethereum) {
            const networkVersion = ethereum.networkVersion
            try {
                const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
                const eth_chainId = await ethereum.request({ method: 'eth_chainId' })
                const provider = new ethers.providers.Web3Provider(ethereum)
                return { accounts, eth_chainId, provider }
            } catch (error) {
                console.log("loginWithMetamaskConnect error", error);
                return null
            }
        } else {
            window.open(`https://metamask.app.link/dapp/${window.location.hostname}`)
        }
        console.log("loginWithMetamaskConnect null");
        return null
    }

    const getMyProvider = async () => {
        // debugger
        try {
            const { accounts, eth_chainId, provider }: any = await loginWithMetamaskConnect();
            console.log('provider', provider);
            let balanceInWei = await provider.getBalance(accounts[0])
            let gasPriceInWei = await provider.getGasPrice()

            let balanceInEth = ethers.utils.formatEther(balanceInWei)
            let gasPriceInEth = ethers.utils.formatEther(gasPriceInWei)

            return { provider, accounts, eth_chainId, balanceInEth, gasPriceInEth, error: null }
        } catch (error) {
            console.log("getMyProvider error", error);
            // debugger
            return { error }
        }
    }

    const getERC721Contract = async () => {
        // debugger
        const abi = EhisabERC721.abi;
        const { provider, accounts } = await getMyProvider()
        const signer = provider.getSigner()
        console.log('signer', signer);

        const contract = new ethers.Contract(ERC721_ADDRESS, abi, signer);
        console.log('getERC721Contract', contract);


        return { contract, accounts }
    }
    const getMarketPlaceContract = async () => {
        // debugger
        const abi = MARKETPLACE_ARTIFACTS.abi;
        const { provider, accounts } = await getMyProvider()
        const signer = provider.getSigner()
        const contract = new ethers.Contract(MARKETPLACE_ADDRESS, abi, signer);
        console.log("getMarketPlaceContract contract", contract);
        return { contract, accounts, provider, signer }
    }

    const requestApprove = async (contract: any, address: string) => {
        try {
            const trasactionRes = await contract.functions.setApprovalForAll(address, true);
            console.log("trasactionRes", trasactionRes);
            const transactionSuccess = await trasactionRes.wait();
            console.log("requestApprove transactionSuccess", transactionSuccess);
            return transactionSuccess
        } catch (error: any) {
            return null
        }
    }

    const approveMarktplace = async () => {
        try {
            const { contract, accounts } = await getERC721Contract();
            const isApproveForAllRes = await contract.functions.isApprovedForAll(accounts[0], MARKETPLACE_ADDRESS);
            if (Array.isArray(isApproveForAllRes) && isApproveForAllRes.length) {
                let isApproved = isApproveForAllRes[0]
                if (isApproved) {
                    return isApproved
                } else {
                    return await requestApprove(contract, MARKETPLACE_ADDRESS)
                }
            } else {
                return await requestApprove(contract, MARKETPLACE_ADDRESS)
            }
        } catch (error) {
            console.log("error", error);
            return null
        }
    }

    const signMyToken = async () => {
        const { contract, accounts, signer } = await getMarketPlaceContract()
        const ether = ethers.utils.parseEther(Number(10).toFixed(18));
        await VoucherRohit.setToken(contract, signer);
        const { signature, salt, minPrice, tokenContract, endTime, quantity, auctionType, owner } = await VoucherRohit.CreateVoucher(accounts[0], 1, Number(1), 0, ether, ERC721_ADDRESS);
        console.log('signature', signature);
        console.log('salt', salt);
        console.log('minPrice', minPrice);
        console.log('tokenContract', tokenContract);
        console.log('endTime', endTime);
        console.log('quantity', quantity);
        console.log('auctionType', auctionType);
        console.log('owner', owner);

        debugger

    }

    const mintNow = async () => {
        debugger
        const { contract } = await getERC721Contract();
        const contractRes = await contract.functions.mint('QmPXYB9JFUhioiiGWeVCMMQ9nmrsynNLJc91T3ArdKnpZh', 10)
        const waitRes = await contractRes.wait()
        console.log('waitRes', waitRes);
        // await approveMarktplace()
        await signMyToken()
        debugger

    }

    return <Fragment>

        <button className="btn btn-primary m-1" onClick={loginWithMetamaskConnect}>Connect Metamask </button>
        <button className="btn btn-primary m-1" onClick={mintNow}>Mint now</button>
    </Fragment>
}