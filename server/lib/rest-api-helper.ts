
import axios from 'axios'
import { AssertionResponse } from 'degen-route-loader'



export async function resolveGetQueryAsserted(uri:string, options:any ) : Promise<AssertionResponse> {
//withCredentials: true
  
              const result = await axios.get(uri,options )
              .then((res:any) => {
  
                  const results = res.data 
  
                  return {success:true, data: results }
              })
              .catch((error:any) => {
  
                  console.error('err',error)
                  return {success:false, data: null, error: 'POST request error'}
              }) 
      
              return result 
   
  }
 
  


export async function resolvePostQueryAsserted(uri:string, inputData:any) : Promise<AssertionResponse> {

    const options = { } //withCredentials: true
  
              const result = await axios.post(uri, inputData,options )
              .then((res:any) => {
  
                  const results = res.data 
  
                  return results
              })
              .catch((error:any) => {
  
                  console.error('err',error)
                  return {success:false, data: null, error: 'POST request error'}
              }) 
      
              return result 
   
  }
 
  
