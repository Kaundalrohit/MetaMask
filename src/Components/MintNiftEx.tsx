import { ethers } from "ethers"
import { Fragment } from "react"
import EhisabERC721 from '../artifacts/EhisabERC721.json'
export default () => {
    const ethereumInstalled = () => {
        return (window as any).ethereum
    }
    const logintometamask = async () => {
        const ethereum = ethereumInstalled()
        if (ethereum) {
            try {
                const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
                const chainId = await ethereum.request({ method: 'eth_chainId' })
                const provider = new ethers.providers.Web3Provider(ethereum)
                console.log(accounts);
                console.log(chainId);
                console.log(provider);
                return { accounts, chainId, provider }
            } catch (error) {
                console.log(error);
                return null
            }
        } else {
            console.log('Install Ethereum');
            return null
        }
        // getMyProvider()
    }
    const getMyProvider = async () => {
        try {
            const { accounts, eth_chainId, provider }: any = await logintometamask();
            let balanceInWei = await provider.getBalance(accounts[0])
            let gasPriceInWei = await provider.getGasPrice()

            let balanceInEth = ethers.utils.formatEther(balanceInWei)
            let gasPriceInEth = ethers.utils.formatEther(gasPriceInWei)
            return { provider, accounts, eth_chainId, balanceInEth, gasPriceInEth, error: null }
        } catch (error) {
            console.log("getMyProvider error", error);
            debugger
            return { error }
        }
    }
    const getERC721Contract = async () => {
        const abi = EhisabERC721.abi;
        console.log(abi);
        const { provider, accounts } = await getMyProvider()
        const signer = provider.getSigner()
        console.log(signer);
        const contract = new ethers.Contract('0xf96cdb86aed0898a8f1aab7158b71b90797e1545', abi, signer);
        return { contract, accounts }
    }


    const mintNow = async () => {
        const { contract } = await getERC721Contract();
        const contractRes = await contract.functions.mint('gthrtjrt', 10)
        console.log(contractRes);
        const waitRes = await contractRes.wait()
        console.log('waitRes', waitRes);
        // debugger

    }
    return <Fragment>
        <div className="text-center d-flex">
            <button className="btn btn-warning m-5" onClick={logintometamask}>Connect To MetaMask</button>
            <button className="btn btn-danger m-5" onClick={mintNow}>Mint Now</button>
        </div>
    </Fragment>
}