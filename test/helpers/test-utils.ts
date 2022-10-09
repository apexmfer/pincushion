 
import { AssertionResponse } from "degen-route-loader"
import { Wallet } from "ethers"
import ExtensibleDB from "extensible-mongoose"
   
import AppHelper from "../../server/lib/app-helper"
import { findRecordById } from "../../server/lib/mongo-helper"
import { mongoIdToString } from "../../server/lib/parse-helper"




export async function getTestDatabase(): Promise<ExtensibleDB>{


    let envmode = AppHelper.getEnvironmentName()

    let appName = AppHelper.getAppName()


    let mongoDB = new ExtensibleDB()
    await mongoDB.init( appName.concat('_').concat(envmode) )
    return mongoDB
}
 

 