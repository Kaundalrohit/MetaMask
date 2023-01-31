import { ethers } from "ethers"
import { Fragment, useState } from "react"
import VoucherRohit from "../../utils/VoucherRohit"
import EhisabERC721 from '../../artifacts/EhisabERC721.json'
import MARKETPLACE_ARTIFACTS from '../../artifacts/EhisabMarketplace.json'
import Erc1155 from '.././../artifacts/Erc1155.json'
import IERC20 from '../../artifacts/IERC20'
import Spinner from "./Spinner"
import { useNavigate } from "react-router-dom"

// export const STAGING_ERC721_CONTRACT_ADDRESS_KEY = '0xD698750211A7CE987E7f1964a5EAE82F3C5c49dF'//staging
export const MARKETPLACE_ADDRESS = "0xc047A78f99458D56932b761a93D6CfCB13Bd298c"
export const ERC721_ADDRESS = "0xf96cdb86aed0898a8f1aab7158b71b90797e1545"
export const ERC20_address = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"
export const Mint_URI_ADDRESS = "QmPXYB9JFUhioiiGWeVCMMQ9nmrsynNLJc91T3ArdKnpZh"
export const ethereumInstalled = () => {
    return (window as any).ethereum
}

export default () => {
    const navigate = useNavigate()


    const PURCHASE_TIME_TAX = 10
    // const STAGING_MARKET_PLACE_CONTRACT_ADDRESS_KEY = '0x7d2022B2A05575EF11Db46F1D50a9Cca493c6e4e'//staging


    const [errorMessage, setErrorMessage] = useState<any>(null);
    const [defaultAccount, setDefaultAccount] = useState<any>(null);
    const [userBalance, setUserBalance] = useState<any>(null);
    const [connButtonText, setConnButtonText] = useState<any>('Connect Wallet');
    // const [mintForm, setMintForm] = useState(true)
    const [showDetails, setShowDetails] = useState(false)
    const [mintLoading, setMintLoading] = useState(false)
    const [checkAsign, setCheckAsign] = useState(false)
    const [signLoading, setSignLoading] = useState(false)
    const [handleModal, setHandleModal] = useState(false)
    const [sucess, setSucess] = useState('')

    const [tokenValue, setTokenValue] = useState({
        signature: '',
        salt: '' as any,
        tokenContract: '',
        endTime: '',
        quantity: '',
        owner: '',
        minPrice: '' as any,
        auctionType: ""

    })

    const [state, setState] = useState({
        mint_URI: '',
        price: "",
        royality: ''
    })

    const handleState = (event: any) => {
        setState({
            ...state,
            [event.target.name]: event.target.value
        })
    }



    window.onload = (event: any) => {
        isConnected();
    };

    const isConnected = async () => {
        const ethereum = ethereumInstalled()
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        if (accounts.length) {
            setDefaultAccount(accounts[0])
            accountChangedHandler(accounts[0]);
            setConnButtonText('Wallert Connected')
            console.log(`You're connected to: ${accounts[0]}`);
        } else {
            console.log("Metamask is not connected");
            loginWithMetamaskConnect()
        }
    }


    const loginWithMetamaskConnect = async () => {
        const ethereum = ethereumInstalled()
        if (ethereum) {
            const networkVersion = ethereum.networkVersion
            try {
                const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
                const eth_chainId = await ethereum.request({ method: 'eth_chainId' })
                const provider = new ethers.providers.Web3Provider(ethereum)
                setDefaultAccount(accounts[0])
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

    const accountChangedHandler = (newAccount: any) => {
        setDefaultAccount(newAccount);
        let balnc = newAccount.toString()
        setUserBalance(ethers.utils.formatEther(balnc));
    }
    const chainChangedHandler = () => {
        // reload the page to avoid any errors with chain change mid use of application
        window.location.reload();
    }


    // listen for account changes
    (window as any).ethereum.on('accountsChanged', accountChangedHandler);

    (window as any).ethereum.on('chainChanged', chainChangedHandler);

    const getMyProvider = async () => {
        try {
            const { accounts, eth_chainId, provider }: any = await loginWithMetamaskConnect();
            console.log('provider', provider);
            let balanceInWei = await provider.getBalance(accounts[0].toString())
            let gasPriceInWei = await provider.getGasPrice()

            let balanceInEth = ethers.utils.formatEther(balanceInWei)
            let gasPriceInEth = ethers.utils.formatEther(gasPriceInWei)
            setConnButtonText('Wallet connected')
            setUserBalance(balanceInEth)
            return { provider, accounts, eth_chainId, balanceInEth, gasPriceInEth, error: null }
        } catch (error) {
            console.log("getMyProvider error", error);
            return { error }
        }
    }


    const getERC721Contract = async () => {
        const abi = EhisabERC721.abi;
        const { provider, accounts } = await getMyProvider()
        const signer = provider.getSigner()
        console.log('signer', signer);

        const contract = new ethers.Contract(ERC721_ADDRESS, abi, signer);
        console.log('getERC721Contract', contract);

        return { contract, accounts }

    }
    const getMarketPlaceContract = async () => {
        const abi = MARKETPLACE_ARTIFACTS.abi;
        const { provider, accounts } = await getMyProvider()
        const signer = provider.getSigner()
        const contract = new ethers.Contract(MARKETPLACE_ADDRESS, abi, signer);
        console.log("getMarketPlaceContract contract", contract);
        return { contract, accounts, provider, signer }
    }

    const requestApprove = async (contract: any, address: string) => {
        console.log('requestApprove-loading');
        try {
            const trasactionRes = await contract.functions.setApprovalForAll(address, true);
            console.log("trasactionRes", trasactionRes);
            const transactionSuccess = await trasactionRes.wait();
            console.log("requestApprove transactionSuccess", transactionSuccess);
            setCheckAsign(false)
            return transactionSuccess
        } catch (error: any) {
            return null
        }
    }


    const approveMarktplace = async () => {
        setMintLoading(false)
        setCheckAsign(true)
        console.log('approveMarktplace-loading');
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
        setCheckAsign(false)
        setSignLoading(true)
        const { contract, accounts, signer } = await getMarketPlaceContract()
        const ether = ethers.utils.parseEther(Number(state.price).toFixed(18));
        await VoucherRohit.setToken(contract, signer);
        const { signature, salt, tokenContract, endTime, quantity, owner, minPrice } = await VoucherRohit.CreateVoucher(accounts[0], 1, Number(1), 0, ether, ERC721_ADDRESS);
        console.log('minPrice', minPrice);
        setTokenValue({
            ...tokenValue,
            signature: signature,
            salt: salt,
            tokenContract: tokenContract,
            endTime: endTime,
            quantity: quantity,
            owner: owner,
            minPrice: minPrice?._hex,
            // auctionType: auctionType
        })
        setShowDetails(true)
        setSignLoading(false)
        setSucess('Message Signed Successsfully')
        navigate('/buy_nft')

    }




    const mintNow = async () => {
        setMintLoading(true)
        const { contract } = await getERC721Contract();
        const contractRes = await contract.functions.mint(state.mint_URI, Number(state.royality))
        const waitRes = await contractRes.wait()
        await approveMarktplace()
        await signMyToken()
        // debugger
    }



    return <Fragment>
        <div className="container">
            <h1 className="text-center text-secondary">Nft Task</h1>
            <div className="nft-card text-center">
                <div className="connect-Wallert">
                    <div className="wallert-addrs h5">
                        Address:{defaultAccount}
                    </div>
                    <div className="wallert-blnc h5">
                        Balance:{userBalance}
                    </div>
                </div>

                <div className="wallert-connect-btn">
                    <button className="btn btn-sm btn-primary" onClick={getMyProvider}>{connButtonText}</button>
                </div>

                {/* {<div className={`nft-card ${mintForm && 'd-none'}`}> */}
                <div className="input-field">

                    <div className="m-2">
                        <input type="text" value={state.mint_URI} placeholder="Enter URI" name="mint_URI" className="form-control" onChange={handleState} required />
                    </div>
                    <div className="m-2">
                        <input type="text" value={state.price} placeholder="Enter Prize" name="price"
                            className="form-control" onChange={handleState} required />
                    </div>
                    <div className="m-2">
                        <input type="text" value={state.royality} placeholder="Enter Royality" name="royality" className="form-control" onChange={handleState} required />
                    </div>
                </div>

                {/* </div>} */}
                <button className={`btn btn-primary m-1 `}
                    // className={`btn btn-primary m-1 ${mintForm && 'd-none'}`}
                    data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={mintNow}
                    // disabled={(URI?.length <= 41 || price?.length === undefined || royality?.length === undefined)}
                    disabled={!(state.mint_URI && state.price && state.royality)}
                >Mint now</button>
                <div className={`modal fade modal-dialog modal-dialog-centered ${handleModal && 'd-none'}`} id="exampleModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title text-primary" id="exampleModalLabel">Process Details</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <div className="text-start">
                                    <h3>
                                        {mintLoading &&
                                            <Spinner />
                                        }
                                        Minting
                                    </h3>
                                </div>
                                <div className="text-start">
                                    <h3>
                                        {checkAsign &&
                                            <Spinner />}
                                        checkingAprroval
                                    </h3>
                                </div>
                                <div className="text-start">
                                    <h3>
                                        {signLoading &&
                                            <Spinner />}
                                        Signing Message
                                    </h3>
                                </div>
                                <div className="text-start">
                                    <h3 className="text-primary">
                                        {sucess}
                                    </h3>
                                </div>
                            </div>
                            <div className="modal-footer">
                                {/* <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button> */}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            {
                showDetails && <div className="sign-details-card">
                    <h1>Signature :</h1> {tokenValue.signature}
                    <h1>salt :</h1> {tokenValue.salt}
                    <h1>tokenContract :</h1> {tokenValue.tokenContract}
                    <h1>endTime :</h1> {tokenValue.endTime}
                    <h1>quantity : </h1>{tokenValue.quantity}
                    <h1>owner : </h1>{tokenValue.owner}
                    <h1>Price : </h1>{tokenValue.minPrice}
                    {/* <h1>auctionType : </h1>{auctionType} */}
                </div>
            }
            <div className="error-msg">
                <h5 className="text-warning">
                    {errorMessage}
                </h5>
            </div>
        </div >
    </Fragment >
}