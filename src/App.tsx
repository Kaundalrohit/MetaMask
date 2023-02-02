import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreateNft from './Components/Create-Buy-NFT/CreateNft';
import BuyNft from './Components/Create-Buy-NFT/BuyNft';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path='/' element={<CreateNft />} />
          <Route path='buy_nft/:imageCid' element={<BuyNft />} />
        </Routes>
      </Router>
    </div>

  );
}

export default App;
