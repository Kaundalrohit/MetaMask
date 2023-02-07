// import axios from "axios";
import { ethers } from "ethers";
import dayjs from 'dayjs';
import { RangePickerProps } from 'antd/es/date-picker';
import { DatePicker } from 'antd';
import { Fragment, useState } from "react"
import VoucherRohit from "../../utils/VoucherRohit";
import { useLocation, useNavigate } from "react-router-dom";
import { EhisabERC721_Abi, ERC721_ADDRESS, getContract, MARKETPLACE_ADDRESS, MARKETPLACE_ARTIFACTS_Abi } from "./Common/Common";
import { btnStyle } from "./CreateNft";
import Navbar from "./Common/Navbar";
import Modal from "./Common/Modal";

const stepsArray = [] as any

export default () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [timeStamp, setTimeStamp] = useState(0)

    const modalText = [
        {
            id: 1,
            heading: 'Approve Request',
            text: 'Approve trasaction with your Wallert'
        },
        {
            id: 2,
            heading: 'Signing & Listing your asset',
            text: ''
        }
    ]

    const moment = require('moment');
    const disabledDate: RangePickerProps['disabledDate'] = (current: any) => {
        return current && current < dayjs().startOf('day');
    }
    const [endDate, setEndDate] = useState(moment(new Date()).format('YYYY-MM-DD'))


    const onChange = (date: any) => {
        console.log(date.$d)
        let date_value = (date.$d)
        let date_value1 = Math.round(date_value.getTime() / 1000);

        // setTimeStamp(date_value1)

        setTimeStamp(1675745674)

        console.log('TimeStamp :=>', date_value1)
        setEndDate(moment(date.$d).format('YYYY-MM-DD'))
    };

    const uRLSearchParams = new URLSearchParams(location.search)

    const nft_Name = uRLSearchParams.get('name');
    const nft_Description = uRLSearchParams.get('description');
    const nft_Royality = uRLSearchParams.get('royality');
    const image_CID = uRLSearchParams.get('image_CID');
    const owner_Address = uRLSearchParams.get('owner_Address');
    // const token_Id = uRLSearchParams.get('token_Id');

    const nft_Image_URL = `https://ipfs.io/ipfs/${image_CID}`;

    const [checkAsign, setCheckAsign] = useState(false)
    const [signLoading, setSignLoading] = useState(false)
    const [auction, setAuction] = useState<number>(1)
    const [sucess, setSucess] = useState('')

    const [state, setState] = useState({
        price: 0,
    })

    console.log(state.price);

    const requestApprove = async (contract: any, address: string) => {
        // debugger
        try {
            const trasactionRes = await contract.functions.setApprovalForAll(address, true);
            const transactionSuccess = await trasactionRes.wait();
            setCheckAsign(false)
            stepsArray.push(1)
            return transactionSuccess
        } catch (error: any) {
            return null
        }
    }

    const approveMarktplace = async () => {
        // debugger
        setCheckAsign(true)
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

    const signMyToken = async () => {
        // debugger
        setCheckAsign(false)
        stepsArray.push(1)
        setSignLoading(true)
        const { contract, accounts, signer } = await getContract(MARKETPLACE_ADDRESS, MARKETPLACE_ARTIFACTS_Abi)
        const ether = ethers.utils.parseEther(Number(state.price).toFixed(18));
        let _end_date = timeStamp
        await VoucherRohit.setToken(contract, signer);
        if (auction.valueOf() == 1) {
            setEndDate(0)
        }
        const { signature, salt, tokenContract, endTime, quantity, owner, auctionType } = await VoucherRohit.CreateVoucher(accounts[0], Number(auction), 1, _end_date, ether, ERC721_ADDRESS);

        console.log('voucher', 'signature ', signature, 'salt ', salt, 'tokenContract ', tokenContract, 'endTime ', endTime, 'quantity', quantity, 'owner ', owner, 'auctionType', auctionType);

        setSignLoading(false)
        stepsArray.push(2)
        setSucess('Message Signed Successsfully');
        uRLSearchParams.set('signature', signature);
        uRLSearchParams.set('salt', salt as any);
        uRLSearchParams.set('tokenContract', tokenContract)
        uRLSearchParams.set('quantity', quantity)
        uRLSearchParams.set('owner', owner);
        uRLSearchParams.set('price', state.price as any);
        uRLSearchParams.set('endTime', endTime);
        uRLSearchParams.set('auctionType', auctionType);

        (window as any).document.getElementById("Close-Modal1").click()
        // if()
        navigate({ pathname: `${auctionType === 2 ? '/bid_nft' : '/buy_nft'}`, search: uRLSearchParams.toString() })
    }

    const putOnSale = async () => {
        // setHandleNftCard(true)
        // debugger
        try {
            await approveMarktplace()
            await signMyToken()
            debugger
        } catch (error: any) {
            console.log(error);
        }
    }
    return (
        <Fragment>
            <Navbar heading={'SELL__YOUR__NFT'} />
            <div className="container">
                <h1 className="text-center my-3 fw-bold heading-color">Your Nft Dtails</h1>
                {/* {
                    showDetails &&  */}
                <div className="sign-details"
                >
                    <div className="nft-image text-center ">
                        <img src={nft_Image_URL} alt="" className="rounded-3" width="300px" height="300px" />
                    </div>
                    <div className="nft-card shadow">
                        <div className="details m-4">
                            <div className="d-flex">
                                <h5 className="fw-bolde heading-color">OWNED_BY :</h5>
                                <h6 className="ms-3 mt-1 text-decoration-underline text-color">{owner_Address}</h6>
                            </div>
                            <div className="d-flex">
                                <h5 className="fw-bolder heading-color">NFT_NAME :</h5>
                                <h6 className="ms-3 mt-1 text-color">{nft_Name}</h6>
                            </div>
                            <div className="my-2 d-flex">
                                <h5 className="fw-bolder heading-color">NFT_DESCRIPTION:</h5>
                                <span className=" ms-3 text-color">{nft_Description}</span>
                            </div>
                            <div className="d-flex">
                                <h5 className="fw-bolder heading-color">ROYALITY:</h5>
                                <h6 className="ms-3 mt-1  text-color">{nft_Royality}</h6>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="nft-type">
                    <div className="nft-price">
                        <label htmlFor="Price" className="heading-color fw-bolder">
                            NFT_PRICE :
                        </label>
                        <div className="my-2">
                            <input type="text" placeholder="0.01" className="form-control" id="Price" onChange={(e: any) => {
                                setState({
                                    ...state,
                                    price: e.target.value
                                })
                            }} />
                        </div>
                    </div>
                    <div className="heading-color fw-bolder my-2">
                        Select_Auction_Type
                    </div>
                    <select name="" className="form-select" id="" onChange={(e: any) => setAuction(e.target.value)}>
                        <option value={1}>Fixed</option>
                        <option value={2}>Time_Limited</option>
                    </select>
                    {/* </div> */}
                    {auction.valueOf() == 2 && <div className="date mt-3">
                        <label htmlFor="End_Date" className="heading-color fw-bolder my-2">
                            END_DATE :
                        </label>
                        <DatePicker
                            format='YYYY-MM-DD'
                            id="End_Date"
                            className='w-100 form-control heading-color'
                            defaultValue={dayjs(endDate, 'YYYY-MM-DD')}
                            disabledDate={disabledDate}
                            placeholder='YYYY-MM-DD'
                            onChange={onChange}
                            inputReadOnly
                        />
                    </div>}
                </div>
                <div className="text-center my-3">
                    <button className={`btn m-1`}
                        data-bs-toggle="modal" data-bs-target="#exampleModal1"
                        onClick={putOnSale}
                        style={btnStyle}
                    // disabled={!(state.name && state.price && state.royality && state.description)}
                    >Put_On_Sell</button>
                </div>
                <div className={`modal fade`} id="exampleModal1" tabIndex={-1} aria-labelledby="exampleModalLabel1" aria-hidden='true'>
                    <div className="modal-dialog modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title text-primary" id="exampleModalLabel">Process Details</h5>
                                <button type="button" id="Close-Modal1" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <Modal loading={checkAsign} loading1={signLoading} stepsArray={stepsArray} modalText={modalText} />
                        </div>
                    </div>
                </div>
            </div>
        </Fragment >
    )
}