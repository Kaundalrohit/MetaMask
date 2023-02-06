import { log } from "console"
import { Fragment } from "react"
import successImg from "./../Images/icons8-checkmark-96.png"
import pendingImg from "./../Images/icons8-hourglass-90.png"
import Spinner from "./Spinner"

type typeOfProps = {
    loading: boolean,
    loading1: boolean,
    loading2?: boolean | null,
    stepsArray: []
    modalText: Array<any>
}

export default ({ loading, loading1, loading2, stepsArray, modalText }: typeOfProps) => {
    console.log(modalText)
    return (
        <Fragment>
            <div className="modal-body">
                {modalText[0] && <div className="text-start d-flex">
                    <div className="">
                        {!loading ? <img src={(stepsArray as any)?.includes(1) ? successImg : pendingImg} alt="" width='30px' height='30px' /> : <Spinner />}
                    </div>
                    <div className="ms-2">
                        <h5 className="fw-bolder">{modalText[0].heading}</h5>
                        <h6>{modalText[0]?.text}</h6>
                    </div>

                </div>}
                {modalText[1] && < div className="text-start d-flex">
                    <div className="">
                        {!loading1 ? <img src={(stepsArray as any)?.includes(2) ? successImg : pendingImg} alt="" width='30px' height='30px' /> : <Spinner />}
                    </div>
                    <div className="ms-2">
                        <h5 className="fw-bolder">{modalText[1]?.heading}</h5>
                        <h6>{modalText[1]?.text}</h6>
                    </div>
                </div>}
                {modalText[2] && <div className="text-start d-flex my-2">
                    <div className="">
                        {!loading2 ? <img src={(stepsArray as any)?.includes(3) ? successImg : pendingImg} alt="" width='30px' height='30px' /> : <Spinner />}
                    </div>
                    <div className="ms-2">
                        <h5 className="fw-bolder">{modalText[2]?.heading}</h5>
                    </div>
                </div>}
            </div>
        </Fragment >
    )
}