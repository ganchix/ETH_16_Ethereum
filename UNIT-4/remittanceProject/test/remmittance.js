const Promise = require('bluebird')

var Remmittance = artifacts.require("./Remmittance.sol");

web3.eth = Promise.promisifyAll(web3.eth);

contract('Remmittance', function(accounts) {

    const [alice, bob, carol, daniel, emma] = accounts;

    var passwordOne = "Password1";
    var passwordTwo = "Password2";

    var hashPassword = "0x9d1437de893f788f85e064b803382800b046563e0a6f0c208e11a86a26aace4f"
    var commission = 10;

    beforeEach(function() {

        return Remmittance.new(10, commission, { from: alice })
            .then(instance => contractRemmittance = instance);
    });



    it("should be Alice the owner", () => {
        return contractRemmittance.getOwner({ from: alice })
            .then(owner => assert.strictEqual(alice, owner, "Owner Isn't Alice"));

    });



    it("should carol add correctly from bob", () => {
        var money = 100;
        var balanceBefore;
        var balanceAfter;
        var gasUsed;

        return web3.eth.getBalanceAsync(carol)
            .then(balance => {
                balanceBefore = balance;
                return contractRemmittance.create(bob, hashPassword, { from: carol, value: money });
            })
            .then(txReceipt => {
                assert.equal(txReceipt.logs.length, 1);
                assert.equal(txReceipt.logs[0].event, "LogCreateEvent");
                assert.deepEqual(txReceipt.logs[0].args, {
                    main: carol,
                    destination: bob,
                    hashPassword: hashPassword,
                    quantity: web3.toBigNumber(money - commission),
                    commission: web3.toBigNumber(commission)

                });
                gasUsed = txReceipt.receipt.gasUsed;
                return web3.eth.getTransactionAsync(txReceipt.tx);
            })
            .then(tx => {
                var fee = tx.gasPrice.times(gasUsed);
                balanceAfter = balanceBefore.minus(money).minus(fee);
                return web3.eth.getBalanceAsync(carol);
            })
            .then(balance => {
                assert.equal(balanceAfter.toString(10), balance.toString(10), "The split is not correct");
            });
    });

    it("should carol add correctly from bob and withdraw bob the money", () => {
        var money = 100;
        var balanceBefore;
        var balanceAfter;
        var gasUsed;

        return web3.eth.getBalanceAsync(carol)
            .then(balance => {
                balanceBefore = balance;
                return contractRemmittance.create(bob, hashPassword, { from: carol, value: money });
            })
            .then(txReceipt => {
                assert.equal(txReceipt.logs.length, 1);
                assert.equal(txReceipt.logs[0].event, "LogCreateEvent");
                assert.deepEqual(txReceipt.logs[0].args, {
                    main: carol,
                    destination: bob,
                    hashPassword: hashPassword,
                    quantity: web3.toBigNumber(money - commission),
                    commission: web3.toBigNumber(commission)

                });
                gasUsed = txReceipt.receipt.gasUsed;
                return web3.eth.getTransactionAsync(txReceipt.tx);
            })
            .then(tx => {
                var fee = tx.gasPrice.times(gasUsed);
                balanceAfter = balanceBefore.minus(money).minus(fee);
                return web3.eth.getBalanceAsync(carol);
            })
            .then(balance => {
                assert.equal(balanceAfter.toString(10), balance.toString(10), "The add is not correct");
                return web3.eth.getBalanceAsync(bob);
            })
            .then(balance => {
                balanceBefore = balance;
                return contractRemmittance.withdraw(passwordOne, passwordTwo, { from: bob });
            })

            .then(txReceipt => {
                console.log("txReceipt", txReceipt);
                console.log("Logs", txReceipt.logs[0].event);

                gasUsed = txReceipt.receipt.gasUsed;
                return web3.eth.getTransactionAsync(txReceipt.tx);

            })
            .then(tx => {
                var fee = tx.gasPrice.times(gasUsed);
                balanceAfter = balanceBefore.plus(money).minus(fee).minus(commission).minus(commission);
                return web3.eth.getBalanceAsync(bob);
            })
            .then(balance => {
                assert.equal(balanceAfter.toString(10), balance.toString(10), "The split is not correct");
            });
    });




});