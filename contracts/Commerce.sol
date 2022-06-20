// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

//pragma solidity >=0.4.21 <8.10.0;

contract Commerce {
    address private ContractAddress;
    uint256 private Count = 0;

    constructor(){
        ContractAddress = msg.sender;
    }

    modifier ModifierContract {
        require(msg.sender == ContractAddress, "Your Contract don't use this Address");
        _;
    }

    struct StructSendData {
        uint256 id;
        address payable owner;
        uint256 price;
        string content;
        bool sold;
    }


    mapping(uint256=>StructSendData) private mapSendData;


    event EventSendData (
        uint256 id ,
        address owner ,
        uint256 price ,
        string content ,
        bool sold

    );

    function uploadData(string memory _content) external payable {
        require(msg.value > 0, "Your Value is Zero");
        Count++;
        mapSendData[Count] = StructSendData(Count , payable(msg.sender) , msg.value , _content,false);
        emit EventSendData(Count , payable(msg.sender) , msg.value , _content , false);
    }

    function purchesedData(uint256 _id) external payable {
        require(msg.sender != address(0),"No Address");
        require(Count != 0,"No Count Zero");
        require(_id <= Count,"No Count");
        require(msg.sender != mapSendData[_id].owner,"This is Your Products");
        require(msg.value == mapSendData[_id].price , "Your Value no Equal Price");
        

        mapSendData[_id].id = _id;
        mapSendData[_id].owner = payable(msg.sender);
        mapSendData[_id].price = msg.value;
        mapSendData[_id].sold = true;

        payable(mapSendData[_id].owner).transfer(msg.value);
    }

    function getCountUploader() external view returns(uint256) {
        require(msg.sender != address(0),"No Address");
        return Count;
    }


    function getContractAddress() external view returns(address) {
        return ContractAddress;
    }

    function getUploadData(uint256 _id) external view returns(StructSendData memory) {
        require(_id != 0,"Your Id is Problem");
        require(_id <= Count,"Your Count is Problem");
        return mapSendData[_id];
    }


}