import { Injectable } from '@angular/core';

import { ethers } from "ethers";
import { BehaviorSubject } from 'rxjs';
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

    private contractAddress = '0x3aD6bB1D0E3B8ca9314C09166cC1791F9Ebf3F58';
    private sbtAbi = [
        'event Transfer(address indexed from, address indexed to, uint256 value)',
        // 'event Transfer(address from, address to, uint256 tokenId)',

        'constructor()',

        'function createToken(string memory tokenURI, uint256 limit, uint256 _burnAuth)',
        'function createToken(string memory tokenURI, address to, uint256 _burnAuth)',
        'function createToken(string memory tokenURI, address[] memory to, uint256 _burnAuth)',

        'function claimToken(uint256 eventId) public returns (uint256)',
        'function claimIssuedToken(uint256 eventId) public returns (uint256)',

        'function incraseLimit(uint256 eventId, uint256 limit)',

        // Inherited
        'function owner() public view virtual returns (address)',
        'function balanceOf(address owner) public view virtual returns (uint256)',
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


            // console.log('we in here!');
            // this.contract = new ethers.Contract(this.contractAddress, this.sbtAbi, this.provider);

            const contractClone = this.contract as any;
            console.log('owner of contract', await contractClone.owner());
            const sbtBalance = await contractClone.balanceOf(await this.getAddress());
            console.log('balance of SBTs: ', sbtBalance.toString())

            // const testing = this.contract.filters['Transfer'](null, '0x70a2d674cF9F503ac3cb45915Be248961128EF5f');
            // console.log('testing in here: ', testing);

            // const teeeeest = await this.contract.queryFilter(testing);
            // console.log(teeeeest);


            // try {
            //     let events = await this.contract.queryFilter(testing);
            //     console.log('events here: ', events);

            // } catch (error) {
            //     console.log('error: ', error);

            // }

            // this.contract.on(testing, (event: any) => {
            //     console.log(event);
            // });


        } catch (error) {
            this.walletConnectionChanges = WalletStatus.error;
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
}


