pragma solidity ^0.4.5;

contract Splitter {


    address public alice;
    
    address private bob;
    
    address private carol;

    mapping (address => uint) public pendingWithdrawals;

    event LogSendEvent(address main, address friend, uint splitQuantity, uint totalQuantity);
    event LogWithdrawEvent(address main, uint quantity);

    modifier isOwner {
        require(msg.sender == alice);
        _;
    }
    
    function Splitter(address carolAddress, address bobAddress) public {

        alice = msg.sender; 
        bob = bobAddress;
        carol = carolAddress;
    }


    
    function split() payable public {
        
        require(msg.value > 0);
        
        uint moneyToSent = msg.value / 2;
        
        if(moneyToSent>0) {
            
            pendingWithdrawals[bob] += moneyToSent;
            LogSendEvent(msg.sender, bob, moneyToSent, msg.value);
        
            pendingWithdrawals[carol] += moneyToSent;
            LogSendEvent(msg.sender, carol, moneyToSent, msg.value);
            
        }

        if (msg.value % 2 > 0) {
        	pendingWithdrawals[alice] += 1;
            LogSendEvent(msg.sender, alice, 1, msg.value);
        }
        

    }
    
    function withdraw() public {
        
        uint amount = pendingWithdrawals[msg.sender];
        
        if (amount<=0) revert(); 
            
        pendingWithdrawals[msg.sender] = 0;
        msg.sender.transfer(amount);
        LogWithdrawEvent(msg.sender, amount);
        
    }
    
    function kill() isOwner public {
        selfdestruct(msg.sender);
    }
    
}
