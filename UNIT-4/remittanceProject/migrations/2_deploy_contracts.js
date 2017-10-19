var Remmittance = artifacts.require("./Remmittance.sol");


module.exports = function(deployer, network,accounts) {
    deployer.deploy(Remmittance,100,100, { from: accounts[0] });
};
