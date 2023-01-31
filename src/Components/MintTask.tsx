import { ethers } from "ethers"
import { Fragment, useState } from "react"
import { create, CID, IPFSHTTPClient } from "ipfs-http-client";
export default () => {


    const ethereumInstalled = () => {
        return (window as any).ethereum
    }

    const [userImg, setUserImg] = useState<{ cid: CID; path: string }[]>([]);


    const [state, setState] = useState({
        userName: '',
        description: '',
        royality: ''
    })

    const handleState = (e: any) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        })
    }

    const loginWithMetamaskConnect = async () => {
        const ethereum = ethereumInstalled()
        if (ethereum) {
            try {
                const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
                const eth_chainId = await ethereum.request({ method: 'eth_chainId' })
                const provider = new ethers.providers.Web3Provider(ethereum)
                console.log(provider);

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
            console.log(provider);
            let balanceInWei = await provider.getBalance(accounts[0])
            let gasPriceInWei = await provider.getGasPrice()

            let balanceInEth = ethers.utils.formatEther(balanceInWei)
            let gasPriceInEth = ethers.utils.formatEther(gasPriceInWei)

            return { provider, accounts, eth_chainId, balanceInEth, gasPriceInEth, error: null }
        } catch (error) {
            console.log("getMyProvider error", error);
            debugger
            return { error }
        }
    }
    // const MintNow = () => {

    // }
    let ipfs: IPFSHTTPClient | undefined;
    try {
        ipfs = create({
            url: "https://ipfs.infura.io:5001/api/v0",

        });
    } catch (error) {
        console.error("IPFS error ", error);
        ipfs = undefined;
    }


    const onSubmitHandler = async (event: any) => {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const files = (form[0] as HTMLInputElement).files;

        if (!files || files.length === 0) {
            return alert("No files selected");
        }

        const file = files[0];
        // upload files
        const result = await (ipfs as IPFSHTTPClient).add(file);

        setUserImg([
            ...userImg,
            {
                cid: result.cid,
                path: result.path,
            },
        ]);
        form.reset();
    };

    return (
        <Fragment>
            <div className="container">
                <div className="userdata">
                    <div className="userimg">
                        {/* <img src={userImg} alt="" /> */}
                        <input type='file' className="form-control" />

                        <form onSubmit={onSubmitHandler}>
                            <input name="file" type="file" />

                            <button type="submit">Upload File</button>
                        </form>
                    </div>
                    <div className="userName mt-5">
                        <h3>Name:</h3>
                        <input type="text" placeholder="Enter Your Name" name='userName' className="form-control" required onChange={handleState} />
                    </div>
                    <div className="userDescription mt-5">
                        <h3>Description:</h3>
                        <textarea name="description" id="" cols={30} rows={4} className="form-control" placeholder="Enter Your Text Here" required onChange={handleState} ></textarea>
                    </div>
                    <div className="userRoyality mt-5">
                        <h3>Royality:</h3>
                        <input type="text" placeholder="10%" name='royality' className="form-control" required onChange={handleState} />
                    </div>
                    <div className="submit-btn mt-5 text-center">
                        {/* <button className="btn btn-primary" onClick={MintNow}>Mint Now</button> */}
                    </div>
                </div>
            </div>
        </Fragment>
    )
}