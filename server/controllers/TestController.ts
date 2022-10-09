 
import AppHelper from "../lib/app-helper";

import { ControllerMethod, AssertionResponse, Route } from "degen-route-loader"

import web3utils from 'web3-utils'
import APIHelper from "../lib/api-helper";
import FileHelper from "../lib/file-helper";
import AttachedImageController, { FileValidation } from "./AttachedImageController";
 
import ExtensibleDB from 'extensible-mongoose'
  
import { createRecord, deleteRecord, findRecordById, findRecords } from "../lib/mongo-helper";
import APIController from "./APIController"; 
  
import { escapeString, mongoIdToString, stringToMongoId, unescapeString } from "../lib/parse-helper";
 
export default class TestController extends APIController {

    getRoutes() : Route[]{
        return [
            {"type":"get","uri":"/api/ping","method":"ping","controller":this.getControllerName()},
        ] 
    }

    getControllerName() : string {
        return 'test'
    }
   

 
    
    ping: ControllerMethod = async (req:any) => {

       

      
        return   {success:true, data: "pong"}


    }

    
  

}