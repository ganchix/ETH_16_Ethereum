pragma solidity ^0.4.4;

contract Shop {

	struct Product {
		uint price;
		string name;
		uint stockBalance;
	}

    uint ownerWithdrawals;

	mapping (uint => Product) stock;
	
	uint[] products;
	
	address administrator;
	
	address owner;

	event AddProductEvent(uint id, uint price, string name);
	
	event DeleteProductEvent(uint id);
	
	event BuyProductEvent(uint id);

    event LogWithdrawEvent(address main, uint quantity);

	function Shop(address administratorAddress) 
		public
	{
		administrator = administratorAddress;
		owner = msg.sender;
	}

    modifier isOwner 
    {
        require(msg.sender == owner);
        _;
    }

    modifier isAdministrator 
    {
        require(msg.sender == administrator);
        _;
    }
    
	function getProductCount() 
		constant 
		returns (uint length) 
	{	
		return products.length;	
	}

	function getProductIdAt(uint index)
		constant
		returns (uint id) 
	{
		return products[index];
	}

	function getProduct(uint id)
		constant
		returns (string name, uint price, uint stockBalance) 
	{
		Product product = stock[id];
		return (product.name,
			product.price,
			product.stockBalance);
	}
    
    function addProduct(uint id, uint price, string name)
   		public 
   		isAdministrator
   	{
   		products.push(id);
        stock[id].price = price;
        stock[id].stockBalance += 1;
        stock[id].name = name;
        AddProductEvent(id, price, name);

    }
    
    function deleteProduct(uint id) 
    	public 
    	isAdministrator
    {

        uint index = indexOf(id);

        for (uint i = index; i<products.length-1; i++){
            products[i] = products[i+1];
        }
        delete products[products.length-1];
        products.length--;
        delete stock[id];
        DeleteProductEvent(id);
    }

    function indexOf(uint id) 
    	private
    	returns(uint) 
	{
    
        for (uint i = 0; i<products.length-1; i++){
             if(products[i] == id) return i;
        }
       	throw;
  	}

    
    
    function buyProduct(uint id) 
    	payable
    	public
    {    
        require(stock[id].price > 0);
        require(stock[id].price <= msg.value);
        require(stock[id].stockBalance > 0);
        stock[id].stockBalance--;
        ownerWithdrawals += stock[id].price;
        BuyProductEvent(id);
    }
    
    function withdraw() 
    	public
    	isOwner
    {
        
        if (ownerWithdrawals<=0) revert(); 
            
        ownerWithdrawals = 0;
        msg.sender.transfer(ownerWithdrawals);
        LogWithdrawEvent(msg.sender, ownerWithdrawals);
        
    }
}