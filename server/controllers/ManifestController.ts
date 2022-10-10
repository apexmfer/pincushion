 
//import ToadzShopDB, { ShopItem }  from "../lib/toadz-shop-db"
import AppHelper from "../lib/app-helper";

import ExtensibleDB from 'extensible-mongoose'
  
import FileHelper from "../lib/file-helper";

import {createRecord, findRecordById, findRecords, modifyRecord} from "../lib/mongo-helper"

import { Image, ImageDefinition, ImageSchema } from "../dbextensions/ImageDBExtension";
import { AssertionResponse, ControllerMethod } from "degen-route-loader";
import APIController from "./APIController";
import APIHelper from "../lib/api-helper";
import { ImageMetadata } from "../dbextensions/ImageDBExtension";
import { escapeString, stringToMongoId, unescapeString } from "../lib/parse-helper";
 
import { generateAttachableImageData, getMediaTypeFromDataBuffer } from "../lib/image-helper";
import { json } from "stream/consumers";


const { sync: mime, async: mimeAsync } = require('mime-kind');
 

var sizeOf = require('buffer-image-size');

const MAX_FILE_SIZE = 10485760 //bytes //10MB
const MAX_ATTACHED_IMAGES_PER_ITEM = 6


const Hash = require('ipfs-only-hash')


const UPLOAD_KEY = process.env.UPLOAD_KEY

interface MetadataContents {
  name:string,
  description:string,
  image: string 
}

export interface FileValidation  {
  name: string,
  value?: any 

} 


export default class ManifestController extends APIController {
 

  getControllerName() : string {
      return 'manifest'
  }

  
  uploadManifest: ControllerMethod = async (req:any )=> { 
           
    const sanitizeResponse = APIHelper.sanitizeAndValidateInputs(
      req.fields,
      {uploadKey:'string',metadataContents:'string' })

    if(!sanitizeResponse.success) return sanitizeResponse

    //@ts-ignore
    const {uploadKey,metadataContents} = sanitizeResponse.data 

    if(uploadKey != UPLOAD_KEY) return {success:false, error:'invalid upload key'}
      

   
    let unescapedContents = unescapeString(  metadataContents )
    console.log({unescapedContents})

    if(typeof(unescapedContents) == 'undefined') return {success:false, error:"Could not parse metadata"}

    try{ 
       let metadata:MetadataContents = JSON.parse(  unescapedContents )

        console.log({metadata})

        let uploadResponse =  await ManifestController.createManifestFile( metadata )

        return uploadResponse
    }catch(e){
      console.error(e)
    }

    return {success: false, error:"Could not create manifest"}

} 
 
static async createManifestFile (contents:MetadataContents) : Promise<AssertionResponse> {

  let ext = '.json'

  let contentString = JSON.stringify(contents)

  let filename = await ManifestController.getManifestIPFSHashName(contentString)
  
  let ipfsCID = filename.replace('ipfs__','')

  let metadataURI = `ipfs://${ipfsCID}`

  let saved = FileHelper.saveJsonFile(  contentString ,filename.concat(ext) )

  if(!saved.savedFile) return {success:false,error:'could not save metadata file'}


  return {success:true, data: { filename , metadataURI }} 
  

}





static async getManifestIPFSHashName(  fileDataString: string ) : Promise<string> {
 
     
  const imageData = Buffer.from(fileDataString, "utf-8");
  const nameHash = await Hash.of(imageData);
  console.log("fetch data CID: " + nameHash)


  return `ipfs__${nameHash}`
}



}