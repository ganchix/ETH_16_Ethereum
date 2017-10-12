pragma solidity ^0.4.5;

contract Owned{

    address public owner;
   	bool killed;
       
    function Owned(){
          owner = msg.sender;
          killed = false;
    }
    
	modifier isOwner {
        require(msg.sender == owner);
        _;
    }

    modifier isNotKilled {
    	require(!killed);
        _;
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
