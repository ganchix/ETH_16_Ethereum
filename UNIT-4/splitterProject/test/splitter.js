var Splitter = artifacts.require("./Splitter.sol");

contract('Splitter', function(accounts) {

    var contract;
    var owner = accounts[0];
    var address = accounts.slice(1, accounts.length);

    var contribution = 80000000000000000000;

    var partContribution = (contribution / address.length) + 100000000000000000000;

    beforeEach(function() {

        return Splitter.new(address, { from: owner })
            .then(function(instance) {
                contract = instance;
            })
    });


    it("should just say hello", function() {
        assert.strictEqual(true, true, "Never happen!");
    });

    it("should be owned by the owner", function() {

        return contract.owner({ from: owner })
            .then(function(_owner) {
                assert.strictEqual(owner, _owner, "Contract is not owned by owner");
            });

    });

    it("should have 0 balance", function() {

        return contract.balance({ from: owner })
            .then(function(_balance) {
                assert.equal(0, _balance.toString(10), "Contract haven't 0 balance");
            });

    });

    it("should apply the split correctly", function() {

        return contract.split({ from: owner, value: contribution })
            .then(function(tx) {
                contract.balance({ from: owner })
                    .then(function(_balance1) {
                        assert.equal(contribution, _balance1.toString(10), "Contract haven't the correct balance");
                        for (var i = address.length - 1; i >= 0; i--) {
                            assert.equal(partContribution, web3.eth.getBalance(address[i]).toString(10), "The split is not correct");
                        }
                    });
            });
    });
});