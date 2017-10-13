var Splitter = artifacts.require("./Splitter.sol");

contract('Splitter', function(accounts) {

    var contract;
    var alice = accounts[0];
    var bob = accounts[1];
    var carol = accounts[2];
    var jenny = accounts[3];
    var jhon = accounts[4];

    var contribution = 80;

    var partContribution = 99997844300000000040;

    beforeEach(function() {

        return Splitter.new(carol, bob, { from: alice })
            .then(function(instance) {
                contract = instance;
            })
    });


    it("should be Alice", function() {

        return contract.alice({ from: alice })
            .then(function(_alice) {
                assert.strictEqual(alice, _alice, "Isn't Alice");
            });

    });

    it("should apply the split correctly to bob and carol when not pass addresses", function() {

        return contract.split(carol, bob, { from: alice, value: contribution })
            .then(function(tx) {
            contract.withdraw({ from: carol })
            .then(function() {
                assert.equal(partContribution, web3.eth.getBalance(carol).toString(10), "The split is not correct");
            contract.withdraw({ from: bob })
            .then(function() {
                assert.equal(partContribution, web3.eth.getBalance(bob).toString(10), "The split is not correct");
            });
            });
            });
    });
    it("should apply the split correctly to addresses", function() {

        return contract.split(jenny, jhon, { from: alice, value: contribution })
            .then(function(tx) {
            contract.withdraw({ from: jenny })
            .then(function() {
                assert.equal(partContribution, web3.eth.getBalance(jenny).toString(10), "The split is not correct");
            contract.withdraw({ from: jhon })
            .then(function() {
                assert.equal(partContribution, web3.eth.getBalance(jhon).toString(10), "The split is not correct");
            });
            });
            });
    });
});