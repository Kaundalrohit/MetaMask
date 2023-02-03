import { ethers } from "ethers"
import EhisabERC721 from '../../../artifacts/EhisabERC721.json'
import MARKETPLACE_ARTIFACTS from '../../../artifacts/EhisabMarketplace.json'

export const MARKETPLACE_ADDRESS = "0xD14B3d04b08608c26D39B59A50A65D1D5F590Da8"

export const ERC721_ADDRESS = "0xf96cdb86aed0898a8f1aab7158b71b90797e1545"

// export const ERC20_address = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"

export const WETH_GOERLI_ADDRESS_KEY = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'

export const Mint_URI_ADDRESS = "QmPXYB9JFUhioiiGWeVCMMQ9nmrsynNLJc91T3ArdKnpZh"

export const EhisabERC721_Abi = EhisabERC721.abi;
export const MARKETPLACE_ARTIFACTS_Abi = MARKETPLACE_ARTIFACTS.abi;


export const ethereumInstalled = () => {
    return (window as any).ethereum
}


export const loginWithMetamaskConnect =
    async () => {
        const ethereum = ethereumInstalled()
        if (ethereum) {
            const networkVersion = ethereum.networkVersion
            try {
                const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
                const eth_chainId = await ethereum.request({ method: 'eth_chainId' })
                const provider = new ethers.providers.Web3Provider(ethereum)
                // setDefaultAccount(accounts[0])
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


export const getMyProvider = async () => {
    try {
        const { accounts, eth_chainId, provider }: any = await loginWithMetamaskConnect();
        let balanceInWei = await provider.getBalance(accounts[0].toString())
        let gasPriceInWei = await provider.getGasPrice()

        let balanceInEth = ethers.utils.formatEther(balanceInWei)
        let gasPriceInEth = ethers.utils.formatEther(gasPriceInWei)
        // setConnButtonText('Wallet connected')
        // setUserBalance(balanceInEth)
        return { provider, accounts, eth_chainId, balanceInEth, gasPriceInEth, error: null }
    } catch (error) {
        console.log("getMyProvider error", error);
        return { error }
    }
}

export const getContract = async (address: string, abi: any) => {
    // const abi = EhisabERC721.abi;
    const { provider, accounts } = await getMyProvider()
    const signer = provider.getSigner()
    const contract = new ethers.Contract(address, abi, signer);
    return { contract, accounts, signer, provider }
}

// export const getMarketPlaceContract = async () => {
//     const abi = MARKETPLACE_ARTIFACTS.abi;
//     const { provider, accounts } = await getMyProvider()
//     const signer = provider.getSigner()
//     const contract = new ethers.Contract(MARKETPLACE_ADDRESS, abi, signer);
//     return { contract, accounts, provider, signer }
// }