pragma solidity ^0.4.5;

import "./Owned.sol";

contract Pausable is Owned{

	bool public paused;
    
	event LogPauseEvent(address main, bool pauseValue);

	function Pausable() 
		public
	{
		paused = false;
	}
    
	modifier isNotPaused 
	{
		require(!paused);
 		_;
	}

	modifier isPaused 
	{
		require(paused);
 		_;
	}
    
	function pause(bool pauseValue) 
		isOwner 
		public 
	{
		require(paused != pauseValue);
		paused = pauseValue;
		LogPauseEvent(msg.sender, pauseValue);
	}

}