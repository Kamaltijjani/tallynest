import {requireChatGPTUser} from '../chatgpt-auth';import Workspace from '../workspace';
export const dynamic='force-dynamic';
export default async function Page(){const u=await requireChatGPTUser('/legacy');return <Workspace name={u.displayName} accountMode="legacy"/>;}
