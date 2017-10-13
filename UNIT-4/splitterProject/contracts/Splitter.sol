pragma solidity ^0.4.5;

import "./Killable.sol";

contract Splitter is Killable{

	address public alice;

	mapping (address => uint) public pendingWithdrawals;

	event LogSendEvent(address main, address friend, uint splitQuantity, uint totalQuantity);
	event LogWithdrawEvent(address main, uint quantity);
    
	function Splitter() 
		public
	{
		alice = msg.sender; 
	}

	function split(address friendOne, address friendTwo) 
		payable
		isNotKilled
		isNotPaused
		public
		returns (bool success) 
	{
		require(friendOne != friendTwo);
		require(friendOne != address(0) && friendTwo != address(0));
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


	function withdraw() 
		isNotKilled
		isNotPaused
		public 
		returns (bool done) 
	{
        
		uint amount = pendingWithdrawals[msg.sender];
        
		if (amount<=0) revert(); 
            
		pendingWithdrawals[msg.sender] = 0;
		msg.sender.transfer(amount);
		LogWithdrawEvent(msg.sender, amount);
        
		return true;
        
	}
    
}