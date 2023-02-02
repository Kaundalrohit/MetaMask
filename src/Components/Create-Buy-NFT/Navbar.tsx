import { Fragment } from "react"
import nftImage from "./Images/nft.jpg"

export default () => {
    return (
        <Fragment>
            <nav className="navbar navbar-light bg-dark">
                <div className="navbar-brand d-flex" >
                    <div className="ms-2">
                        <img src={nftImage} width="50" height="50" className="d-inline-block align-top rounded-3" alt="" />
                    </div>
                    <span className="text-white ms-3 mt-2 fw-bold">
                        CREATE_YOUR_NFT
                    </span>
                </div>
            </nav>
        </Fragment>
    )
}