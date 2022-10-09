import { AssertionResponse } from "degen-route-loader"
import { ShippingDetail } from "../dbextensions/OrderDBExtensions"


const validCountryCodes = ['US']

const validStateCodes = ['MI','OR','CA']
  
export function validateShippingDetails(shippingDetails: ShippingDetail) : AssertionResponse {
      


      if(!shippingDetails.fullName){
        return {success:false, error:"Missing full name"}
      }

      if(!shippingDetails.streetName){
        return {success:false, error:"Missing street name"}
      }

      if(!shippingDetails.stateCode){
        return {success:false, error:"Missing state code"}
      }

      if(!shippingDetails.countryCode){
        return {success:false, error:"Missing country code"}
      }

      if(!shippingDetails.zipCode){
        return {success:false, error:"Missing zip code"}
      }

    /*  if(!shippingDetails.phone){
        return {success:false, error:"Missing phone"}
      }

      if(!shippingDetails.email){
        return {success:false, error:"Missing email"}
      }*/
      

      return {success: true}
    }


 