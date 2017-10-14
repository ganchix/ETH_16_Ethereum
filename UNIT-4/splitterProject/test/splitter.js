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
                return web3.eth.getBalance(carol);
            })
            .then(function(balance) {
                carolBalance = balance;
                console.log("Carol Balance ", carolBalance);
                return contract.withdraw({ from: carol });
            })
            .then(function(txnCarolWithDraw) {
                var gasPrice = web3.eth.gasPrice;

                console.log("Total gas ", txnCarolWithDraw.receipt.gasUsed);
                console.log("partContribution ", partContribution);
                console.log("txnCarolWithDraw ", txnCarolWithDraw);

                var fee = gasPrice.times(txnCarolWithDraw.receipt.gasUsed);
                console.log("fee ", fee);
                var carolWithDrawBlance = carolBalance.plus(partContribution).minus(fee).toString(10);

                console.log("carolWithDrawBlance ", carolWithDrawBlance);

                assert.equal(carolWithDrawBlance, web3.eth.getBalance(carol).toString(10), "The split is not correct");
                return contract.withdraw({ from: bob });
            })
            .then(function() {
                assert.equal(partContribution, web3.eth.getBalance(bob).toString(10), "The split is not correct");
            });
    });

    it("should apply the split correctly to addresses", function() {

        return contract.split(daniel, emma, { from: alice, value: contribution })
            .then(function(tx) {
                return contract.withdraw({ from: daniel });
            })
            .then(function() {
                assert.equal(partContribution, web3.eth.getBalance(daniel).toString(10), "The split is not correct");
                return contract.withdraw({ from: emma });
            })
            .then(function() {
                assert.equal(partContribution, web3.eth.getBalance(emma).toString(10), "The split is not correct");
            });
    });
});