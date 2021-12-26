const DappToken = artifacts.require('DappToken')
const DaiToken = artifacts.require('DaiToken')
const TokenFarm = artifacts.require('TokenFarm')

require('chai')
	.use(require('chai-as-promised'))
	.should()


function tokens(n) {
	return web3.utils.toWei(n, 'ether');
}

contract('TokenFarm', ([owner, investor]) => {
	let daiToken, dappToken, tokenFarm

	before(async() => {
		// Load Contracts
		daiToken = await DaiToken.new()
		dappToken = await DappToken.new()
		tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)
	
		// Transfer all Dapp tokens to farm
		await dappToken.transfer(tokenFarm.address, tokens('1000000'))

		// Send tokens to investor
		await daiToken.transfer(investor, tokens('100'), { from: owner } )
	})

	describe('Mock Dai deployment', async() => {
		it('has a name', async() => {
			const name = await daiToken.name()
			assert.equal(name, 'Mock DAI Token', 'Found name: ' + name)
		})
	})

	describe('Dapp deployment', async() => {
		it('has a name', async() => {
			const name = await dappToken.name()
			assert.equal(name, 'DApp Token', 'Found name: ' + name)
		})
	})

	describe('Token Farm deployment', async() => {
		it('has a name', async() => {
			const name = await tokenFarm.name()
			assert.equal(name, 'Dapp Token Farm', 'Found name: ' + name)
		})

		it('contract has tokens', async() => {
			let balance = await dappToken.balanceOf(tokenFarm.address)
			assert.equal(balance.toString(), tokens('1000000'))
		})
	})

	describe('Farming Tokens', async() => {
		it('Rewards investors for staking mDai tokens', async() => {
			let result

			// Check investor balance before staking
			result = await daiToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'), 'Investor mock DAI wallet balance incorrect before staking')

			// Stake Mock DAI tokens
			await daiToken.approve(tokenFarm.address, tokens('100'), { from: investor })
			await tokenFarm.stakeTokens(tokens('100'), { from: investor })

			// Check staking result
			result = await daiToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('0'), 'Investor mock DAI wallet balance incorrect after staking')

			result = await daiToken.balanceOf(tokenFarm.address)
			assert.equal(result.toString(), tokens('100'), 'Investor mock DAI wallet balance incorrect after staking')
		
			// Check staking statuses
			result = await tokenFarm.isStaking(investor)
			assert.equal(result.toString(), 'true', 'investor staking status incorrect after staking')
		
			// Issue tokens
			await tokenFarm.issueTokens({ from: owner })

			// Check balances after issuance
			result = await dappToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'), 'Investor DApp Token wallet balance incorrect after issuance')

			// Ensure owner is the only one that can issue tokens
			await tokenFarm.issueTokens({ from: investor }).should.be.rejected;

			// Unstake tokens
			await tokenFarm.unstakeTokens( { from: investor })

			// Check results after unstaking
			result = await daiToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'), 'Investor DApp DAI balance incorrect after issuance')

			result = await daiToken.balanceOf(tokenFarm.address)
			assert.equal(result.toString(), tokens('0'), 'Token Farm DApp DAI  balance incorrect after issuance')

			result = await tokenFarm.isStaking(investor)
			assert.equal(result.toString(), 'false', 'investor staking status incorrect after staking')
		})
	})
})