pragma solidity ^0.4.5;

contract Splitter {


    address public alice;
    
    address private bob;
    
    address private carol;

    uint public balance;

    mapping (address => uint) public pendingWithdrawals;

    mapping (address => uint) public balances;

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
        uint totalSent;
        
        if(moneyToSent>0) {
            
            pendingWithdrawals[bob] += moneyToSent;
            LogSendEvent(msg.sender, bob, moneyToSent, msg.value);
            totalSent += moneyToSent;
        
            pendingWithdrawals[carol] += moneyToSent;
            LogSendEvent(msg.sender, carol, moneyToSent, msg.value);
            totalSent += moneyToSent;
            
        }

        if (msg.value % 2 > 0) {
        	msg.sender.transfer(1);
            LogSendEvent(msg.sender, msg.sender, 1, msg.value);
        }
        
        balance += msg.value;
        balances[msg.sender] += msg.value;

    }
    
    function withdraw() public returns (bool done) {
        
        uint amount = pendingWithdrawals[msg.sender];
        done = false;
        
        if (amount>0) {
            
            pendingWithdrawals[msg.sender] = 0;
            msg.sender.transfer(amount);
            LogWithdrawEvent(msg.sender, amount);
            done = true;
        }
    }
    
    function kill() isOwner public {
        selfdestruct(msg.sender);
    }
    
}
