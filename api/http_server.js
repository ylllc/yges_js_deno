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

function _serve_new(dir,opt={}){

	var tt={
		Name:'YgEs.HTTPServe',
		User:opt.User??{},
		Dir:dir,
		Charset:(path)=>HTTPServer.DefaultCharset,
		Indices:opt.Indices??['index.html','index.htm'],

		Walk:(walker)=>{

			var step=walker.Layer[walker.Level];
			if(opt.Route && opt.Route[step]){
				_route_new(opt.Route,{User:tt.User}).Walk(walker);
				return;
			}

			// empty subpath requires entering to fix base 
			if(walker.Level>=walker.Layer.length && walker.Layer[walker.Layer.length-1]!=''){
				walker.ParsedURL.Path+='/';
				var url=walker.ParsedURL.Bake();
				walker.Response.writeHead(301,{Location:url});
				walker.Response.end();
				return;
			}

			var subpath=walker.Layer.slice(walker.Level).join('/');
			var basepath=tt.Dir+'/';
			var srcpath=basepath+subpath;

			Timing.ToPromise(async (ok,ng)=>{

				var st=await File.Stat(srcpath);

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
						var url=walker.ParsedURL.Bake();
						walker.Response.writeHead(301,{Location:url});
						walker.Response.end();
						ok();
						return;
					}
				}

				if(srcpath.substring(srcpath.length-1)=='/'){
					if(opt.DirEnt){
						// get dirents 
						var g=await _dirent(basepath,srcpath,opt.DeepEnt,{
							Filter:opt.Filter??null,
							MTime:opt.MTime??false,
							CTime:opt.CTime??false,
							ATime:opt.ATime??false,
							BTime:opt.BTime??false,
						});
						var s=JSON.stringify(g);
						walker.Response.writeHead(200,{'Content-Type':'application/json','Content-Length':s.length});
						walker.Response.end(s);
						ok();
						return;
					}
					else{
						// try finding an index file 
						var f=false;
						for(var n of tt.Indices){
							var st2=await File.Stat(srcpath+n);
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

				await _transfer(walker.Response,st,null,tt.Charset);
				ok();
			},(res)=>{
				return res;
			},(err)=>{
				walker.Listener.Error(walker.Response,500,err.message);
			});
		},
	}
	return tt;
}

function _present_new(meth,opt={}){

	var pt={
		Name:'YgEs.HTTPPresent',
		User:opt.User??{},
		Methods:meth,

		Walk:(walker)=>{
			var m=walker.Request.method;
			if(!pt.Methods[m]){
				walker.Listener.Error(walker.Response,405,'Not allowed');
				return;
			}
			pt.Methods[m](walker);
		},
	}
	return pt;
}

function _route_new(map,opt={}){

	var rt={
		Name:'YgEs.HTTPRoute',
		User:opt.User??{},
		Map:map,

		Walk:(walker)=>{
			var n=walker.Layer[walker.Level];
			if(!rt.Map[n]){
				walker.Listener.Error(walker.Response,404,'Not found');
				return;
			}
			++walker.Level;
			rt.Map[n].Walk(walker);
		},
	}
	return rt;
}

function _request(listener,req,res){

	try{
		var walker={
			Name:'YgEs.HTTPWalker',
			User:{},
			Listener:listener,
			Request:req,
			Response:res,
			ParsedURL:URLBuilder.Parse(req.url),
		}
		walker.Layer=walker.ParsedURL.ExtractPath();
		walker.Level=1;

		listener.Route.Walk(walker);
	}
	catch(e){
		listener.GetHappeningManager().HappenError(e);
		listener.Error(res,500,'Internal Server Error');
	}
}

function _listener_new(port,route,opt={}){

	var log=opt.Log??Log;

	var _working=true;
	var _internal=HTTPLowLevel.SetUp((req,res)=>_request(listener,req,res));

	var ws={
		Name:'YgEs.HTTPListener',
		HappenTo:opt.HappenTo??HappeningManager.CreateLocal(),
		Launcher:opt.Launcher??Engine.CreateLauncher(),
		User:opt.User??{},

		OnOpen:(wk)=>{
			log.Info('bgn of server port '+port);
			_internal.listen(port);
		},
		OnClose:(wk)=>{
			var done=false;
			_internal.close(()=>{
				done=true;
			});
			wk.WaitFor(()=>done);
		},
		OnFinish:(wk,clean)=>{
			log.Info('end of server port '+port);
		},
	}

	var listener=AgentManager.StandBy(ws);
	listener.GetPort=()=>port;
	listener.Route=route;
	listener.Error=_error_default;
	return listener;
}

let HTTPServer=YgEs.HTTPServer={
	name:'YgEs.HTTPServer',
	User:{},
	DefaultCharset:'utf-8',

	SetUp:_listener_new,

	Serve:_serve_new,
	Present:_present_new,
	Route:_route_new,
}

})();
export default YgEs.HTTPServer;
