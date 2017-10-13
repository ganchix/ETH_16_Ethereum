pragma solidity ^0.4.5;

contract Owned{

    address public owner;
       
    function Owned() public{
          owner = msg.sender;
    }
    
	modifier isOwner {
        require(msg.sender == owner);
        _;
    }

}