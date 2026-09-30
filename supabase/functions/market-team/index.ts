import { createClient } from 'npm:@supabase/supabase-js@2.117.1'
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,x-client-info,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS'}
Deno.serve(async(req:Request)=>{
 const response=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json'}})
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors})
 if(req.method!=='POST')return response({error:'Method not allowed'},405)
 try{
  const auth=req.headers.get('Authorization')||''
  if(!auth.startsWith('Bearer '))return response({error:'Sign in required'},401)
  const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{autoRefreshToken:false,persistSession:false}})
  const {data:{user},error:authError}=await admin.auth.getUser(auth.slice(7))
  if(authError||!user)return response({error:'Invalid session'},401)
  const {data:actor,error:profileError}=await admin.from('profiles').select('role,is_active').eq('id',user.id).single()
  if(profileError||!actor?.is_active||actor.role!=='super_admin')return response({error:'Superadmin permission required'},403)
  const raw=await req.text();if(raw.length>12000)return response({error:'Request too large'},413)
  const input=JSON.parse(raw)
  if(typeof input.email!=='string'||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)||typeof input.password!=='string'||input.password.length<12||input.password.length>128||!['super_admin','manager','staff','accounting'].includes(input.role)||typeof input.full_name!=='string'||input.full_name.trim().length<2||input.full_name.length>160)return response({error:'Check name, email, role and password (12+ characters)'},400)
  const {data:created,error:createError}=await admin.auth.admin.createUser({email:input.email.trim().toLowerCase(),password:input.password,email_confirm:true})
  if(createError)return response({error:createError.message},400)
  const id=created.user.id
  const {data:profile,error:saveError}=await admin.from('profiles').update({role:input.role,full_name:input.full_name.trim(),full_name_ar:typeof input.full_name_ar==='string'?input.full_name_ar.slice(0,160):'',is_active:true}).eq('id',id).select().single()
  if(saveError){await admin.auth.admin.deleteUser(id);return response({error:'Could not save the employee profile'},500)}
  await admin.from('audit_log').insert({user_id:user.id,action:'create_employee',resource:'profiles',resource_id:id,diff:{role:input.role}})
  return response(profile,201)
 }catch{return response({error:'Unable to process the request'},400)}
})
