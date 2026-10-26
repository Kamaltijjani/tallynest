import test from 'node:test';import assert from 'node:assert/strict';import {betterAuth} from 'better-auth';import {memoryAdapter} from 'better-auth/adapters/memory';import {authOptions} from '../lib/auth-options.ts';
test('signup, verification, session, logout and reset',async()=>{
 const sent=[];const database={user:[],session:[],account:[],verification:[],rateLimit:[]};
 const auth=betterAuth({...authOptions({secret:'test-only-secret-with-at-least-thirty-two-characters',url:'http://localhost:3000',emailReady:true,sendEmail:async(to,subject,url)=>sent.push({to,subject,url})}),database:memoryAdapter(database),rateLimit:{enabled:false}});
 async function call(path,body,cookie){const r=await auth.handler(new Request('http://localhost:3000/api/auth/'+path,{method:body?'POST':'GET',headers:{origin:'http://localhost:3000','content-type':'application/json',...(cookie?{cookie}:{})},...(body?{body:JSON.stringify(body)}:{})}));return {r,data:await r.clone().json().catch(()=>null),cookie:r.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ')};}
 const credentials={name:'Test Owner',email:'owner@example.test',password:'Strong-test-passphrase-42'};
 const signup=await call('sign-up/email',credentials);assert.equal(signup.r.status,200);assert.equal(database.user.length,1);assert.equal(database.user[0].emailVerified,false);assert.equal(sent.length,1);assert.notEqual(database.account[0].password,credentials.password);
 const unverified=await call('sign-in/email',credentials);assert.equal(unverified.r.status,403);
 const verified=await auth.handler(new Request(sent[0].url));assert.ok([200,302].includes(verified.status));assert.equal(database.user[0].emailVerified,true);
 const login=await call('sign-in/email',credentials);assert.equal(login.r.status,200);assert.ok(login.cookie.includes('session_token'));
 const session=await call('get-session',null,login.cookie);assert.equal(session.data.user.name,'Test Owner');
 const wrong=await call('sign-in/email',{...credentials,password:'wrong-password'});assert.equal(wrong.r.status,401);
 const reset=await call('request-password-reset',{email:credentials.email,redirectTo:'/reset-password'});assert.equal(reset.r.status,200);const resetURL=new URL(sent.at(-1).url);const token=resetURL.pathname.split('/').at(-1);
 const changed=await call('reset-password',{token,newPassword:'Replacement-password-43'});assert.equal(changed.r.status,200);
 const revoked=await call('get-session',null,login.cookie);assert.equal(revoked.data,null);
 const second=await call('reset-password',{token,newPassword:'Another-password-44'});assert.ok(second.r.status>=400);
 const relogin=await call('sign-in/email',{...credentials,password:'Replacement-password-43'});assert.equal(relogin.r.status,200);
 const logout=await call('sign-out',{},relogin.cookie);assert.equal(logout.r.status,200);assert.equal((await call('get-session',null,relogin.cookie)).data,null);
});
