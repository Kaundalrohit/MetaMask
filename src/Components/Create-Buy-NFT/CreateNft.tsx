import { ethers } from "ethers"
import { Fragment, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Navbar from "./Common/Navbar"
import { EhisabERC721_Abi, ERC721_ADDRESS, ethereumInstalled, getContract, getMyProvider, loginWithMetamaskConnect } from "./Common/Common"
import Spinner from "./Common/Spinner"
import Modal from "./Common/Modal"

export const btnStyle = {
    background: '#eebbc3', color: '#232946'

}

const modalText = [
    {
        id: 1,
        heading: 'Upload Files',
        text: 'Adding your asset to IPFS'
    },
    {
        id: 2,
        heading: 'Mint Token',
        text: 'Adding your asset to blockchain'
    }
]

const stepsArray = [] as any
export default () => {
    const navigate = useNavigate()
    const [errorMessage, setErrorMessage] = useState<any>(null);
    const [defaultAccount, setDefaultAccount] = useState<any>(null);
    const [userBalance, setUserBalance] = useState<any>(null);
    const [uploadImage, setUploadImage] = useState('')
    const [imagesUrl, setImageUrl] = useState<any>('')
    const [connButtonText, setConnButtonText] = useState<any>('Connect Wallet');

    const [mintLoading, setMintLoading] = useState(false)
    const [ipfsLoading, setIpfsLoading] = useState(false)
    const [handleModal, setHandleModal] = useState(true)
    const [loading, setLoading] = useState(false)

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

    const connectToMetamask = async () => {
        try {
            const { accounts, balanceInEth }: any = await getMyProvider()
            console.log('Connected_Account', accounts[0]);
            console.log('Account_Balance', balanceInEth);
            setDefaultAccount(accounts[0])
            setUserBalance(balanceInEth)
            setConnButtonText('Wallert Connected')
        }
        catch (error: any) {
            console.log(error.message);
            setErrorMessage(error.message)
        }
    }

    const handleImage = async (e: any) => {
        let file = e.target.files[0]
        let image = URL.createObjectURL(file)
        setUploadImage(image)
        setImageUrl(file)
    }


    const createNft = async () => {
        try {
            if (imagesUrl.length !== 0 && state.name.length !== 0 && state.description.length !== 0 && (state.royality as any).length !== 0) {
                setHandleModal(true)
                setLoading(true)
                setIpfsLoading(true)
                const formData = new FormData()
                formData.append('file', imagesUrl)
                const res1 = await axios.post(
                    "https://staging.acria.market:2083/upload/ipfs/file",
                    formData
                );

                let items = { image: `ipfs://${res1.data.data}`, name: state.name, description: state.description }
                const metadata = JSON.stringify(items)
                console.log('metadata :=>', metadata);

                let result = await axios.post('https://staging.acria.market:2083/Upload/ipfs/metadata', { metadata: metadata })
                setIpfsLoading(false)
                stepsArray.push(1)
                console.log(stepsArray)
                setMintLoading(true)
                const { contract } = await getContract(ERC721_ADDRESS, EhisabERC721_Abi);
                const contractRes = await contract.functions.mint(result.data.data, Number(state.royality))
                const waitRes = await contractRes.wait()
                setMintLoading(false)
                stepsArray.push(2)

                console.log('waitRes :=>', waitRes);
                console.log('Owner :=>', waitRes.from);

                console.log('token_id :=>', waitRes.events[0].args.tokenId._hex);

                const nftdetails = new URLSearchParams()
                nftdetails.set('name', state.name)
                nftdetails.set('description', state.description)
                nftdetails.set('image_CID', res1.data.data)
                nftdetails.set('token_Id', waitRes.events[0].args.tokenId._hex)
                nftdetails.set('royality', state.royality as any);
                nftdetails.set('owner_Address', waitRes.from);
                (window as any).document.getElementById("Close-Modal").click()
                setLoading(false);
                navigate({ pathname: '/sell_nft', search: nftdetails.toString() })
            }
            else {
                alert('hii')
            }
        } catch (error: any) {
            console.log(error);
            (window as any).document.getElementById("Close-Modal").click()
            setLoading(false);
        }
    }
    console.log(stepsArray)

    return <Fragment>
        <Navbar heading={'CREATE__YOUR__NFT'} />
        <div className="container-fluid">
            <div className="nft-card">
                <div className="connect-Wallert text-center heading-color">
                    <div className="wallert-addrs h5">
                        Address: <span className="text-color text-decoration-underline"> {defaultAccount}  </span>
                    </div>
                    <div className="wallert-blnc h5 heading-color">
                        Balance: <span className="text-color"> {userBalance} </span>
                    </div>
                </div>
                <div className="wallert-connect-btn text-center">
                    <button className="btn btn-sm" style={btnStyle} onClick={connectToMetamask}>{connButtonText}</button>
                </div>
                {handleModal && <div className={`create-nft`}>
                    <div className="nft-card">
                        <div className="nft-image my-3 text-center">
                            {uploadImage &&
                                <div className="my-4"
                                >
                                    <h3 className="heading-color">Image Preview</h3>
                                    <img src={uploadImage} className="rounded-4" alt="" width="250px" height="250px" />
                                </div>
                            }
                            <input type="file" className="form-control" onChange={(e: any) => handleImage(e)} />
                        </div>
                        <div className="nft-details form-control ">
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
                                <input type="text" id="Royality" placeholder="10%"
                                    className="form-control"
                                    name='royality' onChange={handleState} />
                            </div>
                        </div>
                    </div>
                </div>}
            </div>
            <div className="text-center my-3">
                <button className={`btn m-1 `}
                    style={btnStyle}
                    onClick={createNft}
                    data-bs-toggle="modal" data-bs-target="#exampleModal"
                // disabled={!(state.name && state.price && state.royality && state.description)}
                >{loading ? <Spinner /> : 'Create_NFT'}</button>
                <div className="modal fade" id="exampleModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden='true'>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title text-primary" id="exampleModalLabel">Process Details</h5>
                                <button type="button" id="Close-Modal" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <Modal loading={ipfsLoading} loading1={mintLoading} stepsArray={stepsArray} modalText={modalText} />
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