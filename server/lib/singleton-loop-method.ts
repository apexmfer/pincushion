

/*
    Singleton Loop Method

    Instantiate this class with a Promise(method) and an array of args

    Call the start() method on the instance in order to continuously call the method in a loop.  If an instance of the method is currently executing, it will not execute another time -- it will skip. 

    In this way, the execution code will only be running in a single instance at any given time.  However, the code will loop forever until stop() is called
*/

export default class SingletonLoopMethod {

    interval:  NodeJS.Timer | undefined 
    executing: boolean


    constructor(public callback:any, public args?:any){
        this.executing = false 
        this.registerMethod(callback,args)
    }


    //callback should be a promise 
    registerMethod(  callback:any, args?:any[] ){
        
        this.callback = callback;
        this.args=args ? args : [];
    } 

    start(delayMs:number){

        this.execute()

        let delay = delayMs ? delayMs : 1000

        
        this.interval = setInterval( this.execute.bind(this) , delay )

        
    }

    stop(){
        clearInterval(this.interval)
    }

    async execute(){
        if(this.executing){ 
            return
        }; 

       
        this.executing=true
        let args = this.args ? this.args : []
        await this.callback(...args)
        this.executing=false
    }


}

