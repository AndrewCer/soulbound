import { Injectable } from '@angular/core';

import { ethers } from "ethers";
import { BehaviorSubject } from 'rxjs';
import { BurnAuth } from '../models/burn-auth.model';
import { SBT } from '../models/token.model';
import { WalletStatus } from '../models/wallet.model';

// TODO(nocs): see provider events: https://docs.ethers.io/v5/api/providers/provider/#Provider--events

@Injectable({
    providedIn: 'root'
})
export class WalletService {
    public $walletConnectionChanges = new BehaviorSubject<WalletStatus | undefined>(undefined);
    private set walletConnectionChanges(value) {
        this.$walletConnectionChanges.next(value);
    };
    private get walletConnectionChanges() {
        return this.$walletConnectionChanges.getValue();
    }

    private contractAddress = '0x53AdBe75c8E6aAF00418464F3EE9c11C7b8B2673';
    private sbtAbi = [
        'event Transfer(address indexed from, address indexed to, uint256 value)',
        // 'event Transfer(address from, address to, uint256 tokenId)',

        'constructor()',
        // Create
        'function createToken(string memory _tokenURI, uint256 limit, uint8 _burnAuth)',
        // 'function createToken(string memory _tokenURI, address to, uint256 _burnAuth)',
        // 'function createToken(string memory _tokenURI, address[] memory to, uint256 _burnAuth)',
        // Claim
        'function claimToken(uint256 eventId) public returns (uint256)',
        'function claimIssuedToken(uint256 eventId) public returns (uint256)',

        'function incraseLimit(uint256 eventId, uint256 limit)',

        // Inherited
        'function owner() public view virtual returns (address)',
        'function balanceOf(address owner) public view virtual returns (uint256)',
        'function tokenOfOwnerByIndex(address owner, uint256 index) public view virtual returns (uint256)',
        'function tokenURI(uint256 tokenId) public view virtual returns (string memory)',
    ];
    private iface = new ethers.utils.Interface(["event Transfer(address indexed from, address indexed to, uint256 value)"]);
    private contract: ethers.Contract;
    private provider: ethers.providers.Web3Provider;
    private signer: ethers.providers.JsonRpcSigner | undefined;

    constructor() {
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        this.contract = new ethers.Contract(this.contractAddress, this.sbtAbi, this.provider);

        // window.ethereum.on("disconnect", (event: any) => {
        //     console.log(event);
        // });
        // window.ethereum.on("accountsChanged", (event: any) => {

        // });
    }

    public async startup() {
        this.signer = this.provider.getSigner();
        try {
            await this.signer.getAddress();

            this.connect();
        } catch (error) {
            this.disconnect();
        }
    }

    public async connect() {
        this.signer = this.provider.getSigner();
        try {
            await this.provider.send("eth_requestAccounts", []);

            this.walletConnectionChanges = WalletStatus.connected;
            return;
        } catch (error) {
            this.walletConnectionChanges = WalletStatus.error;
            return;
        }
    }

    public disconnect() {
        this.signer = undefined;

        this.walletConnectionChanges = WalletStatus.disconnected;
    }


    public async getAddress(): Promise<string> {
        if (!this.signer) {
            return '';
        }

        return await this.signer.getAddress();
    }

    public async getTokenURIs(address: string): Promise<string[]> {
        const contractFunctions = this.contract.functions;
        const sbtBalance = await contractFunctions['balanceOf'](address);
        console.log('balance of SBTs: ', sbtBalance.toString());

        let tokenURIs: string[] = [];
        for (let i = 0; i < sbtBalance; i++) {

            const tokenId = (await contractFunctions['tokenOfOwnerByIndex'](address, i)).toString();
            console.log('tokenID: ', tokenId);


            const tokenURI = (await contractFunctions['tokenURI'](tokenId))[0];
            tokenURIs.push(tokenURI);
        }

        return tokenURIs;
    }

    public async createTokenWithLimit(tokenURI: string, limit: number, burnAuth: number) {
        const contractFunctions = this.contract.functions;

        const sbtContract = new ethers.Contract(this.contractAddress, this.sbtAbi, this.provider) as any;
        
        const contractSigner = sbtContract.connect(this.signer);

        const txn = await contractSigner["createToken(string,uint256,uint8)"](tokenURI, limit, burnAuth);

        console.log(txn);
        

        await txn.wait();

        return txn;
    }
}


