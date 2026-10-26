import {env} from 'cloudflare:workers';
import {betterAuth} from 'better-auth';
import {drizzleAdapter} from 'better-auth/adapters/drizzle';
import {getDb} from '../db';
import {authOptions} from './auth-options';
export function readiness(){const e=env as any;return {core:!!e.BETTER_AUTH_SECRET&&!!e.BETTER_AUTH_URL,email:!!e.RESEND_API_KEY&&!!e.AUTH_EMAIL_FROM,google:!!e.GOOGLE_CLIENT_ID&&!!e.GOOGLE_CLIENT_SECRET};}
export function getAuth(){const e=env as any;if(!readiness().core)throw Error('Account configuration is incomplete.');return betterAuth({...authOptions({secret:e.BETTER_AUTH_SECRET,url:e.BETTER_AUTH_URL,googleId:e.GOOGLE_CLIENT_ID,googleSecret:e.GOOGLE_CLIENT_SECRET,emailReady:readiness().email,sendEmail:async(to,subject,url)=>{if(!readiness().email)throw Error('Email delivery is not configured.');const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${e.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:e.AUTH_EMAIL_FROM,to:[to],subject,text:`${subject}\n\n${url}\n\nIf you did not request this, you can ignore this email.`})});if(!r.ok)throw Error('Authentication email could not be sent.');}}),database:drizzleAdapter(getDb(),{provider:'sqlite'})});}
export async function getAccount(headers:Headers){if(!readiness().core)return null;const s=await getAuth().api.getSession({headers});return s?.user.emailVerified?s.user:null;}
