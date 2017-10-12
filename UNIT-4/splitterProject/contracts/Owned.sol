pragma solidity ^0.4.5;

contract Owned{

    address public owner;
   	bool killed;
   	bool paused;
       
    function Owned() public{
          owner = msg.sender;
          killed = false;
          paused = false;
    }
    
	modifier isOwner {
        require(msg.sender == owner);
        _;
    }

    modifier isNotKilledAndNotPaused {
    	require(!killed && !paused);
        _;
    }
    
    function setPause(bool pauseValue) isOwner public {
    	paused = pauseValue;
    }

    function kill() isOwner public {
    	require(!killed);
    	killed = true;
        selfdestruct(msg.sender);
    }


    function emergencyWithdrawal() isOwner public returns (bool success) {
        require(killed);
        msg.sender.transfer(this.balance);
        return true;
    }
}
