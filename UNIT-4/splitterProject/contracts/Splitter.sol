pragma solidity ^0.4.5;

import "./Owned.sol";

contract Splitter is Owned{

	address public alice;
    
    address private bob;
    
    address private carol;

    mapping (address => uint) public pendingWithdrawals;

    event LogSendEvent(address main, address friend, uint splitQuantity, uint totalQuantity);
    event LogWithdrawEvent(address main, uint quantity);
    
    function Splitter(address carolAddress, address bobAddress) public {
    	require(carolAddress != bobAddress);
    	require(msg.sender != bobAddress && msg.sender != carolAddress);
    	require(carolAddress != address(0) && bobAddress != address(0));

        alice = msg.sender; 
        bob = bobAddress;
        carol = carolAddress;
    }


    
    function split() payable public returns (bool success) {
        success = internalSplit(bob, carol);        
    }
    
    function splitWithOtherFriends(address friendOne, address friendTwo) payable public returns (bool success) {
    	require(friendOne != address(0) && friendTwo != address(0));
        success = internalSplit(friendOne, friendTwo);        
    }
    
    function internalSplit(address friendOne, address friendTwo) isNotKilledAndNotPaused private returns (bool){
        
        require(msg.value > 0);
        
        uint moneyToSent = msg.value / 2;
        
        if(moneyToSent>0) {
            
            pendingWithdrawals[friendOne] += moneyToSent;
            LogSendEvent(msg.sender, friendOne, moneyToSent, msg.value);
        
            pendingWithdrawals[friendTwo] += moneyToSent;
            LogSendEvent(msg.sender, friendTwo, moneyToSent, msg.value);
            
        }

		uint remainder = msg.value % 2;

		if (remainder > 0) {
    		pendingWithdrawals[alice] += remainder;
    		LogSendEvent(msg.sender, alice, remainder, msg.value);
		}

		return true;
    }

    function withdraw() isNotKilledAndNotPaused public returns (bool done) {
        
        uint amount = pendingWithdrawals[msg.sender];
        
        if (amount<=0) revert(); 
            
        pendingWithdrawals[msg.sender] = 0;
        msg.sender.transfer(amount);
        LogWithdrawEvent(msg.sender, amount);
        
        return true;
        
    }
    
}