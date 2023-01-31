import { ethers } from "ethers"
import { Fragment } from "react"
import IERC20 from "../../artifacts/IERC20"
import { ERC20_address, ethereumInstalled, MARKETPLACE_ADDRESS } from "./NftTask"

export default () => {

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
        console.log('actualPrice', actualPrice);
        console.log('commission', commission);

        return { actualPrice, commission }
    }

    const accessERC20 = async (address: any, marketplaceAddr: any,) => {
        const abi = IERC20();
        const { contract, accounts, provider, signer } = await getContract(address, abi);
        const allowanceERC20Tx = await contract.allowance(accounts[0], marketplaceAddr)
        const balanceOfERC20Tx = await contract.balanceOf(accounts[0])
        console.log('allowanceERC20Tx', allowanceERC20Tx);
        console.log('balanceOfERC20Tx', balanceOfERC20Tx);

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
        const { actualPrice, commission } = calculateWrappedAmount(0.001, 1, 10)
        const ddd = await wrappedContract(actualPrice, ERC20_address, MARKETPLACE_ADDRESS)
    }
    return (
        <Fragment>
            <div className="container">
                <div className="buy-nft text-center">
                    <div className="but-nft">
                        <button onClick={buy721}>buy721</button>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}
