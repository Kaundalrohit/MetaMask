import { ethers } from "ethers"
import { formatEther } from "ethers/lib/utils"
import { Fragment, useState } from "react"
import { ToastContainer } from "react-bootstrap"
import { useLocation } from "react-router-dom"
import IERC20 from "../../artifacts/IERC20"
import { ERC20_address, ethereumInstalled, MARKETPLACE_ADDRESS } from "./NftTask"

export default () => {
    const value = useLocation().search;
    const signature = new URLSearchParams(value).get('signature');
    const salt = new URLSearchParams(value).get('salt');
    const tokenContract = new URLSearchParams(value).get('tokenContract');
    const quantity = new URLSearchParams(value).get('quantity');
    const minPrice = new URLSearchParams(value).get('minPrice');
    const price = new URLSearchParams(value).get('price');
    const royality = new URLSearchParams(value).get('royality');

    const [state, setState] = useState({
        actualPrice: 0,
        commission: 0,
        allowanceERC20Tx: '' as any,
        balanceOfERC20Tx: '' as any,

    })

    const getContract = async (address: string, abi: any) => {
        const ethereum = ethereumInstalled()
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(address, abi, signer);
        return { contract, accounts, provider, signer }
    }
    const calculateWrappedAmount = (price: any, quantity: any, tax: number) => {
        debugger
        const priceWithQuantity = Number(price) * Number(quantity)
        const priceFee = (priceWithQuantity * tax) / 100
        const actualPrice = priceFee + Number(priceWithQuantity)
        const commission = actualPrice - Number(priceWithQuantity)
        setState({
            ...state,
            actualPrice: actualPrice,
            commission: commission,
        })
        return { actualPrice, commission }
    }

    const accessERC20 = async (address: any, marketplaceAddr: any,) => {
        const abi = IERC20();
        const { contract, accounts, provider, signer } = await getContract(address, abi);
        const allowanceERC20Tx = await contract.allowance(accounts[0], marketplaceAddr)
        const balanceOfERC20Tx = await contract.balanceOf(accounts[0])
        setState((newValue) => {
            return {
                ...newValue,
                allowanceERC20Tx: formatEther(allowanceERC20Tx._hex),
                balanceOfERC20Tx: formatEther(balanceOfERC20Tx._hex),
            }
        })



        return { allowanceERC20Tx, balanceOfERC20Tx, contract, provider, accounts, signer }
    }

    const wrappedContract = async (actualPrice: number, wrapped: string, marketplaceAddr: string) => {
        debugger
        const etherPrice = ethers.utils.parseEther(Number(actualPrice).toFixed(18));
        const options = { value: etherPrice }
        console.log('options', options);

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

    const buy721 = async () => {
        debugger
        const { actualPrice, commission } = calculateWrappedAmount(price, 1, 10)
        const ddd = await wrappedContract(actualPrice, ERC20_address, MARKETPLACE_ADDRESS)
    }
    return (
        <Fragment>
            <ToastContainer />
            <div className="container">
                {/* {
                    showDetails &&  */}
                <div className="sign-details shadow border-2 rounded-5 mx-auto" style={{
                    width: "800px", height: '500px'
                }}>
                    <h1 className="text-center">Signer Dtails</h1>
                    <div className="signer-card  p-5">
                        <h3>Signature :</h3> <span> {signature} </span>
                        <h1>salt :</h1> {salt}
                        <h1>tokenContract :</h1> {tokenContract}
                        {/* <h1>endTime :</h1> {endTime} */}
                        <h1>quantity : </h1>{quantity}
                        {/* <h1>owner : </h1>{owner} */}
                        <h1>Price : </h1>{formatEther(minPrice as any)}
                        {/* <h1>auctionType : </h1>{auctionType} */}
                    </div>
                </div>


                <div className="buy-nft text-center my-3">
                    <div className="but-nft">
                        <button className="btn btn-primary" onClick={buy721}>buy721</button>
                    </div>
                </div>

                <div className="price text-center">
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
                </div>
            </div>
        </Fragment>
    )
}
