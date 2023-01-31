import { ethers } from "ethers";
import { useState } from "react"

const WallertDetails = () => {
    const [btnStatus, setBtnStatus] = useState('Select Account');
    const [accountDetails, setAccountDetails] = useState();
    const [balanceDetails, setbalanceDetails] = useState<any>();
    // const [btnStatus, setBtnStatus] = useState('Select Account');

    const handleUserDetails = async () => {
        if ((window as any).ethereum) {
            try {
                await (window as any).ethereum.request({ method: 'eth_requestAccounts' }
                ).then((results: any) => {
                    console.log('Account', results[0]);
                    setAccountDetails(results[0]);
                    (window as any).ethereum.request({ method: 'eth_getBalance', params: [results[0].toString(), 'latest'] }).
                        then((balance: any) => {
                            setbalanceDetails(ethers.utils.formatEther(balance));
                        })
                });
            } catch (error: any) {
                alert(error);
                console.log(error.response.body.message);

            } finally {
                setBtnStatus('Acoount Connected')
            }
        } else {
            alert('Please Install Ethers In Web')
        }

    }

    (window as any).ethereum.on('accountsChanged', handleUserDetails);

    return (
        <>
            <div className="">
                <h1>Please Choose Your Wallert</h1>
                <div className="">
                    <button onClick={handleUserDetails}>{btnStatus}</button>
                </div>
                <div className="Details">
                    <div className="account">
                        Account:  {accountDetails}
                    </div>
                    <div className="balance">
                        Balance: {balanceDetails}
                    </div>
                </div>
            </div>
        </>
    )
}
export default WallertDetails