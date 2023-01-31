import React from 'react';
import logo from './logo.svg';
import './App.css';
import WalletCard from './Components/WallertCard';
import WallertDetails from './Components/WallertDetails';
import SimpleStorage from './Components/SimpleStorage';
import MintNft from './Components/MintNft';
import MintNiftEx from './Components/MintNiftEx';
import MintTask from './Components/MintTask';
import BuySell from './Components/BuySell';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NftTask from './Components/NFT/NftTask';
import Nft from './Components/NFT/Nft';
import BuyNft from './Components/NFT/BuyNft';

function App() {
  return (
    <div className="App">
      {/* <WalletCard /> */}
      {/* <WallertDetails /> */}
      {/* <SimpleStorage /> */}
      {/* <MintNft /> */}
      {/* <MintNiftEx /> */}
      {/* <MintTask /> */}
      {/* <BuySell /> */}
      <Router>
        <Routes>
          {/* <Route path='/' element={<MintNft />} /> */}
          <Route path='/' element={<NftTask />} />
          <Route path='buy_nft' element={<BuyNft />} />
          {/* <Route path='/' element={<Nft />} /> */}
        </Routes>
      </Router>
    </div>

  );
}

export default App;
