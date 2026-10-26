import {headers} from 'next/headers';
import {getAccount,readiness} from '../lib/auth';
import {getChatGPTUser} from './chatgpt-auth';
import AuthForm from './auth-form';
import Workspace from './workspace';
export const dynamic='force-dynamic';
export default async function Page(){const user=await getAccount(await headers());return user?<Workspace name={user.name} accountMode="native"/>:<AuthForm mode="sign-in" ready={readiness()} legacy={!!(await getChatGPTUser())}/>;}
