import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreateNft from './Components/Create-Buy-NFT/CreateNft';
import BuyNft from './Components/Create-Buy-NFT/BuyNft';
import ApproveNft from './Components/Create-Buy-NFT/SellNft';
import BidNft from './Components/Create-Buy-NFT/BidNft';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path='/' element={<CreateNft />} />
          <Route path='sell_nft' element={<ApproveNft />} />
          <Route path='buy_nft' element={<BuyNft />} />
          <Route path='bid_nft' element={<BidNft />} />
        </Routes>
      </Router>
    </div>

  );
}

export default App;
