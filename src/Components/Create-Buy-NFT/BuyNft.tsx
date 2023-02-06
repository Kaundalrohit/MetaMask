import { BigNumber, ethers } from "ethers"
import { Fragment, useState } from "react"
import { useLocation } from "react-router-dom"
import IERC20 from "../../artifacts/IERC20"
import GoerliMarketplace from "../../artifacts/GoerliMarketplace.json"
import { getContract, MARKETPLACE_ADDRESS, WETH_GOERLI_ADDRESS_KEY } from "./Common/Common"
import { btnStyle } from "./CreateNft"
import Navbar from "./Common/Navbar"
import Modal from "./Common/Modal"
import { log } from "console"

const PURCHASE_TIME_TEX = 3
const stepsArray = [] as any


const modalText = [
    {
        id: 1,
        heading: 'Deposit Amount Request',
        text: 'Deposit Amount trasaction with your Wallert'
    },
    {
        id: 2,
        heading: 'Approve Trasaction Request',
        text: 'Approve trasaction with your Wallert'
    },
    {
        id: 3,
        heading: 'Buy721 Request',
        text: ''
    }
]
export default () => {
    const location = useLocation()
    const uRLSearchParams = new URLSearchParams(location.search)


    const owner_address = uRLSearchParams.get('owner');
    const salt = uRLSearchParams.get('salt');
    const tokenContract = uRLSearchParams.get('tokenContract');
    const quantity = uRLSearchParams.get('quantity');
    const token_Id = uRLSearchParams.get('token_Id');
    const price = uRLSearchParams.get('price');
    // const royality = uRLSearchParams.get('royality');
    const signature = uRLSearchParams.get('signature');
    const end_date = uRLSearchParams.get('endTime');
    const image_CID = uRLSearchParams.get('image_CID');
    const auctionType = uRLSearchParams.get('auctionType');
    const [state, setState] = useState({
        address: '',
        bidPrice: 0
    });
    const handleState = (e: any) => {
        setState({
            ...state,
            [e.target.name]: e.target.value

        })
    }

    const nft_Image_URL = `https://ipfs.io/ipfs/${image_CID}`;


    const [depositeLoading, setDepositeLoading] = useState(false)
    const [approveLoading, setApproveLoading] = useState(false)
    const [buyLoading, setBuyLoading] = useState(false)

    const calculateWrappedAmount = (price: any, quantity: any, tax: number) => {
        const priceWithQuantity = Number(price) * Number(quantity)
        const priceFee = (priceWithQuantity * tax) / 100
        const actualPrice = priceFee + Number(priceWithQuantity)
        const commission = actualPrice - Number(priceWithQuantity)
        return { actualPrice, commission }
    }

    const accessERC20 = async (address: any, marketplaceAddr: any,) => {
        const abi = IERC20();
        const { contract, accounts, provider, signer } = await getContract(address, abi);
        const allowanceERC20Tx = await contract.allowance(accounts[0], marketplaceAddr)
        const balanceOfERC20Tx = await contract.balanceOf(accounts[0])
        return { allowanceERC20Tx, balanceOfERC20Tx, contract, provider, accounts, signer }
    }

    const wrappedContract = async (actualPrice: number, wrapped: string, marketplaceAddr: string) => {
        const etherPrice = ethers.utils.parseEther(Number(actualPrice).toFixed(18));
        const options = { value: etherPrice }

        const { allowanceERC20Tx, contract, provider, accounts, signer } = await accessERC20(wrapped, marketplaceAddr)
        const buyPrice = ethers.utils.formatEther(etherPrice)
        const allowancePrice = ethers.utils.formatEther(allowanceERC20Tx)

        if (Number(buyPrice) > Number(allowancePrice)) {
            setDepositeLoading(true)
            const depositERC20Tx = await contract.deposit(options)
            await depositERC20Tx.wait();
            setDepositeLoading(false)
            stepsArray.push(1)
            setApproveLoading(true)
            const approvalERC20Tx = await contract.approve(marketplaceAddr, etherPrice)
            await approvalERC20Tx.wait();
            setApproveLoading(false)
            stepsArray.push(2)
        }
        return { contract, accounts, provider, signer }
    }


    // const finaliseAuction = async (owner_address: string, voucher: any, signature: string, price: any, quantity: number, tokenContract: string, wETHAddress: string, auction_type: number) => {
    //     debugger
    //     const abi = GoerliMarketplace.abi
    //     const { contract, accounts } = await getContract(MARKETPLACE_ADDRESS, abi)
    //     const { actualPrice, commission } = calculateWrappedAmount(price, quantity, PURCHASE_TIME_TEX)
    //     await wrappedContract(actualPrice, wETHAddress, MARKETPLACE_ADDRESS)
    //     stepsArray.push(1, 2)
    //     const etherPrice = ethers.utils.parseEther(Number(state.bidPrice).toFixed(18));
    //     try {
    //         setBuyLoading(true)
    //         const contractTransaction = await contract.functions.buy721(owner_address, voucher, signature, tokenContract)
    //         console.log('contractTransaction', contractTransaction);
    //         setBuyLoading(false)
    //         stepsArray.push(3)
    //         const res = await contractTransaction.wait();
    //         console.log('res', res);
    //         return res
    //     } catch (error) {
    //         console.log('finaliseAuction721 1 error', error);
    //         return null
    //     }
    // }

    const finaliseAuction = async (owner_address: string, voucher: any, signature: string, price: any, quantity: number, tokenContract: string, wETHAddress: string, auction_type: number) => {
        debugger
        const abi = GoerliMarketplace.abi
        const { contract, accounts } = await getContract(MARKETPLACE_ADDRESS, abi)
        const { actualPrice, commission } = calculateWrappedAmount(price, quantity, PURCHASE_TIME_TEX)
        await wrappedContract(actualPrice, wETHAddress, MARKETPLACE_ADDRESS)
        stepsArray.push(1, 2)
        const etherPrice = ethers.utils.parseEther(Number(state.bidPrice).toFixed(18));
        try {
            setBuyLoading(true)
            const bidContractTransaction = await contract.functions.bid721(state.address, owner_address, voucher, signature, etherPrice, tokenContract)
            console.log('bidContractTransaction', bidContractTransaction);
            setBuyLoading(false)
            stepsArray.push(3)
            const res = await bidContractTransaction.wait();
            console.log('res', res);
            return res
        } catch (error) {
            console.log('finaliseAuction721 1 error', error);
            return null
        }
    }

    const buy721 = async () => {
        debugger
        try {
            let _etherPrice = ethers.utils.parseEther(Number(price).toFixed(18));
            let _token_id = BigNumber.from(token_Id)
            const voucher = [_token_id, _etherPrice, auctionType, Number(quantity), Number(end_date), Number(salt)]
            let contractRes = await finaliseAuction(owner_address as string, voucher, signature as string, price, Number(quantity), tokenContract as string, WETH_GOERLI_ADDRESS_KEY, Number(auctionType));
            console.log('contractRes', contractRes);
            (window as any).document.getElementById("Close-Modal1").click()
        } catch (error) {
            console.log('contractRes error', error);
        }
    }

    const bid721 = async () => {
        debugger
        try {
            let _etherPrice = ethers.utils.parseEther(Number(price).toFixed(18));
            let _token_id = BigNumber.from(token_Id)
            const voucher = [_token_id, _etherPrice, auctionType, Number(quantity), Number(end_date), Number(salt)]
            let contractRes = await finaliseAuction(owner_address as string, voucher, signature as string, price, Number(quantity), tokenContract as string, WETH_GOERLI_ADDRESS_KEY, Number(auctionType));
            console.log('contractRes', contractRes);
            (window as any).document.getElementById("Close-Modal1").click()
        } catch (error) {
            console.log('contractRes error', error);
        }
    }
    console.log(state.address)
    console.log(state.bidPrice)
    return (
        <Fragment>
            <Navbar heading={'BUY__NFT'} />
            <div className="container">
                <h1 className="text-center my-3 heading-color fw-bold ">Nft Dtails</h1>
                {/* {
                    showDetails &&  */}
                <div className="sign-details rounded-2 mx-auto"
                >
                    <div className="nft-card shadow">
                        <div className="nft-image text-center ">
                            <img src={nft_Image_URL} alt="" className="rounded-3" width="300px" height="300px" />
                        </div>
                        <div className="details m-4">
                            <div className="d-flex">
                                <h5 className="fw-bolder heading-color">Owned By:</h5>
                                <h6 className="ms-3 mt-1 text-decoration-underline text-color">{owner_address}</h6>
                            </div>
                            <div className="d-flex">
                                <h5 className="fw-bolder heading-color">Salt:</h5>
                                <h6 className="ms-3 mt-1 text-color">{salt}</h6>
                            </div>
                            <div className="my-2">
                                <h5 className="fw-bolder heading-color">Signature:</h5>
                                <span className="text-decoration-underline text-color">{signature}</span>
                            </div>
                            <div className="d-flex">
                                <h5 className="fw-bolder heading-color">TokenContract :</h5>
                                <h6 className="ms-3 mt-1 text-decoration-underline text-color">{tokenContract}</h6>
                            </div>
                            <div className="my-2 d-flex">
                                <h5 className="fw-bolder heading-color">Quantity :</h5>
                                <h6 className="ms-3 mt-1 text-color">{quantity}</h6>
                            </div>
                            <div className="d-flex">
                                <h5 className="fw-bolder heading-color">Price :</h5>
                                <h6 className="ms-3 mt-1 text-color">{price as any}</h6>
                            </div>
                            <div className="d-flex">
                                <h5 className="fw-bolder heading-color">End_Date :</h5>
                                <h6 className="ms-3 mt-1 text-color">{end_date}</h6>
                            </div>

                        </div>

                        {auctionType === '2' && <div className="bid-nft my-2">
                            <div className="input-fields">
                                <div className="my-2">
                                    <label htmlFor="Token" className=" heading-color fw-bolder mb-1">BID NOW :</label>
                                    <input type="text" id="Token" name="address" placeholder="Account Address" className="form-control" onChange={handleState} />
                                </div>
                                <div className="my-2">
                                    <label htmlFor="Amount" className=" heading-color fw-bolder mb-1">Enter Biding Amount :</label>
                                    <input type="text" id="Amount" name="bidPrice" placeholder="Enter Your Amount Here" className="form-control" onChange={handleState} />
                                </div>
                            </div>
                        </div>}
                    </div>
                </div>

                {auctionType !== '2' ?
                    < div className="buy-nft text-center my-3">
                        <div className="but-nft">
                            <button className="btn" style={btnStyle}
                                onClick={buy721}
                                data-bs-toggle="modal" data-bs-target="#exampleModal2"
                            >buy721</button>
                        </div>
                    </div>
                    :
                    <div className="buy-nft text-center my-3">
                        <div className="but-nft">
                            <button className="btn" style={btnStyle}
                                onClick={bid721}
                            // data-bs-toggle="modal" data-bs-target="#exampleModal2"
                            >BID721</button>
                        </div>
                    </div>
                }
                <div className={`modal fade`} id="exampleModal2" tabIndex={-1} aria-labelledby="exampleModalLabel2" aria-hidden='true'>
                    <div className="modal-dialog modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title text-primary" id="exampleModalLabel">Process Details</h5>
                                <button type="button" id="Close-Modal1" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <Modal loading={depositeLoading} loading1={approveLoading} loading2={buyLoading} stepsArray={stepsArray} modalText={modalText} />
                        </div>
                    </div>
                </div>
            </div>
        </Fragment >
    )
}
