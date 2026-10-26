import test from 'node:test';
import assert from 'node:assert/strict';
import {accountAvailability,authRequestBlock} from '../lib/auth-availability.ts';
const coreOnly={core:true,email:false,google:false};
test('current production configuration explains disabled signup without blocking email sign-in',()=>{
 assert.equal(accountAvailability('sign-in',coreOnly).enabled,true);
 const signup=accountAvailability('sign-up',coreOnly);
 assert.equal(signup.enabled,false);assert.match(signup.message,/verification emails cannot be delivered/);
 assert.equal(authRequestBlock('/api/auth/sign-in/email',coreOnly),null);
 assert.equal(authRequestBlock('/api/auth/sign-up/email',coreOnly).code,'EMAIL_DELIVERY_UNAVAILABLE');
});
test('verification and reset delivery cannot be bypassed when unavailable',()=>{
 for(const path of ['sign-up/email','request-password-reset','send-verification-email'])assert.ok(authRequestBlock('/api/auth/'+path,coreOnly));
 for(const mode of ['sign-up','forgot-password','reset-password'])assert.equal(accountAvailability(mode,coreOnly,'token').enabled,false);
 assert.equal(authRequestBlock('/api/auth/sign-in/social',coreOnly).code,'GOOGLE_UNAVAILABLE');
});
test('configured email signup works independently of Google; reset needs a token',()=>{
 const ready={...coreOnly,email:true};
 assert.equal(accountAvailability('sign-up',ready).enabled,true);
 assert.equal(authRequestBlock('/api/auth/sign-up/email',ready),null);
 assert.equal(accountAvailability('forgot-password',ready).enabled,true);
 assert.equal(accountAvailability('reset-password',ready).enabled,false);
 assert.equal(accountAvailability('reset-password',ready,'valid-token').enabled,true);
});
test('missing auth secrets disable all account entry points',()=>{
 const ready={core:false,email:true,google:true};
 for(const mode of ['sign-in','sign-up','forgot-password','reset-password'])assert.equal(accountAvailability(mode,ready,'token').enabled,false);
 assert.equal(authRequestBlock('/api/auth/sign-in/email',ready).code,'AUTH_UNAVAILABLE');
});
