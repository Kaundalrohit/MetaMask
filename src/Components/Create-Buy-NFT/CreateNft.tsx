import { ethers } from "ethers"
import { Fragment, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Navbar from "./Navbar"

export const MARKETPLACE_ADDRESS = "0xD14B3d04b08608c26D39B59A50A65D1D5F590Da8"
export const ERC721_ADDRESS = "0xf96cdb86aed0898a8f1aab7158b71b90797e1545"
// export const ERC20_address = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"
export const WETH_GOERLI_ADDRESS_KEY = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'
export const Mint_URI_ADDRESS = "QmPXYB9JFUhioiiGWeVCMMQ9nmrsynNLJc91T3ArdKnpZh"
export const ethereumInstalled = () => {
    return (window as any).ethereum
}

export const stesArray = [] as any
export default () => {
    const navigate = useNavigate()
    const [errorMessage, setErrorMessage] = useState<any>(null);
    const [defaultAccount, setDefaultAccount] = useState<any>(null);
    const [userBalance, setUserBalance] = useState<any>(null);
    const [uploadImage, setUploadImage] = useState('')
    const [imagesUrl, setImageUrl] = useState<any>('')
    const [connButtonText, setConnButtonText] = useState<any>('Connect Wallet');


    const [state, setState] = useState({
        name: '',
        description: '',
        royality: 0,
    })
    const handleState = (e: any) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        })
    }

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





    const handleImage = async (e: any) => {
        let file = e.target.files[0]
        let image = URL.createObjectURL(file)
        setUploadImage(image)
        setImageUrl(file)
    }


    const createNft = async () => {
        try {
            const formData = new FormData()
            formData.append('file', imagesUrl)
            const res1 = await axios.post(
                "https://staging.acria.market:2083/upload/ipfs/file",
                formData
            );

            let items = { image: `ipfs://${res1.data.data}`, name: state.name, description: state.description }
            const metadata = JSON.stringify(items)
            console.log(metadata);

            let result = await axios.post('https://staging.acria.market:2083/Upload/ipfs/metadata', { metadata: metadata })
            const nftdetails = new URLSearchParams()
            nftdetails.set('name', state.name)
            nftdetails.set('description', state.description)
            nftdetails.set('image_CID', res1.data.data)
            nftdetails.set('mint_CID', result.data.data)
            nftdetails.set('royality', state.royality as any);
            navigate({ pathname: '/sale_nft', search: nftdetails.toString() })
            stesArray.push(1)
        } catch (error) {

        }
    }

    return <Fragment>
        <Navbar />
        <div className="container-fluid" style={{ background: "cyan", height: '674px' }}>
            {/* <h1 className="text-center text-secondary fw-bold">Nft Task</h1> */}

            <div className="nft-card">
                <div className="connect-Wallert text-center">
                    <div className="wallert-addrs h5">
                        Address:{defaultAccount}
                    </div>
                    <div className="wallert-blnc h5">
                        Balance:{userBalance}
                    </div>
                </div>

                <div className="wallert-connect-btn text-center">
                    <button className="btn btn-sm btn-primary" onClick={loginWithMetamaskConnect}>{connButtonText}</button>
                </div>
                <div className={`create-nft`}>
                    <div className="nft-card">
                        <div className="nft-image my-3 text-center">
                            {uploadImage &&
                                <div className="my-4"
                                >
                                    <h3 className="text-primary">Image Preview</h3>
                                    <img src={uploadImage} className="rounded-4" alt="" width="250px" height="250px" />
                                </div>
                            }
                            <input type="file" className="form-control" onChange={(e: any) => handleImage(e)} />
                        </div>
                        <div className="nft-details form-control shadow p-4">
                            <div className="name m-2">
                                <label htmlFor="Name" className="mb-2 fw-bolder">
                                    Name:
                                </label>
                                <input type="text" id="Name" className="form-control" name='name' placeholder="New NFT" onChange={handleState} />
                            </div>
                            <div className="description m-2">
                                <label htmlFor="Description" className="mb-2 fw-bolder" >
                                    Description:
                                </label>
                                <input type="text" id="Description" className="form-control" placeholder="NFT Details" name='description' onChange={handleState} />
                            </div>
                            <div className="royality m-2">
                                <label htmlFor="Royality" className="mb-2 fw-bolder">
                                    Royality:
                                </label>
                                <input type="text" id="Royality" placeholder="10%" className="form-control" name='royality' onChange={handleState} />
                            </div>
                        </div>
                    </div>
                    <div className="text-center my-3">
                        <button className={`btn btn-primary m-1 `}
                            data-bs-toggle="modal" data-bs-target="#exampleModal"
                            onClick={createNft}
                        // disabled={!(state.name && state.price && state.royality && state.description)}
                        >Create NFT</button>
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