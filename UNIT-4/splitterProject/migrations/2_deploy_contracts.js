var Splitter = artifacts.require("./Splitter.sol");

module.exports = function(deployer,network,accounts) {
  deployer.deploy(Splitter, { from: accounts[0] });
};