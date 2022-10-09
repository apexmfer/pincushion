import UserSessionController from '../controllers/UserSessionController';
import AppHelper from '../lib/app-helper'
import ServerModule from "./ServerModule";

const base64url = require('base64url');

require('dotenv').config()




 const passport = require('passport');
 const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
       

 const cookieParser = require('cookie-parser');
 
 const session = require('express-session');


 /*

    oauthCallbackURL must match  'Authorized redirect URIs' in google cloud


 */


export interface OAuthModuleConfig  {
        googleClientId: String|undefined;
        googleClientSecret:String|undefined;
        oauthCallbackURL: String|undefined;
        expressSessionSecret: String;

    }
 
export default class OAuthModule extends ServerModule {

    constructor( public config: OAuthModuleConfig , public userSessionController: UserSessionController){
        super();
    }

    init(expressApp:any ){
        this.initPassportStrategy(expressApp)
    }

    initPassportStrategy(expressApp:any){ 


        expressApp.use(session({
        resave: false,
        saveUninitialized: true,
        secret: this.config.expressSessionSecret
        }));


        /*  PASSPORT SETUP  */
    
        
        var userProfile;

        
        expressApp.use(cookieParser());


    
        expressApp.use(passport.initialize());
        expressApp.use(passport.session());
    
       // expressApp.set('view engine', 'ejs');
    
        //expressApp.get('/auth/success', (req, res) => res.send(userProfile));
        //expressApp.get('/auth/error', (req, res) => res.send("OAuth: error logging in"));
    
        passport.serializeUser(function(user, cb) {
        cb(null, user);
        });
    
        passport.deserializeUser(function(obj, cb) {
        cb(null, obj);
        });
    
     
        passport.use(new GoogleStrategy({
            clientID: this.config.googleClientId,
            clientSecret: this.config.googleClientSecret,
            callbackURL: this.config.oauthCallbackURL
        },
        function(accessToken, refreshToken, profile, done) {
            userProfile=profile;
            return done(null, userProfile);
        }
        ));


     
        /*expressApp.get('/auth/google', 

        passport.authenticate('google',
         { 
             scope : ['profile', 'email'],
             state: stringifiedState
            
            }  ));

            */

        expressApp.get('/auth/google', function(req:any, res:any) {

        let inputState = {} 
        console.log(req)
        if(req.query){
            console.log('req query', req.query)

            inputState={redirectBackTo: req.query.redirectBackTo}
        }

        console.log('inputState', JSON.stringify(  inputState ))
        let stringifiedState =  base64url(JSON.stringify(  inputState ))
    
        
        passport.authenticate('google', {
            scope:['profile', 'email'],
            state: stringifiedState
        })(req, res);
        });

              


        const userSessionController = this.userSessionController


        expressApp.get('/auth/google/callback', 
        passport.authenticate('google', { failureRedirect: '/error' }),
        async function(req, res)   {
            // Successful authentication 

            const domainRoot = AppHelper.getLocalClientConfig().externalRoutes.web


  
            let parsedState = JSON.parse( base64url.decode(req.query.state ) )
            console.log('callback req',parsedState)

            let redirectBackTo = parsedState.redirectBackTo 

            let sessionResponse = await userSessionController.createUserSession(req)

            const sessionToken = sessionResponse.data.value 


            if(redirectBackTo){
                res.redirect(`${domainRoot}/oauth/success?sessionToken=${sessionToken}&redirectBackTo=${redirectBackTo}`);
            }else {
                res.redirect('${domainRoot}/oauth/success?sessionToken=${sessionToken}');
            }

            
        });
    
        
     }

}

 