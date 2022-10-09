
import chai, { expect } from 'chai'
import { Wallet } from 'ethers'
import ExtensibleMongooseDatabase, { DatabaseExtension } from 'extensible-mongoose'
 

import {getTestDatabase} from "./helpers/test-utils"
 
import AppHelper from '../server/lib/app-helper'
import { findRecordById } from '../server/lib/mongo-helper'
import AttachedImageController from '../server/controllers/AttachedImageController'
import FileHelper from '../server/lib/file-helper'


import {LocalFileData} from 'get-file-object-from-local-path'
import fs from 'fs'
 
import Jimp from 'jimp'
import ImageDBExtension, { ImageMetadata } from '../server/dbextensions/ImageDBExtension'

var sizeOf = require('buffer-image-size');

describe('Attached Images Controller',    () => {
 
        let attachedImageController:AttachedImageController
        let mongoDB

        beforeEach(async () => {

            mongoDB  = await getTestDatabase()
            await mongoDB.dropDatabase()

            //@ts-ignore
            attachedImageController = new AttachedImageController({},mongoDB)
     
          
            let dbExtensions:Array<DatabaseExtension> = []
    
            dbExtensions.push(...[
             // new DegenAuthExtension(toadzShopDB),
           
              new ImageDBExtension(mongoDB)
            ])
 
            dbExtensions.map(ext => ext.bindModelsToDatabase())
        

        })


        afterEach(async () => {
            await mongoDB.disconnect()
        })




        
        it ('should get file dimensions', async () => {


            let imageURI = 'test/files/roboflyz.png'

            const fileData = new LocalFileData(imageURI)
            fileData.path = imageURI
            console.log('fileData',fileData)

            let binary = await FileHelper.getFileDataBinary(fileData)
            //const data = fs.readFileSync(imageURI, 'base64');

            

            const imgDim = sizeOf(  Buffer.from( binary as string , 'binary' ) );

 
            expect(imgDim.width).to.eql(600)
             
            console.log('imgDim',imgDim)
        })



        it('should insert image record', async () => {

            let wallet = Wallet.createRandom()

            let publicAddress = wallet.address 

            let imageURI = 'test/files/roboflyz.png'

            let title ='roboflyz'

            const fileData = new LocalFileData(imageURI)
            fileData.path = imageURI
            console.log('fileData',fileData)

            let binary  = await FileHelper.getFileDataBinary(fileData)

            if(typeof binary != 'string' ){
                throw 'wrong file type for binary'
                 
            }
          
            let metadata:ImageMetadata = await AttachedImageController.getImageMetadata(fileData,title,Buffer.from(binary))
  
 
            let insert = await AttachedImageController.insertNewUploadedImageRecord( 
                'testFile',
                 metadata ,
                  publicAddress,
                  'primary',
                    "0",
                    mongoDB )

             
            expect(insert.success).to.eql(true)
        })



        it('should insert image record', async () => { 
 
            let insert = await AttachedImageController.insertNewUploadedImageRecord( 
                'getlost_0xa10d540bf6c208d4b22496819130a42d.jpg',  
                {name: 'getlost.jpg',
                title:'getlost',
                sizeBytes: 3094285,
                type: 'jpg',
                widthPixels: 4480,
                heightPixels: 5600
                 }  ,
             '0x310Ff0A1b626F74699707d1B4003b1d455657911', 
             'primary',
             "0",
             mongoDB )

             
            expect(insert.success).to.eql(true)
        })



        it ('should  validate file', async () => {


            let imageURI = 'test/files/roboflyz.png'

            let title = 'roboflyz'

            const fileData = new LocalFileData(imageURI)
            fileData.path = imageURI
            
            let binary = await FileHelper.getFileDataBinary(fileData)

            if(typeof binary != 'string' ){
                throw 'wrong file type for binary'
                 
            }
           
            let metadata:ImageMetadata = await AttachedImageController.getImageMetadata(fileData,title,Buffer.from(binary))
  
 
            let validate = AttachedImageController.validateImageFile(metadata )

             
            expect(validate.success).to.eql(true)
        })

        it  ('should  invalidate file', async () => {


            let imageURI = 'test/files/roboflyz.png'

            let title = 'roboflyz'

            const fileData = new LocalFileData(imageURI)
            fileData.path = imageURI
            console.log('fileData',fileData)

            let binary = await FileHelper.getFileDataBinary(fileData)

            if(typeof binary != 'string' ){
                throw 'wrong file type for binary'
                 
            }

            let metadata:ImageMetadata = await AttachedImageController.getImageMetadata(fileData,title,Buffer.from(binary))
  

            let validations = [{"name":"minWidth", "value": "1000"}]
            let validate = AttachedImageController.validateImageFile(metadata, validations )


            expect(validate.success).to.eql(false)
        })


        it  ('should  download an image from api ', async () => {


            let imageURI = 'https://media.niftygateway.com/image/upload/v1597411820/XCOPY/3._XCOPY_DEATHLESS_l6txqt.gif'

           
            let imageBuffer = await FileHelper.downloadImageToBinary( imageURI )

            let fileName = 'testfile.gif'
            let writtenFile = await FileHelper.writeBufferToFile( imageBuffer, "/dist/imagestorage/".concat(fileName))

         
        })

         
 
       
       


 

})

