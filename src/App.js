import { useEffect, useState } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import './App.css';
import ContractCommerce from "./abi/Commerce.json";
import Web3 from "web3/dist/web3.min";

function App() {

  const _providerChange = (provider)=>{
    provider.on("accountsChanged",()=>{window.location.reload()});
    provider.on("chainChanged",()=>{window.location.reload()});
  }

  const [ web3 , setWeb3 ] = useState({
    web3: null , 
    account: null , 
    provider: null ,
    networkId: null
  });

  useEffect(() => {
    const _loadContract = async ()=>{
      const _provider = await detectEthereumProvider();

      if( _provider ) {
        _providerChange(_provider);

        const _web3 = await new Web3(_provider);
        const _account = await _web3.eth.getAccounts();
        const _netWorkId = await _web3.eth.net.getId();     

          setWeb3({
            web3: _web3 ,
            account: _account[0] ,
            provider: _provider , 
            networkId: _netWorkId
          });

      } else {
        window.alert("Enter your Wallet MetaMask");
      }


    }
      _loadContract();
  },[]);

  const [shopContract,setShopContract] = useState({
    count: 0 ,
    userBalance: 0 ,
    contract: undefined ,
    owner: undefined 
  });

  useEffect(()=>{
    const _getContracts = async () => {
      const _contractObject = await ContractCommerce.networks[web3.networkId];

      if( _contractObject ) {

        const _contractAddress = await ContractCommerce.networks[web3.networkId].address;
        
        const _deployedContract = await new web3.web3.eth.Contract(
          ContractCommerce.abi , _contractObject && _contractAddress );

        const _balance = await web3.web3.eth.getBalance(web3.account);
        const _balanceFromWei = await web3.web3.utils.fromWei(_balance,"ether");

        const _idCount = await _deployedContract.methods.getCountUploader().call();

        const _ownerContract = await _deployedContract.methods.getContractAddress().call();

        setShopContract({
          count:_idCount , 
          userBalance: _balanceFromWei , 
          contract: _deployedContract , 
          owner: _ownerContract
        })

      } 
    }

    web3.account && _getContracts();

  },[web3.account])


  const [productInput,setProductInput] = useState({
    name: "" , price: ""
  });


  const [loadData,setLoadData] = useState(false);
  const [fetchContract,setFetchContract] = useState([]);
  useEffect(()=>{
    const _fetchContract = async () => {
      for(let i = 0 ; i < shopContract.count ; i++) {
        const _fetchUploadData = await shopContract.contract.methods.getUploadData(i+1).call();
        setFetchContract(_upload => [..._upload,_fetchUploadData]);
        setLoadData(true);
      }
    }
    shopContract && _fetchContract();
  },[shopContract]);

  

  const _reqAccoubtsFunc = async () => {
   return await web3.web3.eth.requestAccounts();
  }


  const _uploadData = async () => {
    console.log(fetchContract);
    if(productInput.name === null || productInput.price === null || !web3.account) {
      return window.alert("No Wallet");
    } 
      const _toWei = await web3.web3.utils.toWei(productInput.price,"ether");
      await shopContract.contract.methods.uploadData(productInput.name).send({
      value: _toWei , 
      from: web3.account
    });

    window.location.reload();
     
  }

  const _purchasedData = async (_id,_price) => {
    await shopContract.contract.methods.purchesedData(_id).send({
    value: _price , from: web3.account });

    window.location.reload();
  }


  return (
    <div className="App">

      <div>
        <h3> MyAddress: {web3.account} </h3>

        <h3> MyBalance: {shopContract.userBalance} ETH</h3>

        <h3> OwnerContract: {shopContract.owner} </h3>

        <h3> NumperUploaded: {shopContract.count} </h3>
      </div>


      <div className="input-group flex-nowrap p-2" >
          <span className="input-group-text" id="addon-wrapping">Name</span>
        <input type="text" className="form-control" placeholder="Username" aria-label="Username" aria-describedby="addon-wrapping" onChange={e=>setProductInput({...productInput,name:e.target.value})}/>
      </div>


      <div className="input-group mb-3 p-2">
        <span className="input-group-text">$</span>
        <input type="text" className="form-control" aria-label="Amount (to the nearest dollar)"placeholder="Ether" onChange={e=>setProductInput({...productInput,price:e.target.value})}/>
        <span className="input-group-text">.00</span>
      </div>
      

      <button type='button' className='btn btn-primary' onClick={!web3.account? _reqAccoubtsFunc : _uploadData}> Add Products </button>
     

      {
        !loadData ? <div>Loading...</div> : fetchContract.map((key,value)=>{
          return(
            key.owner === web3.account ? <></> : <div key={key}>
            <div className='container p-3'>
             <div className="card" >
               <h5 className="card-header" >Owner: {key.owner}</h5>
                 <div className="card-body">
                  <h5 className="card-title">{key.content}</h5>
                  <p className="card-text">{Web3.utils.fromWei(key.price,"ether")} Ether</p>
                 <button type='button' className='btn btn-primary' onClick={()=>{_purchasedData(key.id , key.price)}}> Buy </button>
               </div>
             </div>
          </div>
        </div>
          );
        })
      }


      <h2>My Products</h2>


      {
        !loadData ? <div>Loading...</div> : fetchContract.map((key,value)=>{
          return(
            key.owner !== web3.account ? <></> : <div key={key}>
            <div className='container p-3' >
             <div className="card" >
               <h5 className="card-header" >Owner: {key.owner}</h5>
                 <div className="card-body">
                  <h5 className="card-title">{key.content}</h5>
                  <p className="card-text">{Web3.utils.fromWei(key.price,"ether")} Ether</p>
               </div>
             </div>
          </div>
        </div>
          );
        })
      }
     
    </div>
  );
}

export default App;
