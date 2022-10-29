import { Blob } from 'buffer';
import express from 'express';
import multer from 'multer';
import { NFTStorage, File, Token } from "nft.storage";
import { TokenInput } from 'nft.storage/dist/src/token';
import { SBT } from '../../../models/token.model';
import nanoidService from '../../../services/id-generators/nanoid.service';

const router = express.Router();

const { NFT_STORAGE_API_KEY } = process.env;

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });
const upload = multer();

/*
* START: CRUD
*/
// Create
router.post(
    '/upload',
    // upload.single('uploaded-image'),
    upload.single('uploaded-image'),
    async (req: express.Request, res: express.Response) => {
        const file = req.file as Express.Multer.File;

        const imageFile = new File([file.buffer], nanoidService.generate() + req.body.name, { type: file.mimetype })
        const metaData: any = {
            name: req.body.name,
            description: req.body.description,
            image: imageFile,
        }
        if (req.body.external_url) {
            metaData.external_url = req.body.external_url;
        }

        const client = new NFTStorage({ token: NFT_STORAGE_API_KEY as string });
        const token = await client.store(metaData);


        res.json({
            success: token.url
        });
    });

// Read

// Update

// Delete

/*
* END: CRUD
*/

/*
* START: Helper methods
*/

/*
* END: Helper methods
*/

export { router }
