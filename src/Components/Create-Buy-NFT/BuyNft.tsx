import { BigNumber, ethers } from "ethers"
import { Fragment, useEffect, useState } from "react"
import { useLocation, useParams } from "react-router-dom"
import IERC20 from "../../artifacts/IERC20"
import GoerliMarketplace from "../../artifacts/GoerliMarketplace.json"
import { ERC20_address, ethereumInstalled, MARKETPLACE_ADDRESS, WETH_GOERLI_ADDRESS_KEY } from "./CreateNft"

const PURCHASE_TIME_TEX = 3
export default () => {
    const { imageCid } = useParams()
    const location = useLocation()
    const uRLSearchParams = new URLSearchParams(location.search)
    const imageUrl = `https://ipfs.io/ipfs/${imageCid}`

    const owner_address = uRLSearchParams.get('owner');
    const salt = uRLSearchParams.get('salt');
    const tokenContract = uRLSearchParams.get('tokenContract');
    const quantity = uRLSearchParams.get('quantity');
    const token_id = "0x015c"
    const price = uRLSearchParams.get('price');
    const royality = uRLSearchParams.get('royality');
    const signature = uRLSearchParams.get('signature');
    const end_date = uRLSearchParams.get('end_date');
    const auction_type = 1


    const getContract = async (address: string, abi: any) => {
        const ethereum = ethereumInstalled()
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(address, abi, signer);
        return { contract, accounts, provider, signer }
    }

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
            const depositERC20Tx = await contract.deposit(options)
            await depositERC20Tx.wait();
            const approvalERC20Tx = await contract.approve(marketplaceAddr, etherPrice)
            await approvalERC20Tx.wait();
        }
        return { contract, accounts, provider, signer }
    }


    const finaliseAuction = async (owner_address: string, voucher: any, signature: string, price: any, quantity: number, tokenContract: string, wETHAddress: string, auction_type: number) => {
        const abi = GoerliMarketplace.abi
        const { contract, accounts } = await getContract(MARKETPLACE_ADDRESS, abi)
        const { actualPrice, commission } = calculateWrappedAmount(price, quantity, PURCHASE_TIME_TEX)
        await wrappedContract(actualPrice, wETHAddress, MARKETPLACE_ADDRESS)
        try {
            const contractTransaction = await contract.functions.buy721(owner_address, voucher, signature, tokenContract)
            console.log('contractTransaction', contractTransaction);
            const res = await contractTransaction.wait();
            console.log('res', res);

            return res
        } catch (error) {
            console.log('finaliseAuction721 1 error', error);
            return null
        }
    }

    const buy721 = async () => {
        try {
            let _etherPrice = ethers.utils.parseEther(Number(price).toFixed(18));
            let _token_id = BigNumber.from(token_id)
            let _end_date = Math.round(Number(0) / 1000)
            const voucher = [_token_id, _etherPrice, auction_type, Number(quantity), _end_date, Number(salt)]

            let contractRes = await finaliseAuction(owner_address as string, voucher, signature as string, price, Number(quantity), tokenContract as string, WETH_GOERLI_ADDRESS_KEY, Number(auction_type));
            console.log('contractRes', contractRes);
        } catch (error) {
            console.log('contractRes error', error);

        }

    }

    return (
        <Fragment>
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
                            <img src={imageUrl} alt="" className="rounded-3" width="300px" height="300px" />
                        </div>
                        <div className="details m-4">
                            <div className="d-flex">
                                <h5 className="fw-bolder">Owned By:</h5>
                                <h6 className="ms-3 mt-1 text-decoration-underline">{owner_address}</h6>
                            </div>
                            <div className="d-flex">
                                <h5 className="fw-bolder">Salt:</h5>
                                <h6 className="ms-3 mt-1">{salt}</h6>
                            </div>
                            <div className="my-2">
                                <h5 className="fw-bolder">Signature:</h5>
                                <span className="text-decoration-underline">{signature}</span>
                            </div>
                            <div className="d-flex">
                                <h5 className="fw-bolder">TokenContract :</h5>
                                <h6 className="ms-3 mt-1 text-decoration-underline">{tokenContract}</h6>
                            </div>
                            <div className="my-2 d-flex">
                                <h5 className="fw-bolder">Quantity :</h5>
                                <h6 className="ms-3 mt-1 ">{quantity}</h6>
                            </div>
                            <div className="d-flex">
                                <h5 className="fw-bolder">Price :</h5>
                                <h6 className="ms-3 mt-1">{price as any}</h6>
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
                        <button className="btn btn-primary" onClick={buy721}>buy721</button>
                    </div>
                </div>

                {/* <div className="price text-center">
                    <div className="">
                        <h3>
                            ActualPrice : {state.actualPrice}
                        </h3>
                    </div>
                    <div className="">
                        <h3>
                            commission : {state.commission}
                        </h3>
                    </div>
                    <div className="">
                        <h3>
                            allowanceERC20Tx : {state.allowanceERC20Tx}
                        </h3>
                    </div>
                    <div className="">
                        <h3>
                            balanceOfERC20Tx : {state.balanceOfERC20Tx}
                        </h3>
                    </div>
                </div> */}
            </div>
        </Fragment>
    )
}
