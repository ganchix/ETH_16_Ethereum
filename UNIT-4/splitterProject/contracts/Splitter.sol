pragma solidity ^0.4.5;

import "./Killable.sol";

contract Splitter is Killable{

	address public alice;

	mapping (address => uint) public pendingWithdrawals;

	event LogSendEvent(address main, uint remainder, address friend1, address friend2, uint splitValue);
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
			pendingWithdrawals[friendTwo] += moneyToSent;
            
		}

		uint remainder = msg.value % 2;

		if (remainder > 0) {
			pendingWithdrawals[alice] += remainder;
		}
		
		LogSendEvent(alice,  remainder, friendOne, friendTwo, moneyToSent);

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