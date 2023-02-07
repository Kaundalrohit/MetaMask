import { Fragment, useState } from "react"
import { calculateWrappedAmount, EhisabERC721_Abi, ERC721_ADDRESS, getContract, MARKETPLACE_ADDRESS, WETH_GOERLI_ADDRESS_KEY } from "./Common/Common"
import GoerliMarketplace from "../../artifacts/GoerliMarketplace.json"
import { accessERC20, PURCHASE_TIME_TEX } from "./BuyNft"
import { BigNumber, ethers } from "ethers"
import { useLocation } from "react-router-dom"
import { btnStyle } from "./CreateNft"
import Navbar from "./Common/Navbar"
import VoucherRohit from "../../utils/VoucherRohit"



export default () => {
    const location = useLocation()
    const uRLSearchParams = new URLSearchParams(location.search)

    const owner_address = uRLSearchParams.get('owner');
    const salt = uRLSearchParams.get('salt');
    const tokenContract = uRLSearchParams.get('tokenContract');
    const quantity = uRLSearchParams.get('quantity');
    const token_Id = uRLSearchParams.get('token_Id');
    const price = uRLSearchParams.get('price');
    const signature = uRLSearchParams.get('signature');
    const end_date = uRLSearchParams.get('endTime');
    // const end_date = 1675743700;
    const image_CID = uRLSearchParams.get('image_CID');
    const auctionType = uRLSearchParams.get('auctionType');
    const nft_Image_URL = `https://ipfs.io/ipfs/${image_CID}`;

    const [state, setState] = useState({
        address: '0x1f961528976d029ec776574cf0c0f125d79404df',
        bidPrice: 0.000001
    });
    const handleState = (e: any) => {
        setState({
            ...state,
            [e.target.name]: e.target.value

        })
    }

    const wrappedContract = async (actualPrice: number, wrapped: string, marketplaceAddr: string) => {
        debugger
        const etherPrice = ethers.utils.parseEther(Number(actualPrice).toFixed(18));
        const options = { value: etherPrice }

        const { allowanceERC20Tx, contract, provider, accounts, signer } = await accessERC20(wrapped, marketplaceAddr)
        const buyPrice = ethers.utils.formatEther(etherPrice)
        const allowancePrice = ethers.utils.formatEther(allowanceERC20Tx)

        if (Number(buyPrice) > Number(allowancePrice)) {
            const depositERC20Tx = await contract.deposit(options)
            await depositERC20Tx.wait();
            const approvalERC20Tx = await contract.approve(marketplaceAddr, etherPrice)
            await approvalERC20Tx.wait();
        }
        return { contract, accounts, provider, signer }
    }

    const requestApprove = async (contract: any, address: string) => {
        // debugger
        try {
            const trasactionRes = await contract.functions.setApprovalForAll(address, true);
            const transactionSuccess = await trasactionRes.wait();
            return transactionSuccess
        } catch (error: any) {
            return null
        }
    }

    const approveMarktplace = async () => {
        // debugger
        try {
            const { contract, accounts } = await getContract(ERC721_ADDRESS, EhisabERC721_Abi);
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

    const finaliseAuction = async (quantity: number, tokenContract: string, wETHAddress: string, auction_type: number) => {
        debugger
        const abi = GoerliMarketplace.abi
        const { contract, accounts, signer } = await getContract(MARKETPLACE_ADDRESS, abi)
        const { actualPrice, commission } = calculateWrappedAmount(price, quantity, PURCHASE_TIME_TEX)
        await wrappedContract(actualPrice, wETHAddress, MARKETPLACE_ADDRESS)

        const etherPrice = ethers.utils.parseEther(Number(state.bidPrice).toFixed(18));
        let _token_id = BigNumber.from(token_Id)
        await VoucherRohit.setToken(contract, signer);
        let isApprove = await approveMarktplace()
        if (isApprove) {
            const { signature, salt, endTime, owner, auctionType } = await VoucherRohit.CreateVoucher(accounts[0], auction_type, quantity, Number(end_date), etherPrice, ERC721_ADDRESS);

            const voucher = [_token_id, etherPrice, auctionType, quantity, endTime, salt]

            try {
                const bidContractTransaction = await contract.functions.bid721(state.address, owner, voucher, signature, etherPrice, tokenContract)
                console.log('bidContractTransaction', bidContractTransaction);
                const res = await bidContractTransaction.wait();
                console.log('res', res);
                return res
            } catch (error) {
                console.log('finaliseAuction721 1 error', error);
                return null
            }
        }
    }

    const bid721 = async () => {
        debugger
        try {
            let contractRes = await finaliseAuction(Number(quantity), tokenContract as string, WETH_GOERLI_ADDRESS_KEY, Number(auctionType));
            console.log('contractRes', contractRes);
        } catch (error) {
            console.log('contractRes error', error);
        }
    }
    return (
        <Fragment>
            <Navbar heading={'BID__NFT'} />
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
                    </div>
                </div>
                <div className="bid-nft my-2">
                    <div className="input-fields">
                        <div className="my-2">
                            <label htmlFor="Token" className=" heading-color fw-bolder mb-1">BID NOW :</label>
                            <input type="text" id="Token" name="address" placeholder="Account Address" value={state.address
                            } className="form-control" onChange={handleState} />
                        </div>
                        <div className="my-2">
                            <label htmlFor="Amount" className=" heading-color fw-bolder mb-1">Enter Biding Amount :</label>
                            <input type="text" id="Amount" name="bidPrice" placeholder="Enter Your Amount Here" value={state.bidPrice} className="form-control" onChange={handleState} />
                        </div>
                    </div>
                </div>
                <div className="buy-nft text-center my-3">
                    <div className="but-nft">
                        <button className="btn" style={btnStyle}
                            onClick={bid721}
                        // data-bs-toggle="modal" data-bs-target="#exampleModal2"
                        >BID721</button>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}