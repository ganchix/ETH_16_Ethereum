pragma solidity ^0.4.5;

import "./Owned.sol";
import "./Pausable.sol";


contract Killable is Owned, Pausable{

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
		isPaused 
		public 
	{
		require(killValue != killed);
		killed = killValue;
		LogKilledStatusEvent(msg.sender, killValue);
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