


const { sync: mime, async: mimeAsync } = require('mime-kind');






import sharp from 'sharp'
const gifResize = require('@gumlet/gif-resize'); 




export async function generateAttachableImageData(imageDataBuffer:Buffer, mediaType:string){


    let attachableImages:{tagname:string,imageBuffer:Buffer, extension:string}[] = [] 

    if(mediaType == 'gif'){

        attachableImages.push( {

            tagname: 'primary',
            imageBuffer: imageDataBuffer,
            extension:".gif"
        }  )

        let resizedImageBuffer:Buffer = await resizeGif(imageDataBuffer)
        
        if(imageDataBuffer.compare(resizedImageBuffer) != 0){
            attachableImages.push( {

                tagname: 'thumbnail',
                imageBuffer: resizedImageBuffer,
                extension:".gif"
            }  ) 
        }

       


    }

    if(mediaType == 'jpg' || mediaType == 'jpeg'){

        attachableImages.push( {

            tagname: 'primary',
            imageBuffer: imageDataBuffer,
            extension:".jpg"
        }  )

        console.log({imageDataBuffer})

         
        let resizedImageBuffer:Buffer = await resizeJpg(imageDataBuffer)

        if(imageDataBuffer.compare(resizedImageBuffer) != 0){
            

            attachableImages.push( {

                tagname: 'thumbnail',
                imageBuffer: resizedImageBuffer,
                extension:".jpg"
            }  )

        }

      

    }


    if(mediaType == 'png'){

        attachableImages.push( {

            tagname: 'primary',
            imageBuffer: imageDataBuffer,
            extension:".png"
        }  )

        console.log({imageDataBuffer})

         
        let resizedImageBuffer:Buffer = await resizePng(imageDataBuffer)

        if(imageDataBuffer.compare(resizedImageBuffer) != 0){



                attachableImages.push( {

                    tagname: 'thumbnail',
                    imageBuffer: resizedImageBuffer,
                    extension:".png"
                }  )

        }


    }


    return attachableImages

   

}




export async function resizeJpg(imgBuffer:Buffer) : Promise<Buffer> {
 
    return await sharp(imgBuffer) 
     .resize(260)
     .jpeg({ mozjpeg: true })
     .toBuffer()
     
 }
 export async function resizePng(imgBuffer:Buffer) : Promise<Buffer> {
 
    return await sharp(imgBuffer) 
     .resize(260)
     .png( )
     .toBuffer()
     
 }

 
 
 export async function resizeGif( imgBuffer:Buffer ) : Promise<Buffer> {
     return new Promise( (resolve,reject) => {
 
         gifResize(
            {  width: 260 }
            )(imgBuffer).then(data => {
                resolve(data)
            }  )
 
 
    })   
 }
 


export function getMediaTypeFromDataBuffer(data:Buffer) : string|undefined {

    const mimeT = mime(data);

    
    if(mimeT){
        return mimeT.ext
    } 

    return undefined 

}

