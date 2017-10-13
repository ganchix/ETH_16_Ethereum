pragma solidity ^0.4.5;

import "./Pausable.sol";


contract Killable is Pausable{

	bool killed;
    
	event LogKilledStatusEvent(address main, bool killValue);
    
	function Killable() 
		public
	{
		killed = false;
	}
    

	modifier isNotKilled 
	{
		require(!killed);
		_;
	}
    
	function kill(bool killValue) 
		isOwner 
		public 
	{
		require(isPaused());
		require(killValue != killed);
		killed = killValue;
		LogKilledStatusEvent(msg.sender, killValue);
	}

	function isKilled()
		public
		returns (bool isIndeed)
	{
		return killed;
	}

	function emergencyWithdrawal() 
		isOwner
		public
		returns (bool success) 
	{
		require(killed);
		msg.sender.transfer(this.balance);
		return true;
	}

}