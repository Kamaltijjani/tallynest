import {getAuth,readiness} from '../../../../lib/auth';
import {authRequestBlock} from '../../../../lib/auth-availability';
export const dynamic='force-dynamic';
async function handle(req:Request){
 const blocked=authRequestBlock(new URL(req.url).pathname,readiness());
 if(blocked)return Response.json(blocked,{status:503,headers:{'Cache-Control':'no-store'}});
 return getAuth().handler(req);
}
export const GET=handle;export const POST=handle;
