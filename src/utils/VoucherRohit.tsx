import { BigNumber, ethers } from 'ethers';

const SIGNING_DOMAIN_NAME = "v3nus.io";
const SIGNING_DOMAIN_VERSION = "1";

let _contract: any = null;
let _signer: any = null;
let _domain: any = null;

const CreateVoucher = async (
    owner: any,
    auctionType: any,
    quantity: any,
    endTime: any,
    minPrice: any,
    tokenContract: any
) => {
    let salt = Math.round(new Date().getTime())
    const voucher = {
        owner,
        minPrice,
        auctionType,
        quantity,
        endTime,
        tokenContract,
        salt,
    };
    const domain = await _signingDomain();
    const types = {
        MarketplaceVoucher: [
            { name: "owner", type: "address" },
            { name: "minPrice", type: "uint256" },
            { name: "auctionType", type: "uint256" },
            { name: "quantity", type: "uint256" },
            { name: "endTime", type: "uint256" },
            { name: "tokenContract", type: "address" },
            { name: "salt", type: "uint256" },
        ],
    };
    console.log(_signer.address, " Signer Address");
    const TypesDataEncoder = ethers.utils._TypedDataEncoder.from(types)
    const payload = ethers.utils._TypedDataEncoder.getPayload(domain, types, voucher);
    // console.log(payload, " Payload");
    const encodedData = ethers.utils._TypedDataEncoder.encode(domain, types, voucher);
    // console.log(encodedData, " Encoded Data");
    const hash = ethers.utils._TypedDataEncoder.hash(domain, types, voucher);
    // console.log(hash, " Hash");
    const signature = await _signer._signTypedData(domain, types, voucher);
    console.log(signature);
    return {
        ...voucher,
        signature,
    };
}


const _signingDomain = async () => {
    if (_domain != null) {
        return _domain;
    }
    const chainId = await _contract.getChainID();
    _domain = {
        name: SIGNING_DOMAIN_NAME,
        version: SIGNING_DOMAIN_VERSION,
        verifyingContract: _contract.address,
        chainId,
    };
    return _domain;
}

export default {
    CreateVoucher,
    setToken: async (contract: any, signer: any) => { _contract = contract; _signer = signer }
};