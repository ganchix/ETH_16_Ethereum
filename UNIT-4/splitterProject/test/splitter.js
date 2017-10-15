var Splitter = artifacts.require("./Splitter.sol");

contract('Splitter', function(accounts) {

    var contract;
    var alice = accounts[0];
    var bob = accounts[1];
    var carol = accounts[2];
    var daniel = accounts[3];
    var emma = accounts[4];


    var contribution = 80;

    var partContribution = contribution / 2;

    beforeEach(function() {

        return Splitter.new(carol, bob, { from: alice })
            .then(function(instance) {
                contract = instance;
            })
    });


    it("should be Alice the owner", function() {

        return contract.getOwner({ from: alice })
            .then(function(owner) {
                assert.strictEqual(alice, owner, "Owner Isn't Alice");
            });

    });

    it("should apply the split correctly to bob and carol when not pass addresses", function() {
        var carolBalance;

        return contract.split(carol, bob, { from: alice, value: contribution })
            .then(function(tx) {
                return executeWithdrawAndCheckBalance(carol, partContribution)
            })
            .then(function(){
                executeWithdrawAndCheckBalance(bob, partContribution);
            });
    });



    it("should apply the split correctly to addresses", function() {

        return contract.split(daniel, emma, { from: alice, value: contribution })
            .then(function(tx) {
                return executeWithdrawAndCheckBalance(daniel, partContribution)
            })
            .then(function(){
                executeWithdrawAndCheckBalance(emma, partContribution);
            });
    });
    

    function executeWithdrawAndCheckBalance(accountAddress, splitPart) {

        var balanceBefore;
        var balanceAfter;
        var gasUsed;

        return getBalance(accountAddress)
            .then(function(balance) {
                balanceBefore = balance;
                return contract.withdraw({ from: accountAddress });
            })
            .then(function(txRecipt) {
                gasUsed = txRecipt.receipt.gasUsed;
                return web3.eth.getTransaction(txRecipt.tx);
            })
            .then(function(tx) {
                var fee = tx.gasPrice.times(gasUsed);
                balanceAfter = balanceBefore.plus(partContribution).minus(fee).toString(10);
                return getBalance(accountAddress);
            })
            .then(function(balance) {
                assert.equal(balanceAfter, balance, "The split is not correct");
            });

    }

    function getBalance(address) {
        return new Promise(function(resolve, reject) {
            web3.eth.getBalance(address, function(error, result) {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }
});