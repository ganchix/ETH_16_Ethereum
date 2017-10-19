const Promise = require('bluebird')

var Splitter = artifacts.require("./Splitter.sol");

web3.eth = Promise.promisifyAll(web3.eth);

contract('Splitter', function(accounts) {



    const [alice, bob, carol, daniel, emma] = accounts;

    beforeEach(function() {

        return Splitter.new({ from: alice })
            .then(instance => contractSplitter = instance);
    });


    it("should be Alice the owner", () => {

        return contractSplitter.getOwner({ from: alice })
            .then(owner => assert.strictEqual(alice, owner, "Owner Isn't Alice"));

    });

    it("should apply the split correctly to bob and carol", () => {

        var contribution = 80;
        var partContribution = 40;

        return contractSplitter.split(carol, bob, { from: alice, value: contribution })
            .then(txReceipt => {
                assertSplitEvents(txReceipt, alice, carol, bob, contribution, partContribution, 0);
                return executeWithdrawAndCheckBalance(carol, partContribution)
            })
            .then(txReceipt => executeWithdrawAndCheckBalance(bob, partContribution));
    });

    it("should apply the split correctly if contribution is high to bob and carol", () => {
        var contribution = 10000000;
        var partContribution = 5000000;

        return contractSplitter.split(carol, bob, { from: alice, value: contribution })
            .then(txReceipt => {
                assertSplitEvents(txReceipt, alice, carol, bob, contribution, partContribution, 0);
                return executeWithdrawAndCheckBalance(carol, partContribution)
            })
            .then(txReceipt => executeWithdrawAndCheckBalance(bob, partContribution));
    });
    it("should apply the split correctly if contribution is odd", () => {
        var contribution = 7;
        var partContribution = 3;

        return contractSplitter.split(carol, bob, { from: alice, value: contribution })
            .then(txReceipt => {
                assertSplitEvents(txReceipt, alice, carol, bob, contribution, partContribution, 1);
                return executeWithdrawAndCheckBalance(carol, partContribution)
            })
            .then(txReceipt => executeWithdrawAndCheckBalance(bob, partContribution))
            .then(txReceipt => executeWithdrawAndCheckBalance(alice, 1));
    });


    it("should apply the split correctly to addresses", () => {

        return contractSplitter.split(daniel, emma, { from: alice, value: 1 })
            .then(txReceipt => {
                assertSplitEvents(txReceipt, alice, daniel, emma, 1, 0, 1);
                return executeWithdrawAndCheckBalance(alice, 1);
            });
    });

    it("should fail if paused then attempt to split ", () => {

        return contractSplitter.setPause(true, { from: alice })
            .then(txReceipt => contractSplitter.split(carol, bob, { from: alice, value: 1 }))
            .then(
                txRecipt => assert.fail(0, 1, 'Exception not thrown'),
                error => assert.isOk("It shouldn't fail")
            );
    });

    it("should fail if paused then attempt to withdraw ", () => {

        var contribution = 80;
        var partContribution = 40;

        return contractSplitter.split(carol, bob, { from: alice, value: contribution })
            .then(txReceipt => {
                assertSplitEvents(txReceipt, alice, carol, bob, contribution, partContribution, 0);
                return executeWithdrawAndCheckBalance(carol, partContribution)
            })
            .then(txReceipt => contractSplitter.pause(true, { from: alice }))
            .then(txReceipt => executeWithdrawAndCheckBalance(bob, partContribution))
            .then(
                txRecipt => assert.fail(0, 1, 'Exception not thrown'),
                error => assert.isOk("It shouldn't fail")
            );
    });

    it("should fail if killed then attempt to split ", () => {

        return contractSplitter.setPause(true, { from: alice })
            .then(txReceipt => contractSplitter.kill(1, { from: alice }))
            .then(txReceipt => contractSplitter.split(carol, bob, { from: alice, value: 1 }))
            .then(
                txRecipt => assert.fail(0, 1, 'Exception not thrown'),
                error => assert.isOk("It shouldn't fail")
            );
    });

    it("should fail if killed then attempt to withdraw ", () => {

        return contractSplitter.split(carol, bob, { from: alice, value: 1 })
            .then(txReceipt => contractSplitter.pause(true, { from: alice }))
            .then(txReceipt => contractSplitter.kill(1, { from: alice }))
            .then(txReceipt => executeWithdrawAndCheckBalance(alice, 1))
            .then(
                txRecipt => assert.fail(0, 1, 'Exception not thrown'),
                error => assert.isOk("It shouldn't fail")
            );
    });

    it("should fail if a not owner killed", () => {

        return contractSplitter.kill(1, { from: bob })
            .then(
                txRecipt => assert.fail(0, 1, 'Exception not thrown'),
                error => assert.isOk("It shouldn't fail")
            );
    })

    it("should fail if a not owner paused", () => {

        return contractSplitter.setPause(1, { from: bob })
            .then(
                txRecipt => assert.fail(0, 1, 'Exception not thrown'),
                error => assert.isOk("It shouldn't fail")
            );

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
            .then(balance => {
                balanceBefore = balance;
                return contractSplitter.withdraw({ from: accountAddress });
            })
            .then(txReceipt => {
                assertWithdrawEvents(txReceipt, accountAddress, partContribution);
                gasUsed = txReceipt.receipt.gasUsed;
                return web3.eth.getTransactionAsync(txReceipt.tx);
            })
            .then(tx => {
                var fee = tx.gasPrice.times(gasUsed);
                balanceAfter = balanceBefore.plus(partContribution).minus(fee);
                return web3.eth.getBalanceAsync(accountAddress);
            })
            .then(balance => {
                assert.equal(balanceAfter.toString(10), balance.toString(10), "The split is not correct");
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