pragma solidity ^0.4.4;

contract Shop {

	struct Product {
		uint price;
		string name;
		uint stockBalance;
	}

    uint ownerWithdrawals;

	mapping (uint => Product) public stock;
	
	uint[] public products;
	
	address administrator;
	
	address owner;

	event AddProductEvent(uint id, uint price, string name);
	
	event DeleteProductEvent(uint id, uint price, string name);
	
	event BuyProductEvent(uint id);

    event LogWithdrawEvent(address main, uint quantity);

	function Shop(address administratorAddress) public {
		administrator = administratorAddress;
		owner = msg.sender;
	}

    modifier isOwner {
        require(msg.sender == owner);
        _;
    }

    modifier isAdministrator {
        require(msg.sender == administrator);
        _;
    }
    
    
    function addProduct(uint id, uint price, string name) public isAdministrator{

        stock[id].price = price;
        stock[id].stockBalance += 1;
        stock[id].name = name;
        products.push(id);
        AddProductEvent(id, price, name);

    }
    
    function deleteProduct(uint id) public isAdministrator {
        stock[id].price = 0;
        stock[id].stockBalance = 0;
        stock[id].name = "";
    }
    
    
    function buyProduct(uint id) payable public{
        
        require(stock[id].price > 0);
        require(stock[id].price <= msg.value);
        require(stock[id].stockBalance > 0);
        stock[id].stockBalance--;
        ownerWithdrawals += stock[id].price;
        BuyProductEvent(id);
    }
    
    function withdraw() public isOwner {
        
        if (ownerWithdrawals<=0) revert(); 
            
        ownerWithdrawals = 0;
        msg.sender.transfer(ownerWithdrawals);
        LogWithdrawEvent(msg.sender, ownerWithdrawals);
        
    }
}
