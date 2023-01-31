import { ethers } from "ethers";
import { Fragment, useState } from "react"
import EhisabERC721 from '../artifacts/EhisabERC721.json'
declare global {
    interface Window {
        ethereum: any;
    }
}

export default () => {

    const ethereumInstalled = () => {
        return (window as any).ethereum
    }
    const [amount, setAmount] = useState(0);

    const [destinationAddress, setDestinationAddress] = useState("");

    const startPayment = async (event: any) => {
        // debugger
        const ethereum = ethereumInstalled()
        console.log({ amount, destinationAddress });
        try {

            if (!window.ethereum) {
                throw new Error("No crypto wallet found. Please install it.");
            }

            const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
            const eth_chainId = await ethereum.request({ method: 'eth_chainId' })
            const provider = new ethers.providers.Web3Provider(ethereum)
            console.log(provider);

            const signer = provider.getSigner();

            ethers.utils.getAddress(destinationAddress);

            const transactionResponse = await signer.sendTransaction({

                to: destinationAddress,

                value: ethers.utils.parseEther(amount.toString())

            });
            // const signer = provider.getSigner();

            // Get user's Ethereum public address
            const fromAddress = await signer.getAddress();

            const originalMessage = [
                {
                    type: "string",
                    name: "fullName",
                    value: "Satoshi Nakamoto",
                },
                {
                    type: "uint32",
                    name: "userId",
                    value: "1212",
                },
            ];
            const params = [originalMessage, fromAddress];
            const method = "eth_signTypedData";

            const signedMessage = await signer.provider.send(method, params);


            console.log({ transactionResponse });
            alert('transaction Successful')
            setAmount(0)
            setDestinationAddress('')
            console.log(signedMessage);

        } catch (error: any) {

            console.log({ error });

        }

    }

    const [tokenAdrs, setTokenAdrs] = useState('')
    const abi = EhisabERC721.abi;
    console.log(abi);





    return (
        <Fragment >
            <div className="container text-center">
                <div className="userinput mt-5">
                    <input type="text" className="form-control" value={tokenAdrs} placeholder={'Enter Your Account Address'} onChange={(e: any) => {
                        setTokenAdrs(e.targt.value)
                    }} />
                </div>
                <div className="btns mt-3">
                    <button className="btn btn-primary me-3">Buy</button>
                    <button className="btn btn-warning">Sell</button>
                </div>

            </div>



            <div className="m-5 p-5 card shadow text-center">

                {/* added onChange and onClick attributes */}

                <input type="number" placeholder="Amount" value={amount} className="col-12 form-control mb-3" onChange={event => { setAmount(Number.parseFloat(event.target.value)) }} />

                <input placeholder="Destination address" value={destinationAddress} className="col-12 form-control mb-3" onChange={event => { setDestinationAddress(event.target.value) }} />

                <button className="col-12 btn btn-primary" onClick={startPayment}>

                    Send Payment

                </button>

            </div>
        </Fragment>
    )
}