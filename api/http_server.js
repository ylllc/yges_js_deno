// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import YgEs from './common.js';
import Log from './logger.js';
import HappeningManager from './happening.js';
import Engine from './engine.js';
import AgentManager from './agent.js';
import Timing from './timing.js';
import URLBuilder from './urlbuilder.js';
import File from './file.js';
import HTTPLowLevel from './http_ll.js';

// HTTP Server -------------------------- //
(()=>{ // local namespace 

function _error_default(res,code,msg){
	res.writeHead(code,{'Content-Type':'text/plain'});
	res.end('['+code+'] '+msg);
}

async function _transfer(res,stat,type=null,cs=null){

	// content type	
	if(!type)type=HTTPLowLevel.GetMIMEType(stat);
	if(!type)type='apllication/octet-stream';
	else if(type=='text/html'){
		// charset 
		if(typeof cs=='function')cs=cs(stat.GetPath());
		if(cs)type+=';charset='+cs;
	}

	var body=await File.Load(stat.GetPath());
	res.writeHead(200,{'Content-Type':type,'Content-Length':stat.GetSize()});
	res.end(body);
}

async function _dirent(basedir,srcdir,deep,opt){

	let t={
		Parent:(basedir!=srcdir),
		Dirs:{},
		Files:{}
	}

	let g=await File.Glob(srcdir,'*');
	for(let f of g){
		let path=srcdir+f;
		let st=await File.Stat(path);
		if(opt.Filter){
			if(!opt.Filter(srcdir,f,st))continue;
		}

		if(st.IsFile()){
			let u={Size:st.GetSize()}
			if(opt.MTime)u.MTime=st.GetModifyTime()?.toISOString();
			if(opt.CTime)u.CTime=st.GetChangeTime()?.toISOString();
			if(opt.ATime)u.ATime=st.GetAccessTime()?.toISOString();
			if(opt.BTime)u.BTime=st.GetBirthTime()?.toISOString();
			t.Files[f]=u;
		}
		else if(st.IsDir()){
			if(deep)t.Dirs[f]=await _dirent(basedir,srcdir+f+'/',(deep<0)?deep:(deep-1),opt);
			else t.Dirs[f]={};
		}
	}
	return t;
}

function _world_new(){

	let wt=YgEs.SoftClass();
	wt.Extend('YgEs.HTTPServer.World',{
		// private 
	},{
		// public 
		Walk:(walker)=>{
			// empty response 
			walker.Response.writeHead(204,{'Content-Type':'text/plain'});
			walker.Response.end();
		},
	});
	return wt;
}

function _serve_new(dir,opt={}){

	opt=YgEs.Validate(opt,{Struct:{
		User:{Struct:true,Default:{}},
		Indices:{List:{Literal:true},Default:['index.html','index.htm']},
		Route:{Dict:{Class:'YgEs.HTTPServer.World'}},
		DirEnt:{Boolable:true},
		DeepEnt:{Integer:true},
		Filter:{Callable:true},
		MTime:{Boolable:true},
		CTime:{Boolable:true},
		ATime:{Boolable:true},
		BTime:{Boolable:true},
	}},'opt');

	let world=_world_new();
	world.Extend('YgEs.HTTPServer.Serve',{
		// private 
	},{
		// public 
		User:opt.User,
		Dir:dir,
		Charset:(path)=>HTTPServer.DefaultCharset,
		Indices:opt.Indices,

		Walk:(walker)=>{

			let step=walker.Layer[walker.Level];
			if(opt.Route[step]){
				_route_new(opt.Route,{User:world.User}).Walk(walker);
				return;
			}

			// empty subpath requires entering to fix base 
			if(walker.Level>=walker.Layer.length && walker.Layer[walker.Layer.length-1]!=''){
				walker.ParsedURL.Path+='/';
				let url=walker.ParsedURL.Bake();
				walker.Response.writeHead(301,{Location:url});
				walker.Response.end();
				return;
			}

			let subpath=walker.Layer.slice(walker.Level).join('/');
			let basepath=world.Dir+'/';
			let srcpath=basepath+subpath;

			Timing.ToPromise(async (ok,ng)=>{

				let st=await File.Stat(srcpath);

				if(srcpath.substring(srcpath.length-1)!='/'){
					// check file exists 
					if(!st){
						walker.Listener.Error(walker.Response,404,'Not found');
						ok();
						return;
					}

					// add extra / when srcpath is directory 
					if(st.IsDir()){
						walker.ParsedURL.Path+='/';
						let url=walker.ParsedURL.Bake();
						walker.Response.writeHead(301,{Location:url});
						walker.Response.end();
						ok();
						return;
					}
				}

				if(srcpath.substring(srcpath.length-1)=='/'){
					if(opt.DirEnt){
						// get dirents 
						let g=await _dirent(basepath,srcpath,opt.DeepEnt,{
							Filter:opt.Filter??undefined,
							MTime:opt.MTime??false,
							CTime:opt.CTime??false,
							ATime:opt.ATime??false,
							BTime:opt.BTime??false,
						});
						let s=JSON.stringify(g);
						walker.Response.writeHead(200,{'Content-Type':'application/json','Content-Length':s.length});
						walker.Response.end(s);
						ok();
						return;
					}
					else{
						// try finding an index file 
						let f=false;
						for(let n of world.Indices){
							let st2=await File.Stat(srcpath+n);
							if(!st2)continue;
							if(!st2.IsFile())continue;
							f=true;
							srcpath+=n;
							st=st2;
							break;
						}
						if(!f){
							walker.Listener.Error(walker.Response,403,'Forbidden');
							ok();
							return;
						}
					}
				}

				await _transfer(walker.Response,st,null,world.Charset);
				ok();
			},(res)=>{
				return res;
			},(err)=>{
				walker.Listener.Error(walker.Response,500,err.message);
			});
		},
	});

	return world;
}

function _present_new(meth,opt={}){

	opt=YgEs.Validate(opt,{Struct:{
		User:{Struct:true,Default:{}},
	}},'opt');

	let world=_world_new();
	world.Extend('YgEs.HTTPServer.Present',{
		// private 
	},{
		// public 
		User:opt.User,
		Methods:meth,

		Walk:(walker)=>{
			let m=walker.Request.method;
			if(!world.Methods[m]){
				walker.Listener.Error(walker.Response,405,'Not allowed');
				return;
			}
			world.Methods[m](walker);
		},
	});

	return world;
}

function _route_new(map,opt={}){

	opt=YgEs.Validate(opt,{Struct:{
		User:{Struct:true,Default:{}},
	}},'opt');

	let world=_world_new();
	world.Extend('YgEs.HTTPServer.Route',{
		// private 
	},{
		// public 
		User:opt.User,
		Map:map,

		Walk:(walker)=>{
			let n=walker.Layer[walker.Level];
			if(!world.Map[n]){
				walker.Listener.Error(walker.Response,404,'Not found');
				return;
			}
			++walker.Level;
			world.Map[n].Walk(walker);
		},
	});

	return world;
}

function _request(listener,req,res){

	try{
		let walker=YgEs.SoftClass();
		walker.Extend('YgEs.HTTPServer.Walker',{
			// private 
		},{
			// public 
			Listener:listener,
			Request:req,
			Response:res,
			ParsedURL:URLBuilder.Parse(req.url),
		});
		walker.Layer=walker.ParsedURL.ExtractPath();
		walker.Level=1;

		listener.Route.Walk(walker);
	}
	catch(e){
		listener.GetHappeningManager().Happen(e);
		listener.Error(res,500,'Internal Server Error');
	}
}

function _listener_new(port,route,opt={}){

	opt=YgEs.Validate(opt,{Struct:{
		User:{Struct:true,Default:{}},
		Log:{Class:'YgEs.LocalLog',Default:Log},
		HappenTo:{Class:'YgEs.HappeningManager',Default:HappeningManager},
		Launcher:{Class:'YgEs.Launcher',Default:Engine},
	}},'opt');

	let log=opt.Log??Log;

	let field={
		HappenTo:opt.HappenTo??HappeningManager.CreateLocal(),
		Launcher:opt.Launcher??Engine.CreateLauncher(),
		User:opt.User,

		AgentBypasses:['GetPort'],

		OnOpen:(wk)=>{
			log.Info('bgn of server port '+port);
			priv.internal.listen(port);
		},
		OnClose:(wk)=>{
			let done=false;
			priv.internal.close(()=>{
				done=true;
			});
			wk.WaitFor('HTTP listener closed',()=>done);
		},
		OnFinish:(wk,clean)=>{
			log.Info('end of server port '+port);
		},
	}

	let agent=AgentManager.StandBy(field);
	let priv=agent.Extend('YgEs.HTTPServer.Listener',{
		// private 
		internal:HTTPLowLevel.SetUp((req,res)=>_request(agent,req,res)),
	},{
		// public 
		Route:route,
		Error:_error_default,
		GetPort:()=>port,
	});

	return agent;
}

let HTTPServer=YgEs.HTTPServer={
	Name:'YgEs.HTTPServer.Container',
	User:{},
	_private_:{},

	DefaultCharset:'utf-8',

	SetUp:_listener_new,

	Empty:_world_new,
	Serve:_serve_new,
	Present:_present_new,
	Route:_route_new,
}

})();
export default YgEs.HTTPServer;
