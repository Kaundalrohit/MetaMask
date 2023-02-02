import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreateNft from './Components/Create-Buy-NFT/CreateNft';
import BuyNft from './Components/Create-Buy-NFT/BuyNft';
import ApproveNft from './Components/Create-Buy-NFT/ApproveNft';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path='/' element={<CreateNft />} />
          <Route path='sale_nft' element={<ApproveNft />} />
          <Route path='buy_nft/:imageCid' element={<BuyNft />} />
        </Routes>
      </Router>
    </div>

  );
}

export default App;
