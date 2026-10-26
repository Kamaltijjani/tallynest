import {getAccount} from '../../../lib/auth';
async function ownerFor(req:Request){if(new URL(req.url).searchParams.get('legacy')==='1')return req.headers.get('oai-authenticated-user-id');const u=await getAccount(req.headers);return u?'account:'+u.id:null;}
import {env} from "cloudflare:workers";
import {calculate} from "../../../lib/books.js";
export const dynamic="force-dynamic";
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
export async function GET(req:Request){
 const owner=await ownerFor(req); if(!owner)return reply({error:"Sign in to open your books."},401);
 const r=await env.DB.prepare("SELECT id,name,data,revision,updated FROM businesses WHERE owner=? ORDER BY updated DESC").bind(owner).all();
 return reply({businesses:r.results.map((r:any)=>({...r,data:JSON.parse(r.data)}))});
}
export async function POST(req:Request){
 const owner=await ownerFor(req);if(!owner)return reply({error:"Sign in to save your books."},401);
 if(req.headers.get("origin")!==new URL(req.url).origin)return reply({error:"Invalid request origin."},403);
 if(!req.headers.get("content-type")?.includes("application/json"))return reply({error:"JSON required."},415);
 try{
 const raw=await req.text();if(raw.length>2000000)return reply({error:"This backup is too large."},413);
 const body=JSON.parse(raw);const now=new Date().toISOString();
 if(body.action==="create"){
 const count:any=await env.DB.prepare("SELECT COUNT(*) AS n FROM businesses WHERE owner=?").bind(owner).first();if(count.n>=50)throw Error("You can manage up to 50 businesses.");
 const data=body.data;calculate(data);if(!data.name.trim())throw Error("Enter a business name.");
 const id=crypto.randomUUID();await env.DB.prepare("INSERT INTO businesses (id,owner,name,data,revision,updated) VALUES (?,?,?,?,1,?)").bind(id,owner,data.name,JSON.stringify(data),now).run();
 return reply({business:{id,name:data.name,data,revision:1,updated:now}});
 }
 const row:any=await env.DB.prepare("SELECT * FROM businesses WHERE id=? AND owner=?").bind(body.id,owner).first();if(!row)return reply({error:"Business not found."},404);
 if(row.revision!==body.revision)return reply({error:"These books changed in another window. Refresh before saving again."},409);
 const data=JSON.parse(row.data);
 if(body.action==="item")data.items.push(body.item);
 else if(body.action==="event")data.events.push(body.event);
 else if(body.action==="void") {const last=[...data.events].reverse().find(e=>!e.void);if(!last||last.id!==body.eventId)throw Error("Only the latest active entry can be reversed.");last.void=true;}
 else throw Error("Unknown action.");
 calculate(data);
 const result=await env.DB.prepare("UPDATE businesses SET data=?,revision=revision+1,updated=? WHERE id=? AND owner=? AND revision=?").bind(JSON.stringify(data),now,body.id,owner,body.revision).run();
 if(!result.meta.changes)return reply({error:"Another save arrived first. Refresh and try again."},409);
 return reply({business:{id:row.id,name:row.name,data,revision:row.revision+1,updated:now}});
 }catch(e){return reply({error:e instanceof Error?e.message:"Unable to save."},400);}
}
