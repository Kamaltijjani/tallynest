export type AuthReadiness = {core:boolean;email:boolean;google:boolean};
export type AuthMode = 'sign-in'|'sign-up'|'forgot-password'|'reset-password';

// Keep UI availability and server enforcement in agreement. Never create an
// unverified account when we cannot deliver its verification message.
export function accountAvailability(mode:AuthMode,ready:AuthReadiness,token=''){
 if(!ready.core)return {enabled:false,message:'Account access is temporarily unavailable. Please try again later.'};
 if(mode!=='sign-in'&&!ready.email)return {enabled:false,message:mode==='sign-up'
  ?'New account registration is temporarily unavailable because verification emails cannot be delivered. Existing users can still sign in.'
  :'Password reset is temporarily unavailable because reset emails cannot be delivered. Please try again later.'};
 if(mode==='reset-password'&&!token)return {enabled:false,message:'This password reset link is missing or invalid. Request a new link to continue.'};
 return {enabled:true,message:''};
}
export function authRequestBlock(path:string,ready:AuthReadiness){
 if(!ready.core)return {code:'AUTH_UNAVAILABLE',message:'Account access is temporarily unavailable. Please try again later.'};
 if(!ready.email&&['/sign-up/email','/request-password-reset','/send-verification-email'].some(suffix=>path.endsWith(suffix)))return {code:'EMAIL_DELIVERY_UNAVAILABLE',message:path.endsWith('/sign-up/email')
  ?'New account registration is temporarily unavailable because verification emails cannot be delivered. Existing users can still sign in.'
  :'Email delivery is temporarily unavailable. Please try again later.'};
 if(path.endsWith('/sign-in/social')&&!ready.google)return {code:'GOOGLE_UNAVAILABLE',message:'Google sign-in is currently unavailable. Please use email and password.'};
 return null;
}
