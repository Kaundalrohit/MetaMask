import axios from "axios";
import { ethers } from "ethers";
import { Fragment, useState } from "react"
import EhisabERC721 from '../../artifacts/EhisabERC721.json'
import MARKETPLACE_ARTIFACTS from '../../artifacts/EhisabMarketplace.json'
import VoucherRohit from "../../utils/VoucherRohit";
import successImg from "./Images/icons8-checkmark-96.png"
import pendingImg from "./Images/icons8-hourglass-90.png"
import { ERC721_ADDRESS, ethereumInstalled, MARKETPLACE_ADDRESS, stesArray } from "./CreateNft";
import Spinner from "./Spinner";
import { useNavigate } from "react-router-dom";
export default () => {
    const navigate = useNavigate()
    const [mintLoading, setMintLoading] = useState(false)
    const [checkAsign, setCheckAsign] = useState(false)
    const [signLoading, setSignLoading] = useState(false)
    const [ipfsLoading, setIpfsLoading] = useState(false)
    const [sucess, setSucess] = useState('')

    const [state, setState] = useState({
        price: 0,
        end_date: 0,
    })
    const loginWithMetamaskConnect =
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

    const getMyProvider = async () => {
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
            // setCheckAsign(false)
            return transactionSuccess
        } catch (error: any) {
            return null
        }
    }


    const approveMarktplace = async () => {
        // setMintLoading(false)
        stesArray.push(2)
        // setCheckAsign(true)
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

    const signMyToken = async (imageCid: string) => {
        // setCheckAsign(false)
        stesArray.push(3)
        // setSignLoading(true)
        const { contract, accounts, signer } = await getMarketPlaceContract()
        const ether = ethers.utils.parseEther(Number(state.price).toFixed(18));
        await VoucherRohit.setToken(contract, signer);
        const { signature, salt, tokenContract, endTime, quantity, owner, auctionType } = await VoucherRohit.CreateVoucher(accounts[0], 1, 1, 0, ether, ERC721_ADDRESS);

        console.log('voucher', 'signature ', signature, 'salt ', salt, 'tokenContract ', tokenContract, 'endTime ', endTime, 'quantity', quantity, 'owner ', owner, auctionType);

        // setSignLoading(false)
        stesArray.push(4)
        // setSucess('Message Signed Successsfully');
        const values = new URLSearchParams()
        values.set('signature', signature);
        values.set('salt', salt as any);
        values.set('tokenContract', tokenContract)
        values.set('quantity', quantity)
        values.set('owner', owner);
        values.set('price', state.price as any);

        (window as any).document.getElementById("Close-Modal").click()
        navigate({ pathname: `/buy_nft/${imageCid}`, search: values.toString() })
    }

    const putOnSale = async () => {
        // setHandleNftCard(true)
        // setIpfsLoading(true)
        // debugger
        // try {
        //     const { contract } = await getERC721Contract();
        //     const contractRes = await contract.functions.mint(result.data.data, Number(state.royality))
        //     const waitRes = await contractRes.wait()
        //     console.log('waitRes', waitRes);

        //     await approveMarktplace()
        //     await signMyToken(res1.data.data)
        //     debugger

        // } catch (error) {

        // }
    }
    return (
        <Fragment>
            <div className="container">
                <div className="container">
                    {/* {
                    showDetails &&  */}
                    <div className="sign-details shadow  rounded-2 mx-auto"
                    // style={{
                    //     width: "1000px", height: '1000px'
                    // }}
                    >
                        <h1 className="text-center my-3 text-secondary fw-bold">Your Nft Dtails</h1>
                        <div className="nft-card">
                            <div className="nft-image text-center ">
                                {/* <img src={imageUrl} alt="" className="rounded-3" width="300px" height="300px" /> */}
                            </div>
                            <div className="details m-4">
                                <div className="d-flex">
                                    <h5 className="fw-bolder">Owned By:</h5>
                                    {/* <h6 className="ms-3 mt-1 text-decoration-underline">{owner_address}</h6> */}
                                </div>
                                <div className="d-flex">
                                    <h5 className="fw-bolder">Salt:</h5>
                                    {/* <h6 className="ms-3 mt-1">{salt}</h6> */}
                                </div>
                                <div className="my-2">
                                    <h5 className="fw-bolder">Signature:</h5>
                                    {/* <span className="text-decoration-underline">{signature}</span> */}
                                </div>
                                <div className="d-flex">
                                    <h5 className="fw-bolder">TokenContract :</h5>
                                    {/* <h6 className="ms-3 mt-1 text-decoration-underline">{tokenContract}</h6> */}
                                </div>
                                <div className="my-2 d-flex">
                                    <h5 className="fw-bolder">Quantity :</h5>
                                    {/* <h6 className="ms-3 mt-1 ">{quantity}</h6> */}
                                </div>
                                <div className="d-flex">
                                    <h5 className="fw-bolder">Price :</h5>
                                    {/* <h6 className="ms-3 mt-1">{price as any}</h6> */}
                                </div>

                            </div>
                        </div>
                        {/* <div className="signer-card  p-5">
                        <h3>Signature :</h3> <span> {signature} </span>
                        <h1>salt :</h1> {salt}
                        <h1>tokenContract :</h1> {tokenContract}
                        <h1>quantity : </h1>{quantity}
                        <h1>Price : </h1>{formatEther(minPrice as any)}
                    </div> */}
                    </div>



                    <div className="buy-nft text-center my-3">
                        <div className="but-nft">
                            {/* <button className="btn btn-primary" onClick={buy721}>buy721</button> */}
                        </div>
                    </div>
                </div>

                <div className="text-center my-3">
                    <button className={`btn btn-primary m-1 `}
                        data-bs-toggle="modal" data-bs-target="#exampleModal"
                        onClick={putOnSale}
                    // disabled={!(state.name && state.price && state.royality && state.description)}
                    >Mint now</button>
                </div>
                <div className={`modal fade modal-dialog modal-dialog-centered`} id="exampleModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden='true'>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title text-primary" id="exampleModalLabel">Process Details</h5>
                                <button type="button" id="Close-Modal" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <div className="text-start d-flex">
                                    <div className="">
                                        {!ipfsLoading ? <img src={stesArray?.includes(1) ? successImg : pendingImg} alt="" width='30px' height='30px' /> : <Spinner />}
                                    </div>
                                    <div className="ms-2">
                                        <h5 className="fw-bolder">Upload Files</h5>
                                        <h6>Adding your asset to IPFS</h6>
                                    </div>
                                </div>
                                <div className="text-start d-flex my-2">
                                    <div className="">
                                        {!mintLoading ? <img src={stesArray?.includes(2) ? successImg : pendingImg} alt="" width='30px' height='30px' /> : <Spinner />}
                                    </div>
                                    <div className="ms-2">
                                        <h5 className="fw-bolder">Mint Token</h5>
                                        <h6>Adding your asset to blockchain</h6>
                                    </div>
                                </div>
                                <div className="text-start d-flex">
                                    <div className="">
                                        {!checkAsign ? <img src={stesArray?.includes(3) ? successImg : pendingImg} alt="" width='30px' height='30px' /> : <Spinner />}
                                    </div>
                                    <div className="ms-2">
                                        <h5 className="fw-bolder">Approve Request</h5>
                                        <h6>Approve trasaction with your Wallert</h6>
                                    </div>

                                </div>
                                <div className="text-start d-flex my-2">
                                    <div className="">
                                        {!signLoading ? <img src={stesArray?.includes(4) ? successImg : pendingImg} alt="" width='30px' height='30px' /> : <Spinner />}
                                    </div>
                                    <div className="ms-2">
                                        <h5 className="fw-bolder">Signing & Listing your asset</h5>
                                    </div>
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
        </Fragment>
    )
}