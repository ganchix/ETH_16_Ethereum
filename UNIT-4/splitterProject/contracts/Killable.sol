pragma solidity ^0.4.5;

import "./Pausable.sol";


contract Killable is Pausable{

    enum KilledStatus { ALIVE, KILLED, WITHDRAWN }

    KilledStatus status;
	event LogKilledStatusEvent(address main, KilledStatus killStatus);
   	event LogEmergencydrawalEvent(address main);


	function Killable() 
		public
	{
        status =  KilledStatus.ALIVE;
	}
    

	modifier isNotKilled 
	{
		require(status == KilledStatus.ALIVE);
		_;
	}
	
	modifier isNotWithdraw()
	{
		require(status != KilledStatus.WITHDRAWN);
		_;
	}
    
    
	function kill(uint killValue) 
		isOwner 
		isNotWithdraw
		whenPaused(true)
		public 
	{
	    require(uint(KilledStatus.WITHDRAWN) < killValue);
	    require(status != KilledStatus(killValue));

        status = KilledStatus(killValue);
        
		LogKilledStatusEvent(msg.sender, status);
	}

	function isKilled()
		public
		constant
		returns (bool isInNeed)
	{
		return status == KilledStatus.KILLED;
	}

	function emergencyWithdrawal() 
		isOwner
		isNotWithdraw
		public
		returns (bool success) 
	{
		require(isKilled());
		status = KilledStatus.WITHDRAWN;
		msg.sender.transfer(this.balance);
		LogEmergencydrawalEvent(msg.sender);
		return true;
	}

}