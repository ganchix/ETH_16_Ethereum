const Promise = require('bluebird')

var Splitter = artifacts.require("./Splitter.sol");

web3.eth = Promise.promisifyAll(web3.eth)

contract('Splitter', function(accounts) {



    var contract;
    var alice = accounts[0];
    var bob = accounts[1];
    var carol = accounts[2];
    var daniel = accounts[3];
    var emma = accounts[4];

    beforeEach(function() {

        return Splitter.new({ from: alice })
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



    it("should apply the split correctly to bob and carol", function() {

        var contribution = 80;
        var partContribution = 40;

        return contract.split(carol, bob, { from: alice, value: contribution })
            .then(function(txRecipt) {
                assertSplitEvents(txRecipt, alice, carol, bob, contribution, partContribution, 0);
                return executeWithdrawAndCheckBalance(carol, partContribution)
            })
            .then(function() {
                executeWithdrawAndCheckBalance(bob, partContribution);
            });
    });

    it("should apply the split correctly if contribution is high to bob and carol", function() {
        var contribution = 10000000;
        var partContribution = 5000000;

        return contract.split(carol, bob, { from: alice, value: contribution })
            .then(function(txRecipt) {
                assertSplitEvents(txRecipt, alice, carol, bob, contribution, partContribution, 0);
                return executeWithdrawAndCheckBalance(carol, partContribution)
            })
            .then(function() {
                executeWithdrawAndCheckBalance(bob, partContribution);
            });
    });


    it("should apply the split correctly to addresses", function() {

        return contract.split(daniel, emma, { from: alice, value: 1 })
            .then(function(txRecipt) {
                assertSplitEvents(txRecipt, alice, daniel, emma, 1, 0, 1);
                return executeWithdrawAndCheckBalance(alice, 1);
            });
    });

    it("should fail if paused then attempt to split ", function() {

        return contract.setPause(true, { from: alice })
            .then(function(txRecipt) {
                return contract.split(carol, bob, { from: alice, value: 1 });
            })
            .then(function(txRecipt) {
                assert.fail(0, 1, 'Exception not thrown');
            })
            .catch(function(error) {
                assert.isOk("It shouldn't fail");
            });
    });

    it("should fail if paused then attempt to withdraw ", function() {

        var contribution = 80;
        var partContribution = 40;

        return contract.split(carol, bob, { from: alice, value: contribution })
            .then(function(txRecipt) {
                assertSplitEvents(txRecipt, alice, carol, bob, contribution, partContribution, 0);
                return executeWithdrawAndCheckBalance(carol, partContribution)
            })
            .then(function() {
                return contract.pause(true, { from: alice });
            })
            .then(function() {
                return executeWithdrawAndCheckBalance(bob, partContribution);

            })
            .then(function(txRecipt) {
                assert.fail(0, 1, 'Exception not thrown');
            })
            .catch(function(error) {
                assert.isOk("It shouldn't fail");
            });
    });

    it("should fail if killed then attempt to split ", function() {

        return contract.setPause(true, { from: alice })
            .then(function(txRecipt) {
                return contract.kill(1, { from: alice });
            })
            .then(function(txRecipt) {
                return contract.split(carol, bob, { from: alice, value: 1 });
            })
            .then(function(txRecipt) {
                assert.fail(0, 1, 'Exception not thrown');
            })
            .catch(function(error) {
                assert.isOk("It shouldn't fail");
            })

    });
    it("should fail if killed then attempt to withdraw ", function() {

        return contract.split(carol, bob, { from: alice, value: 1 })
            .then(function(txRecipt) {
                return contract.pause(true, { from: alice });
            })
            .then(function(txRecipt) {
                return contract.kill(1, { from: alice });
            })
            .then(function(txRecipt) {
                return executeWithdrawAndCheckBalance(alice, 1);
            })
            .then(function(txRecipt) {
                assert.fail(0, 1, 'Exception not thrown');
            })
            .catch(function(error) {
                assert.isOk("It shouldn't fail");
            })

    });

    it("should fail if a not owner killed", function() {

        return contract.kill(1, { from: bob })
            .then(function(txRecipt) {
                assert.fail(0, 1, 'Exception not thrown');
            })
            .catch(function(error) {
                assert.isOk("It shouldn't fail");
            })

    })

    it("should fail if a not owner paused", function() {

        return contract.setPause(1, { from: bob })
            .then(function(txRecipt) {
                assert.fail(0, 1, 'Exception not thrown');
            })
            .catch(function(error) {
                assert.isOk("It shouldn't fail");
            })

    })

    function assertSplitEvents(txReceipt, owner, friend1, friend2, totalContribution, splitValue, remainder) {
        assert.equal(txReceipt.logs.length, 1);
        assert.equal(txReceipt.logs[0].event, "LogSendEvent", "Worng event");

        assert.deepEqual(txReceipt.logs[0].args, {
            main: owner,
            friend1: friend1,
            friend2: friend2,
            splitValue: web3.toBigNumber(splitValue),
            remainder: web3.toBigNumber(remainder)
        });

        var total = txReceipt.logs[0].args.splitValue.times(2)
            .plus(txReceipt.logs[0].args.remainder);

        assert.equal(total, totalContribution);
    }

    function executeWithdrawAndCheckBalance(accountAddress, partContribution) {

        var balanceBefore;
        var balanceAfter;
        var gasUsed;

        return web3.eth.getBalanceAsync(accountAddress)
            .then(function(balance) {
                balanceBefore = balance;
                return contract.withdraw({ from: accountAddress });
            })
            .then(function(txRecipt) {
                assertWithdrawEvents(txRecipt, accountAddress, partContribution);
                gasUsed = txRecipt.receipt.gasUsed;
                return web3.eth.getTransactionAsync(txRecipt.tx);
            })
            .then(function(tx) {
                var fee = tx.gasPrice.times(gasUsed);
                balanceAfter = balanceBefore.plus(partContribution).minus(fee).toString(10);
                return web3.eth.getBalanceAsync(accountAddress);
            })
            .then(function(balance) {
                var balanceDecimal = balance.toString(10);
                assert.equal(balanceAfter, balanceDecimal, "The split is not correct");
            });

    }


    function assertWithdrawEvents(txReceipt, address, quantity) {
        assert.equal(txReceipt.logs.length, 1);
        assert.equal(txReceipt.logs[0].event, "LogWithdrawEvent", "Worng event");
        assert.deepEqual(txReceipt.logs[0].args, {
            main: address,
            quantity: web3.toBigNumber(quantity)
        });

    }

});