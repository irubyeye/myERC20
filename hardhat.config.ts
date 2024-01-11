import '@nomicfoundation/hardhat-toolbox';

require('dotenv').config();

const INFURA_API_KEY: string = process.env.INFURA_API_KEY || '';
const SEPOLIA_PRIVATE_KEY: string = process.env.SEPOLIA_PRIVATE_KEY || '';
const COVERAGE = process.env.COVERAGE === 'true';

if (COVERAGE) {
  require('solidity-coverage');
}

require('./tasks/deploy');

module.exports = {
  defaultNetwork: 'hardhat',
  solidity: '0.8.23',
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY],
    },
    // hardhat: {
    //   blockGasLimit: 200000, // Network block gasLimit
    // },
  },
  gasReporter: {
    enabled: false,
    currency: 'USD',
  },
};
