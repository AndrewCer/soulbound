import { Injectable } from '@angular/core';

import { ethers } from "ethers";
import { BehaviorSubject } from 'rxjs';
import { jsonAbi } from 'src/assets/jsonAbi';
import { EventData } from '../models/event.model';
import { WalletStatus } from '../models/wallet.model';

// TODO(nocs): see provider events: https://docs.ethers.io/v5/api/providers/provider/#Provider--events

@Injectable({
    providedIn: 'root'
})
export class WalletService {
    public connectedWallet: string | undefined;

    public $walletConnectionChanges = new BehaviorSubject<WalletStatus | undefined>(undefined);
    private set walletConnectionChanges(value) {
        this.$walletConnectionChanges.next(value);
    };
    private get walletConnectionChanges() {
        return this.$walletConnectionChanges.getValue();
    }

    private contractAddress = '0xf5e13ff353C6CEd2FEe356becE63C3671Dc5Eb11';
    private sbtAbi: string | string[];
    private contract: ethers.Contract;
    private provider: ethers.providers.Web3Provider;
    private signer: ethers.providers.JsonRpcSigner | undefined;

    constructor() {
        const iface = new ethers.utils.Interface(jsonAbi);
        this.sbtAbi = iface.format(ethers.utils.FormatTypes['full']);

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

            this.connectedWallet = await this.getAddress();
            this.walletConnectionChanges = WalletStatus.connected;

            return;
        } catch (error) {
            this.walletConnectionChanges = WalletStatus.error;
            return;
        }
    }

    public disconnect() {
        this.signer = undefined;
        this.connectedWallet = undefined;

        this.walletConnectionChanges = WalletStatus.disconnected;
    }

    public async checkCodeForIssuedToken(code: string): Promise<number | undefined> {
        let bigNumber = await this.contract['issuedCodeTokens'](this.createHash(code));

        try {
            const eventId = parseInt(bigNumber.toString());

            if (eventId > 0) {
                return eventId;
            }
        } catch (error) {
            return undefined;
        }

        return undefined;
    }

    public async checkWalletForIssuedToken(eventId: string): Promise<boolean> {
        return await this.contract['issuedTokens(uint256,address)'](eventId, await this.getAddress());
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

    public async getEventData(eventId: string): Promise<EventData | undefined> {
        const contractFunctions = this.contract.functions;

        const data = await contractFunctions['createdTokens'](eventId);

        console.log(data);

        if (!data.owner) {
            return undefined;
        }

        if (data.owner == ethers.constants.AddressZero) {
            return undefined;
        }

        const eventData: EventData = {
            burnAuth: data.burnAuth,
            count: 0,
            limit: 0,
            owner: data.owner,
            restricted: data.restricted,
            uri: data.uri,
        }
        if (data.limit) {
            eventData.limit = parseInt(data.limit.toString());
        }
        if (data.count) {
            eventData.count = parseInt(data.count.toString());
        }


        return eventData;
    }

    // Non pre-issued tokens with limit
    public async createTokenWithLimit(tokenURI: string, limit: number, burnAuth: number) {
        const sbtContract = new ethers.Contract(this.contractAddress, this.sbtAbi, this.provider) as any;

        const contractSigner = sbtContract.connect(this.signer);

        const txn = await contractSigner["createToken(string,uint256,uint8)"](tokenURI, limit, burnAuth);

        console.log(txn);


        await txn.wait();
        return txn;
    }

    // Pre-issued tokens from addresses
    public async createTokenFromAddresses(tokenURI: string, to: string[], burnAuth: number) {
        const sbtContract = new ethers.Contract(this.contractAddress, this.sbtAbi, this.provider) as any;

        const contractSigner = sbtContract.connect(this.signer);

        const txn = await contractSigner["createToken(string,address[],uint8)"](tokenURI, to, burnAuth);

        console.log(txn);

        await txn.wait();
        return txn;
    }

    // Pre-issued tokens from codes
    public async createTokenFromCodes(tokenURI: string, to: string[], burnAuth: number) {
        const sbtContract = new ethers.Contract(this.contractAddress, this.sbtAbi, this.provider) as any;

        const contractSigner = sbtContract.connect(this.signer);

        const txn = await contractSigner.createTokenFromCode(tokenURI, to, burnAuth);

        console.log(txn);

        await txn.wait();
        return txn;
    }

    // Pre-issued tokens from codes and addresses
    public async createTokenFromBoth(tokenURI: string, toAddr: string[], toCode: string[], burnAuth: number) {
        const sbtContract = new ethers.Contract(this.contractAddress, this.sbtAbi, this.provider) as any;

        const contractSigner = sbtContract.connect(this.signer);

        const txn = await contractSigner.createTokenFromBoth(tokenURI, toAddr, toCode, burnAuth);

        console.log(txn);

        await txn.wait();
        return txn;
    }

    public async claimTokenWithLimit(eventId: string) {
        const sbtContract = new ethers.Contract(this.contractAddress, this.sbtAbi, this.provider) as any;

        const contractSigner = sbtContract.connect(this.signer);

        const txn = await contractSigner.claimToken(eventId);

        console.log(txn);

        await txn.wait();
        return txn;
    }

    public async claimIssuedToken(eventId: string) {
        const sbtContract = new ethers.Contract(this.contractAddress, this.sbtAbi, this.provider) as any;
        const contractSigner = sbtContract.connect(this.signer);

        const txn = await contractSigner.claimIssuedToken(eventId);

        console.log(txn);
        await txn.wait();
        return txn;
    }

    public async claimIssuedTokenFromCode(eventId: string, code: string) {
        const sbtContract = new ethers.Contract(this.contractAddress, this.sbtAbi, this.provider) as any;
        const contractSigner = sbtContract.connect(this.signer);

        const txn = await contractSigner.claimIssuedTokenFromCode(eventId, this.createHash(code));

        console.log(txn);

        await txn.wait();
        return txn;
    }

    public isAddress(address: string): boolean {
        return ethers.utils.isAddress(address);
    }

    public createHash(str: string): string {
        return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(str));
    }
}


