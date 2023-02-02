import { Fragment } from "react"
import nftImage from "./Images/nft.jpg"

export default () => {
    return (
        <Fragment>
            <nav className="navbar navbar" style={{ background: '#232946' }}>
                <div className="navbar-brand d-flex" >
                    <div className="ms-2">
                        <img src={nftImage} width="50" height="50" className="d-inline-block align-top rounded-3" alt="" />
                    </div>
                    <span className="ms-3 mt-2 fw-bold" style={{ color: "#fffffe" }}>
                        CREATE_YOUR_NFT
                    </span>
                </div>
            </nav>
        </Fragment>
    )
}