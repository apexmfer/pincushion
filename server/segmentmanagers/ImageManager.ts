 
import { createRecord, deleteRecords, findRecord, findRecords, modifyRecord } from "../lib/mongo-helper";
import { resolveGetQueryAsserted } from "../lib/rest-api-helper";
import { formatIpfsUri } from "../tasks/lib/parse-helper";
 
import ServerSegmentManager from "./ServerSegmentManager";

 
import fs from 'fs'
import path from 'path'
import FileHelper from "../lib/file-helper"; 
 

import {fileTypeFromBuffer,FileTypeResult} from 'file-type'
 
import { AssertionResponse } from "degen-route-loader";

import {generateAttachableImageData, getMediaTypeFromDataBuffer} from "../lib/image-helper"


const crypto = require('crypto');
const hashingSecret= process.env.HASH_SECRET ? process.env.HASH_SECRET : "hashingSecret"


var cron = require('node-cron');

export default class ImageManager extends ServerSegmentManager  {
    
 
    /* 

    1. start a vibegraph process which reads chain events 

    
    
    2. do a cron task 
    
    -- periodically read the digital assets and fetch their ipfs data and attached images from IPFS 


    */

    async init() {  

 
        cron.schedule('* * * * *', () => {
            // console.log('running a task every minute');

            //check to see if there are any digital asset projects with metadataURI but no cached metadata 
          ///  this.fetchMetadataForProjects()
        } );
    }

 

    

    

   
 
}