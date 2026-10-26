import type {BetterAuthOptions} from 'better-auth';
export type AuthConfig={secret:string;url:string;googleId?:string;googleSecret?:string;emailReady:boolean;sendEmail:(to:string,subject:string,url:string)=>Promise<void>};
export function authOptions(c:AuthConfig):BetterAuthOptions{return {
 appName:'Tallynest',baseURL:c.url,secret:c.secret,
 emailAndPassword:{enabled:true,minPasswordLength:12,maxPasswordLength:128,requireEmailVerification:true,revokeSessionsOnPasswordReset:true,sendResetPassword:async({user,url})=>c.sendEmail(user.email,'Reset your Tallynest password',url)},
 emailVerification:{sendOnSignUp:true,sendOnSignIn:true,autoSignInAfterVerification:true,sendVerificationEmail:async({user,url})=>c.sendEmail(user.email,'Verify your Tallynest email',url)},
 socialProviders:c.googleId&&c.googleSecret?{google:{clientId:c.googleId,clientSecret:c.googleSecret}}:{},
 account:{accountLinking:{enabled:false}},
 session:{expiresIn:60*60*24*7,updateAge:60*60*24},
 rateLimit:{enabled:true,storage:'database',window:60,max:60,customRules:{'/sign-up/email':{window:60,max:3},'/request-password-reset':{window:60,max:3},'/send-verification-email':{window:60,max:3}}},
 advanced:{ipAddress:{ipAddressHeaders:['cf-connecting-ip']}}
};}
