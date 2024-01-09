import { ethers } from 'hardhat';

async function main() {
  const votingTime = 3600;
  const [deployer] = await ethers.getSigners();

  console.log('Deploying contracts with the account:', deployer.address);

  const MyERC20 = await ethers.getContractFactory('MyERC20');
  const token = await MyERC20.deploy(votingTime);

  console.log('Token address:', await token.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
