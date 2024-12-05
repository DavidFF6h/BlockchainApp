import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { create } from 'ipfs-http-client'; // Import IPFS client
import IdentityContract from './artifacts/Identity.json';

const ipfs = create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }); // IPFS client configuration

const App = () => {
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [ipfsHash, setIpfsHash] = useState('');
    const [deployedAddress, setDeployedAddress] = useState('');

    // Initialize Web3 and load blockchain data
    const loadBlockchainData = async () => {
        try {
            if (window.ethereum) {
                const web3 = new Web3(window.ethereum);
                await window.ethereum.request({ method: 'eth_requestAccounts' }); // Requests MetaMask connection
                
                const accounts = await web3.eth.getAccounts();
                setAccount(accounts[0]);

                const networkId = await web3.eth.net.getId();
                const deployedNetwork = IdentityContract.networks[networkId];

                if (deployedNetwork) {
                    const instance = new web3.eth.Contract(
                        IdentityContract.abi,
                        deployedNetwork.address
                    );
                    setContract(instance);
                    setDeployedAddress(deployedNetwork.address);
                    console.log("Contract instance loaded:", instance);
                } else {
                    alert('Smart contract not deployed to detected network. Deploying now...');
                    deployContract(web3, accounts[0]); // Deploy the contract
                }
            } else {
                alert('Please install MetaMask to use this application.');
            }
        } catch (error) {
            console.error("Error loading Web3 or contract:", error);
        }
    };

    // Deploy the contract
    const deployContract = async (web3, account) => {
        try {
            const contractInstance = new web3.eth.Contract(IdentityContract.abi);
            const deployedContract = await contractInstance
                .deploy({ data: IdentityContract.bytecode })
                .send({ from: account });
            setContract(deployedContract);
            setDeployedAddress(deployedContract.options.address);
            console.log("Contract deployed at address:", deployedContract.options.address);
        } catch (error) {
            console.error("Error deploying contract:", error);
            alert("Failed to deploy the contract.");
        }
    };

    useEffect(() => {
        loadBlockchainData();
    }, []);

    // Upload data to IPFS and register user on the blockchain
    const registerUser = async () => {
        if (!contract) {
            alert("Contract instance not loaded.");
            return;
        }

        try {
            // Prepare user data
            const userData = JSON.stringify({ name, email });

            // Upload to IPFS
            const result = await ipfs.add(userData);
            const hash = result.path; // Retrieve the IPFS hash (CID)
            setIpfsHash(hash);
            console.log('Uploaded to IPFS with hash:', hash);

            // Interact with the smart contract
            await contract.methods.registerUser(hash).send({ from: account });
            alert('User registered successfully on blockchain and IPFS!');
        } catch (error) {
            console.error("Error during registration:", error);
            alert("Failed to register user. Check console for details.");
        }
    };

    return (
        <div>
            <h1>Decentralized Identity System</h1>
            <p>Connected Account: {account}</p>
            {deployedAddress && <p>Contract Address: {deployedAddress}</p>}
            <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={registerUser}>Register User</button>
            {ipfsHash && (
                <p>
                    IPFS Hash: <a href={`https://ipfs.io/ipfs/${ipfsHash}`} target="_blank" rel="noreferrer">{ipfsHash}</a>
                </p>
            )}
        </div>
    );
};

export default App;
