const TokenFarm = artifacts.require('TokenFarm')

module.exports = async function(callback) {
  // deploy mock DAI Token
  let tokenFarm = await TokenFarm.deployed()
  await tokenFarm.issueTokens()

  console.log('Tokens issued!')
  callback()
}