import { Fragment, useState } from "react"
import { ethers } from "ethers"
import { create as ipfsHttpClient } from 'ipfs-http-client'
import axios from "axios"

export default () => {
    const [state, setState] = useState({
        name: '',
        price: 0,
        description: '',
        royality: 0,
    })
    const { name, price, description, royality } = state
    const handleState = (e: any) => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        })
    }
    const [uploadImage, setUploadImage] = useState('')
    const [images, setImage] = useState<any>('')

    const handleImage = async (e: any) => {
        let file = e.target.files[0]
        const formData = new FormData()
        formData.append('file', file)
        let image = URL.createObjectURL(file)
        setImage(image)
        await axios.post(
            'https://staging.everlens.io:3000/Upload',
            formData
        ).then((result: any) => {
            console.log(result.data.data.base_url);
            setUploadImage(result.data.data.base_url)
        });
    }

    const createNFT = async () => {
        const url = 'QmUMdN4Jk6j4fwvzzS1DRi6TX2pnaeCvxtd2CUmFQikfXX'
        const file_url =
            (JSON.stringify({ url, price, name, description }))
        console.log(file_url);

        // try {
        //     await axios.post('https://staging.everlens.io:3000/Upload/ipfs/file', file_url).then((result: any) => {
        //         console.log(result);
        //     })
        //     // mintThenList(result)
        // } catch (error) {
        //     console.log("ipfs uri upload error: ", error)
        // }
    }
    const mintNow = async () => {
        // await (await nft.mint("uri", 10)).wait()
    }
    return (
        <Fragment>
            <div className="container">
                <div className="create-nft">
                    <div className="nft-card">
                        <div className="nft-image my-5 text-center">
                            <input type="file" className="form-control" onChange={(e: any) => handleImage(e)} />
                            <div className="my-4">
                                <img src={images} alt="" />
                            </div>
                        </div>
                        <div className="nft-details form-control">
                            <div className="name m-2">
                                <label htmlFor="Name" className="mb-2">
                                    Name:
                                </label>
                                <input type="text" id="Name" className="form-control" name='name' placeholder="New NFT" value={name} onChange={handleState} />
                            </div>
                            <div className="price m-2">
                                <label htmlFor="Price" className="mb-2">
                                    Price:
                                </label>
                                <input type="text" id="Price" placeholder="0.01" className="form-control" name='price' onChange={handleState} />
                            </div>
                            <div className="description m-2">
                                <label htmlFor="Description" className="mb-2">
                                    Description:
                                </label>
                                <input type="text" id="Description" className="form-control" placeholder="NFT Details" name='description' value={description} onChange={handleState} />
                            </div>
                            <div className="royality m-2">
                                <label htmlFor="Royality" className="mb-2">
                                    Royality:
                                </label>
                                <input type="text" id="Royality" placeholder="10%" className="form-control" name='royality' onChange={handleState} />
                            </div>
                            <select className="form-select my-3 m-2" aria-label="Default select example">
                                <option selected>Open this select menu</option>
                                <option value="1">One</option>
                                <option value="2">Two</option>
                                <option value="3">Three</option>
                            </select>
                            <div className="end-date">

                            </div>
                        </div>
                        <div className="mint-btn text-center mt-3">
                            <button className="btn btn-primary" onClick={createNFT}>createNFT</button>
                            <button className="btn btn-primary" onClick={mintNow}>MintNow</button>
                        </div>
                    </div>
                </div>
            </div>

        </Fragment>
    )
}