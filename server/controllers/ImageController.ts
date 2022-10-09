 
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


export interface FileValidation  {
  name: string,
  value?: any 

}
export interface UploadedFile {
  imageId: string,
  filename:string,
  tagname?:string, 
  extension:string,
  metadata?:string
}


export default class ImageController extends APIController {
 

  getControllerName() : string {
      return 'image'
  }

 
    /*
      Starts out unattached, 
    */
   
  uploadImage: ControllerMethod = async (req:any )=> {
     
    
   /* let validatedSession = await UserSessionController.validateSessionToken(req,this.mongoDB)
       
    if(!validatedSession || !validatedSession.success){
        return {success:false,error:"requires validated session"}
    } */

    

    //let parentUserId = validatedSession.data.userId

           
    const sanitizeResponse = APIHelper.sanitizeAndValidateInputs(
      req.fields,
      {uploadKey:'string'})

    if(!sanitizeResponse.success) return sanitizeResponse

    //@ts-ignore
    const {uploadKey} = sanitizeResponse.data 

    if(uploadKey != UPLOAD_KEY) return {success:false, error:'invalid upload key'}
     

    let allFiles = Object.entries(req.files)
 

    let firstFile = allFiles[0]

    let title:string = firstFile[0] //first file name 
  
    //@ts-ignore
    let fileData:File = firstFile[1]   //this is a File 



    let metaData = {} 
 

    let uploadResponse =  await ImageController.uploadNewImageFromFile( fileData, title, metaData, this.mongoDB  )

    return uploadResponse
    /*
    {data: {

      images:   [

      {filename:''}

    ]
    }}
  

    */

}
 

getImages: ControllerMethod = async (req:any ) => {

        

  let imageIds = APIHelper.sanitizeInput( req.fields.imageIds , 'string[]')
   
  let adminAddress = APIHelper.sanitizeInput(req.fields.adminAddress, 'publicaddress')  


  let query = {} 

  if(imageIds){
      let mongoItemIds: string[] =  imageIds.map(x => stringToMongoId(x))

      query['_id'] = {$in: mongoItemIds} 
  }
  
  if(adminAddress){
      query['adminAddress']=adminAddress

      //do a join with parentShopId to find ?? 
  }


  let imagesResponse = await findRecords( query , ImageDefinition , this.mongoDB)

  if(!imagesResponse.success){
      return imagesResponse
  }

  let imagesData = await Promise.all(imagesResponse.data.map( 
       x => {return  ImageController.getImageRenderData(x)}))

  return   {success:true, data: imagesData} 


}



static async uploadNewImageFromFile(fileData: any, title:string, metaData:any,  mongoDB: ExtensibleDB) : Promise<AssertionResponse>  {
 
 

  let fileSize = fileData.size 

  if(fileSize > MAX_FILE_SIZE) return {success:false, error:"File size too large"}
  
  let fileDataBuffer:Buffer
 
  let fileDataBase64:any = await FileHelper.getFileDataBase64(fileData)

 // let fileHashName = await AttachedImageController.getIPFSHashName(fileDataBase64)
  
    if(typeof fileDataBase64 != 'string' ){

      return {success:false, error:'Could not parse file data '}
    }

  fileDataBuffer = Buffer.from(fileDataBase64.split(",")[1],'base64')
      
  let uploadedImages = await ImageController.resizeAndUploadImage(
    fileDataBuffer,
    title,
    metaData,
    mongoDB)

 
  
  return  uploadedImages  

}


  static async getIPFSHashName(  fileDataString: string ) : Promise<string> {

    
  

    const endOfPrefix = fileDataString.indexOf(",");
    const cleanStrData = fileDataString.slice(endOfPrefix+1);


    const imageData = Buffer.from(cleanStrData, "base64");
    const imageHash = await Hash.of(imageData);
    console.log("fetch data CID: " + imageHash)
 

    return `ipfs__${imageHash}`

  }


  static getImageFileExtension(  fileDataBuffer: Buffer ) : string|undefined {

    const mimeT = mime(fileDataBuffer);
       
    if(mimeT){
        return mimeT.ext
    } 

    return undefined 

  }




 static async uploadNewImage(
   fileDataBuffer: Buffer, 
   fileHashName:string,
   title:string, 
   extension:string, 
   tagname:string,
   parentUserId: string|undefined, 
   mongoDB: ExtensibleDB) : Promise<AssertionResponse>  {
          
  

    if(!extension.endsWith('png') 
    && !extension.endsWith('gif')
    && !extension.endsWith('jpg')
    && !extension.endsWith('jpeg')){
      return {success:false,error:'invalid image format'}
    }

    if(!extension.startsWith('.')){
      extension = '.'.concat(extension)
    }

    let fileName = fileHashName.concat(extension)

    let imageStorageFolder:string = "/imagestorage/"

    try{

        let fullFilePath = await FileHelper.writeBufferToFile( 
          fileDataBuffer, imageStorageFolder.concat(fileName))
    
        let metadata = await ImageController.getImageMetadata(fileName,title,fileDataBuffer)
    

        let recordCreate = await ImageController.insertNewUploadedImageRecord(
          fileName , metadata,  fileHashName, tagname, parentUserId, mongoDB)
      
        return recordCreate

    }catch(e){

      return {success:false, error:`Failed to upload image ${title}`}
    }
  

  //return {success:false, error:'unknown error' }



} 

  
    static async attachImage( imageId : string,  parentType: string, parentId: string,  mongoDB: ExtensibleDB) {
           

      let validations: FileValidation[] = AppHelper.getImageUploadValidationsForDomain( parentType )

      let imageRecordResponse = await findRecordById( imageId,  ImageDefinition, mongoDB)

      if(!imageRecordResponse.success){
        return imageRecordResponse
      }

      let imageRecord:Image = imageRecordResponse.data 

      if(imageRecord.status != 'detached'){
        return {success: false, error: 'Image attachment failed.'}
      } 
 

      let metadata = JSON.parse(imageRecord.metadata)

      let validationResponse = ImageController.validateImageFile(metadata,validations)

      if(!validationResponse.success){
        return validationResponse
      }


      let update = {

        parentType,
        parentId,
        status: 'attached'

      }


      let updateResponse = await modifyRecord(imageId, update, ImageDefinition, mongoDB )

      return updateResponse
  
  }


  static async resizeAndUploadImage(imageDataBuffer:Buffer, imageTitle:string, metadata:any,    mongoDB:ExtensibleDB) : Promise<AssertionResponse> {



    let mediaType:string|undefined = getMediaTypeFromDataBuffer( imageDataBuffer )

    if(!mediaType){
        
        return {success:false, error:'could not determine filetype'}
    }


    
    let uploadableImages = await generateAttachableImageData(imageDataBuffer, mediaType)

    let uploadedImages:any[] = []

    if(!uploadableImages || uploadableImages.length == 0){
        return {success:false, error:'could not generate preimage data '}
    }


        for(let uploadable of uploadableImages){ 

                let fileDataBase64:string = uploadable.imageBuffer.toString('base64')   

                let fileHashName:string = await ImageController.getIPFSHashName(  fileDataBase64 ) 
                        
                let newImageRecord = await ImageController.uploadNewImage(
                    uploadable.imageBuffer,
                    fileHashName,
                    imageTitle,
                    uploadable.extension, 
                    uploadable.tagname, 
                    metadata, 
                    mongoDB  )


                if(!newImageRecord.success) return newImageRecord

                let newImageRecordId = newImageRecord.data._id


                let uploadedFile:UploadedFile =    {
                  imageId: newImageRecordId,
                  filename: fileHashName,
                  extension: uploadable.extension,
                  tagname: uploadable.tagname,
                  metadata: JSON.stringify(metadata)   
                }

                uploadedImages.push(uploadedFile) 
        }
 

      return {success:true, data: uploadedImages}
  }


  
     
    static async insertNewUploadedImageRecord(
      filename:string, 
      metadata: ImageMetadata, 
      filenamehash:string, 
      tagname:string,
      parentUserId:string|undefined,
      mongoDB: ExtensibleDB): Promise<AssertionResponse>{
  
       
      let metadataStringified = JSON.stringify(metadata)

        let result = await createRecord( {
          filename,
          filenamehash,
          tagname,
          parentUserId, 
          metadata: metadataStringified ,
          status:'detached'},
          ImageDefinition, mongoDB )      
 
        return result

    } 

 
    static async deleteUploadedImage( imageId: string, mongoDB: ExtensibleDB  ){
 

      let update = {
 
        status: 'deleted'

      } 


      //delete the file from cache folder  LATER  (culling bot )

      let updateResponse = await modifyRecord(imageId, update, ImageDefinition, mongoDB )

      return updateResponse



    }
 

    static async getImageMetadata(fileName:string, title:string, fileBuffer:Buffer ) : Promise<ImageMetadata>{
       

      let imgBuffer:Buffer = fileBuffer //Buffer.from(fileDataBinary as string,'binary' ) 
       
      let imageDimensions = {width:0,height:0}

 
      try{
        imageDimensions = sizeOf( imgBuffer );
      }catch(err){ 
        console.error(err)
        // return {success:false, error:'Could not read file dimensions'}
      }

      //let combinedFileData = Object.assign( file, imageDimensions )

      return  {
        name: fileName,
        title,
        sizeBytes: imgBuffer.length,
        type: 'image',
        widthPixels: imageDimensions.width,
        heightPixels : imageDimensions.height  
      }
    }


 


    static validateImageFile(metadata: ImageMetadata, validations? : FileValidation[]) : AssertionResponse{

      if(!validations){
        validations = []
      } 


      let globalValidations = [
        {"name":"validName"},
        {"name":"maxFileSize","value":MAX_FILE_SIZE},
        {"name":"fileType","value":["image/png","image/jpeg"]}
      ]


      for(let val of validations.concat(globalValidations)){
        let validationResponse = ImageController.assertFileValidation( metadata , val  )

        if(!validationResponse.success){
          return validationResponse
        }
      }



      return {success:true, error:undefined}
    }

    static assertFileValidation(metadata:ImageMetadata, validation:FileValidation ) : AssertionResponse  {

      let validationName = validation.name.toLowerCase()
      let validationValue = validation.value 

      if(validation.name == 'validname'){
        if(metadata.name != unescapeString(escapeString(metadata.name))) {
          return {success:false, error:'File name contains invalid characters'}
        }
      }

      if(validation.name == 'maxfilesize'){
        if(metadata.sizeBytes > validationValue){
          return {success:false, error:`File size must not exceed ${validationValue} bytes.`}
        }
      }
 
    
      if(validation.name == 'minWidth'){
        if(metadata.widthPixels < validationValue){
          return {success:false, error:`File width must be at least ${validationValue}`}
        }
      }

      if(validation.name == 'minHeight'){
        if(metadata.heightPixels < validationValue){
          return {success:false, error:`File height must be at least ${validationValue}`}
        }
      } 
    


      if(validation.name == 'filetype'){
        let matchingType = false 

        for(let validType of validationValue){
          if(metadata.type == validType){
            matchingType = true 
            break;
          }
        }

        if(!matchingType){
          return {success:false, error:'File type invalid'}
        }
      }
 
      return {success:true}
    }



    static async getImageRenderData(img:any  ){
       return {
          filename: unescapeString(img.filename),
          metadata: unescapeString(img.metadata)
        
      }
    }


 
  

}