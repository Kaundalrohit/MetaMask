import { ethers } from "ethers"
import { Fragment, useState } from "react"
import VoucherRohit from "../../utils/VoucherRohit"
import EhisabERC721 from '../../artifacts/EhisabERC721.json'
import MARKETPLACE_ARTIFACTS from '../../artifacts/EhisabMarketplace.json'
import Erc1155 from '.././../artifacts/Erc1155.json'
import IERC20 from '../../artifacts/IERC20'
import Spinner from "./Spinner"
import { useNavigate } from "react-router-dom"
import successImg from "./Images/icons8-checkmark-96.png"
import pendingImg from "./Images/icons8-hourglass-90.png"
import { toast } from "react-toastify"
import axios from "axios"

// export const STAGING_ERC721_CONTRACT_ADDRESS_KEY = '0xD698750211A7CE987E7f1964a5EAE82F3C5c49dF'//staging
export const MARKETPLACE_ADDRESS = "0xc047A78f99458D56932b761a93D6CfCB13Bd298c"
export const ERC721_ADDRESS = "0xf96cdb86aed0898a8f1aab7158b71b90797e1545"
export const ERC20_address = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"
export const Mint_URI_ADDRESS = "QmPXYB9JFUhioiiGWeVCMMQ9nmrsynNLJc91T3ArdKnpZh"
export const ethereumInstalled = () => {
    return (window as any).ethereum
}

export const stesArray = [] as any
export default () => {
    const navigate = useNavigate()


    const PURCHASE_TIME_TAX = 10
    // const STAGING_MARKET_PLACE_CONTRACT_ADDRESS_KEY = '0x7d2022B2A05575EF11Db46F1D50a9Cca493c6e4e'//staging


    const [errorMessage, setErrorMessage] = useState<any>(null);
    const [defaultAccount, setDefaultAccount] = useState<any>(null);
    const [userBalance, setUserBalance] = useState<any>(null);
    const [uploadImage, setUploadImage] = useState('')
    const [imagesUrl, setImageUrl] = useState<any>('')

    const [connButtonText, setConnButtonText] = useState<any>('Connect Wallet');
    // const [mintForm, setMintForm] = useState(true)
    const [showDetails, setShowDetails] = useState(false)
    const [mintLoading, setMintLoading] = useState(false)
    const [checkAsign, setCheckAsign] = useState(false)
    const [signLoading, setSignLoading] = useState(false)
    const [handleModal, setHandleModal] = useState(true)
    const [sucess, setSucess] = useState('')

    const [tokenValue, setTokenValue] = useState<any>({
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
        name: '',
        price: 0,
        description: '',
        royality: 0,
    })
    const handleState = (e: any) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        })
    }

    // const [state, setState] = useState({
    //     mint_URI: '',
    //     price: "",
    //     royality: ''
    // })

    // const handleState = (event: any) => {
    //     setState({
    //         ...state,
    //         [event.target.name]: event.target.value
    //     })
    // }



    window.onload = (event: any) => {
        // isConnected();
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
        const contract = new ethers.Contract(ERC721_ADDRESS, abi, signer);
        return { contract, accounts }
    }

    const getMarketPlaceContract = async () => {
        const abi = MARKETPLACE_ARTIFACTS.abi;
        const { provider, accounts } = await getMyProvider()
        const signer = provider.getSigner()
        const contract = new ethers.Contract(MARKETPLACE_ADDRESS, abi, signer);
        return { contract, accounts, provider, signer }
    }

    const requestApprove = async (contract: any, address: string) => {
        try {
            const trasactionRes = await contract.functions.setApprovalForAll(address, true);
            const transactionSuccess = await trasactionRes.wait();
            setCheckAsign(false)
            return transactionSuccess
        } catch (error: any) {
            return null
        }
    }


    const approveMarktplace = async () => {
        setMintLoading(false)
        stesArray.push(1)
        setCheckAsign(true)
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
        stesArray.push(2)
        setSignLoading(true)
        const { contract, accounts, signer } = await getMarketPlaceContract()
        const ether = ethers.utils.parseEther(Number(state.price).toFixed(18));
        await VoucherRohit.setToken(contract, signer);
        const { signature, salt, tokenContract, endTime, quantity, owner, minPrice } = await VoucherRohit.CreateVoucher(accounts[0], 1, Number(1), 0, ether, ERC721_ADDRESS);
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
        stesArray.push(3)
        setSucess('Message Signed Successsfully');
        const values = new URLSearchParams()
        values.set('signature', signature);
        values.set('salt', salt as any);
        values.set('tokenContract', tokenContract)
        values.set('quantity', quantity)
        values.set('minPrice', minPrice);
        values.set('price', state.price as any)
        values.set('royality', state.royality as any);

        (window as any).document.getElementById("Close-Modal").click()
        navigate({ pathname: '/buy_nft', search: values.toString() })
    }

    const handleImage = async (e: any) => {
        let file = e.target.files[0]
        let image = URL.createObjectURL(file)
        setUploadImage(image)
        setImageUrl(file)
    }

    const mintNow = async () => {
        setMintLoading(true)
        // debugger
        try {
            const { contract } = await getERC721Contract();
            const formData = new FormData()
            formData.append('file', imagesUrl)
            const res1 = await axios.post(
                "https://staging.acria.market:2083/upload/ipfs/file",
                formData
            );

            let items = { image: `ipfs://${res1.data.data}`, price: state.price, name: state.name, description: state.description }
            const metadata = JSON.stringify(items)
            console.log(metadata);

            let result = await axios.post('https://staging.acria.market:2083/Upload/ipfs/metadata', { metadata: metadata })
            console.log(result.data.data);

            const contractRes = await contract.functions.mint(result.data.data, Number(state.royality))
            const waitRes = await contractRes.wait()
            await approveMarktplace()
            await signMyToken()
            debugger

        } catch (error) {

        }
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
                {/* <div className="input-field">

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
                </div> */}

                {/* </div>} */}
                <div className="create-nft">
                    <div className="nft-card">
                        <div className="nft-image my-5 text-center">
                            <input type="file" className="form-control" onChange={(e: any) => handleImage(e)} />
                            <div className="my-4">
                                <img src={uploadImage} alt="" />
                            </div>
                        </div>
                        <div className="nft-details form-control">
                            <div className="name m-2">
                                <label htmlFor="Name" className="mb-2">
                                    Name:
                                </label>
                                <input type="text" id="Name" className="form-control" name='name' placeholder="New NFT" onChange={handleState} />
                            </div>
                            <div className="price m-2">
                                <label htmlFor="Price" className="mb-2">
                                    Price:
                                </label>
                                <input type="text" id="Price" placeholder="0.01" className="form-control" name='price' onChange={handleState} />
                            </div>
                            <div className="description m-2">
                                <label htmlFor="Description" className="mb-2">
                                    Description:
                                </label>
                                <input type="text" id="Description" className="form-control" placeholder="NFT Details" name='description' onChange={handleState} />
                            </div>
                            <div className="royality m-2">
                                <label htmlFor="Royality" className="mb-2">
                                    Royality:
                                </label>
                                <input type="text" id="Royality" placeholder="10%" className="form-control" name='royality' onChange={handleState} />
                            </div>
                            {/* <select className="form-select my-3 m-2" aria-label="Default select example">
                                <option selected>Open this select menu</option>
                                <option value="1">One</option>
                                <option value="2">Two</option>
                                <option value="3">Three</option>
                            </select> */}
                            <div className="end-date">

                            </div>
                        </div>
                        {/* <div className="mint-btn text-center mt-3">
                            <button className="btn btn-primary" onClick={mintNow}>createNFT</button>
                        </div> */}
                    </div>
                </div>
                <button className={`btn btn-primary m-1 `}
                    data-bs-toggle="modal" data-bs-target="#exampleModal"
                    onClick={mintNow}
                // disabled={!(state.mint_URI && state.price && state.royality)}
                >Mint now</button>
                <div className={`modal fade modal-dialog modal-dialog-centered`} id="exampleModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden='true'>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title text-primary" id="exampleModalLabel">Process Details</h5>
                                <button type="button" id="Close-Modal" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <div className="text-start">
                                    <h3>
                                        {!mintLoading && <img src={stesArray?.includes(1) ? successImg : pendingImg} alt="" width='40px' height='40px' />}
                                        {mintLoading &&
                                            <Spinner />
                                        }
                                        Minting
                                    </h3>
                                </div>
                                <div className="text-start">
                                    <h3>
                                        {!checkAsign && <img src={stesArray?.includes(2) ? successImg : pendingImg} alt="" width='40px' height='40px' />}
                                        {checkAsign &&
                                            <Spinner />}
                                        checkingAprroval
                                    </h3>
                                </div>
                                <div className="text-start">
                                    <h3>
                                        {!signLoading && <img src={stesArray?.includes(3) ? successImg : pendingImg} alt="" width='40px' height='40px' />}
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
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            <div className="error-msg">
                <h5 className="text-warning">
                    {errorMessage}
                </h5>
            </div>
        </div >
    </Fragment >
}