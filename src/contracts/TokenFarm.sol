pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";


contract TokenFarm {
	// State variables, stored on blockchain
	string public name = "Dapp Token Farm";
	address public owner;
	DappToken public dappToken;
	DaiToken public daiToken;

	address[] public stakers;
	mapping(address => uint) public stakingBalance;
	mapping(address => bool) public hasStaked;
	mapping(address => bool) public isStaking;

	constructor(DappToken _dappToken, DaiToken _daiToken) public {
		dappToken = _dappToken;
		daiToken = _daiToken;
		owner = msg.sender;
	}

	// Stake Tokens (Investor deposits money)
	function stakeTokens(uint _amount) public {
		// Transfer DAI tokens from investor wallet to TokenFam
		require(_amount > 0, "Amount must be greater than 0");

		// delegates transferring of tokens from user to contract
		// this is smart contract
		// msg.sender is a global var (Investor)
		daiToken.transferFrom(msg.sender, address(this), _amount);

		// Update Staking balance
		stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;


		// Add users to stakers iff they're not staked already
		if (!hasStaked[msg.sender]) {
			stakers.push(msg.sender);
		}

		// update staking statuses
		isStaking[msg.sender] = true;
		hasStaked[msg.sender] = true;
	 }

	// Issuing Tokens (Earning Interest)
	function issueTokens() public {
		// Only owner can call this function
		require(msg.sender == owner, "caller must be owner");

		// Issue tokens to stakers
		for (uint i = 0; i < stakers.length; i++) {
			address recipient = stakers[i];
			uint balance = stakingBalance[recipient];

			if (balance > 0) {
				dappToken.transfer(recipient, balance);
			}
		}
	}

	// Unstaking Tokens (Withdraw)
	function unstakeTokens() public {
		// Fetch staking balance
		uint balance = stakingBalance[msg.sender];

		// Require amount to be greater than 0
		require(balance > 0, "staking balance cannot be 0");

		// Transfer Mock Dai tokens to this contract for staking
		daiToken.transfer(msg.sender, balance);

		// Reset staking balance
		stakingBalance[msg.sender] = 0;

		// Update staking status
		isStaking[msg.sender] = false;
	}

}
