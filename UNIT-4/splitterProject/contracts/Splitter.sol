pragma solidity ^0.4.5;

contract Splitter {
    
    uint public balance;
    
    address[] public friends;
    
    address public owner;
    
    event LogAddFriendEvent(address main, address friend);

    event LogFailSendEvent(address main, address friend, uint value, uint total);

    event LogSendEvent(address main, address friend, uint value, uint total);

    modifier isOwner {
        if (msg.sender != owner) {
            revert();
        }
        _;
    }
    
    function Splitter(address[] addresses) public {

        if(addresses.length == 0) revert();

        for(uint i=0; i<addresses.length; i++){
            if(addresses[i] == msg.sender) revert();
        }
        owner = msg.sender;
        friends = addresses;
    }


    function addFriend(address newFriend) isOwner public {
    
        for(uint i=0; i<friends.length; i++){
            if(friends[i] == newFriend) revert();
        }
    
        friends.push(newFriend);
        LogAddFriendEvent(msg.sender, newFriend);

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
