import CategoryController from "../controllers/CategoryController";
import { CategoryDefinition } from "../dbextensions/CategoryDBExtension";
import { createRecord, findRecord } from "../lib/mongo-helper";
import ServerSegmentManager from "./ServerSegmentManager";


const initCategories = [

    {name:"observation"},
    {name:"theory"},
    {name:"philosophy"},
    {name:"conspiracy"}

]



export default class CategoryManager extends ServerSegmentManager  {
 

    async init() {  

        for(let category of initCategories){

            let existingCategory = await findRecord({name:category.name},CategoryDefinition,this.mongoDB)
        
            if(!existingCategory.success){
               await  CategoryController.insertNewCategory( category  , this.mongoDB)
            }
        }

      
    
    }


}