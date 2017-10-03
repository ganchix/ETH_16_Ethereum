pragma solidity ^0.4.5;

contract Splitter {
    
    uint public balance;
    
    address[] private friends;
    
    address public owner;
    
    event LogFailSendEvent(address main, address friend, uint value, uint total);

    event LogSendEvent(address main, address friend, uint value, uint total);

    modifier isOwner {
        if (msg.sender != owner) {
            revert();
        }
        _;
    }
    
    function Splitter(address[] addresses) public {
        for(uint i=0; i<addresses.length; i++){
            if(addresses[i] == msg.sender) revert();
        }
        owner = msg.sender;
        friends = addresses;
    }

    
    function split() payable isOwner public returns (bool fail) {
        
        fail = false;
        uint moneyToSent = msg.value / friends.length;
        uint totalSent;
        for(uint i=0; i<friends.length; i++){
            if(!friends[i].send(moneyToSent)){
                LogFailSendEvent(owner, friends[i], moneyToSent, msg.value);
                fail = true;
            }else{
                totalSent += moneyToSent;
                LogSendEvent(owner, friends[i], moneyToSent, msg.value);
            }
        }
        balance = totalSent;

    }
    
  function kill() isOwner public {
        selfdestruct(msg.sender);
  }
    
}
