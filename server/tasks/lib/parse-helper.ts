import { BigNumber, ethers } from "ethers";

const {ObjectId} = require('mongodb'); 
 


  export function escapeString(input: string | undefined) : string {

    if(!input) return ""
        
    return encodeURI(input)
  }

  export function unescapeString(input: string | undefined ) : string {
    if(!input) return ""

    console.log({input})

    return decodeURI(input)
  }

  export function mongoIdToString(mongoId: any) : string{

    if(typeof mongoId == 'string'){
      return mongoId 
    }

    return mongoId.valueOf()
  }
  
  export function stringToMongoId(str: string) : any {

    let result 

    try { 
      result = ObjectId(str)
    }catch(err){
      console.error("input: " , str, err)
      
    }

    return result 
  }



  export function formatIpfsUri( input: any ){

    if(!input) return input

    input = input.replace('https://ipfs.infura.io/ipfs/','https://infura-ipfs.io/ipfs/')

    if(input && input.startsWith('ipfs://')) {

        let ipfsHash = input.substring( input.lastIndexOf('/'))

        return `https://ipfs.io/ipfs/${ipfsHash}`
    }

    return input 
}

export function formatName(input:string) {

  //input = input.split('-')[0]
  input = input.split('#')[0]
  input = input.replace('by XCOPY', '')

  return input.trim()
}





export function formatDescription(input:any){

    if(input && Array.isArray(input)){

        let output = ''

        for(let row of input){
            output = output.concat(row)
        }

        //output = output.replace('\n','')


        return output 
    }
  
    return input 
}


export function priceToCents(price:string){

    if(isNaN(parseFloat(price))) return 0

   let result = Math.floor(parseFloat(price) * 100) 

   if(result < 0) result = 0 

   return result 

}


export function centsToPrice(cents:number){

   if(isNaN(cents)) return "0.00"
   if(cents < 0 ) return "0.00"

   let result = (cents / 100.0).toFixed(2)
   
   if(parseFloat(result) < 0) result = "0.00"

   return result 

}

 export function weiToEth(wei:string) : string{

  return ethers.utils.formatEther(wei);
  
}