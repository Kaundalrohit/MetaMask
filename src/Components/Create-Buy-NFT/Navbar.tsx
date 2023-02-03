import { Fragment } from "react"
import nftImage from "./Images/nft.jpg"
type props = {
    heading: string
}
export default ({ heading }: props) => {
    return (
        <Fragment>
            <nav className="navbar navbar background-color">
                <div className="navbar-brand d-flex" >
                    <div className="ms-2">
                        <img src={nftImage} width="50" height="50" className="d-inline-block align-top rounded-3" alt="" />
                    </div>
                    <span className="ms-3 mt-2 fw-bold heading-color">
                        {heading}
                    </span>
                </div>
            </nav>
        </Fragment>
    )
}