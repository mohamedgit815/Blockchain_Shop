const _Commerce = artifacts.require("../contracts/Commerce.sol");

module.exports = function (deployer) {
  deployer.deploy(_Commerce);
};
