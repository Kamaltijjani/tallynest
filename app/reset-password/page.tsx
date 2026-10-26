import AuthForm from '../auth-form';
import {readiness} from '../../lib/auth';
import {getChatGPTUser} from '../chatgpt-auth';
export const dynamic='force-dynamic';
export default async function Page(){return <AuthForm mode="reset-password" ready={readiness()} legacy={!!(await getChatGPTUser())}/>;}
