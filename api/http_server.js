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

import http from 'node:http';
import path from 'node:path';
import mime from 'npm:mime-lite';

// HTTP Server for Deno ----------------- //
(()=>{ // local namespace 

function _error_default(res,code,msg){
	res.writeHead(code,{'Content-Type':'text/plain'});
	res.end('['+code+'] '+msg);
}

async function _transfer(res,stat,type=null,cs=null){

	// content type	
	if(!type){
		var ext=path.extname(stat.getPath());
		if(ext)ext=ext.substring(1);
		type=mime.getType(ext);
	}
	if(!type)type='apllication/octet-stream';
	else if(type=='text/html'){
		// charset 
		if(typeof cs=='function')cs=cs(stat.getPath());
		if(cs)type+=';charset='+cs;
	}

	var body=await File.load(stat.getPath());
	res.writeHead(200,{'Content-Type':type,'Content-Length':stat.getSize()});
	res.end(body);
}

async function _dirent(basedir,srcdir,deep,opt){

	let t={
		parent:(basedir!=srcdir),
		dirs:{},
		files:{}
	}

	let g=await File.glob(srcdir,'*');
	for(let f of g){
		let path=srcdir+f;
		let st=await File.stat(path);
		if(opt.filter){
			if(!opt.filter(srcdir,f,st))continue;
		}

		if(st.isFile()){
			let u={size:st.getSize()}
			if(opt.mtime)u.mtime=st.getModifyTime()?.toISOString();
			if(opt.ctime)u.ctime=st.getChangeTime()?.toISOString();
			if(opt.atime)u.atime=st.getAccessTime()?.toISOString();
			if(opt.btime)u.btime=st.getBirthTime()?.toISOString();
			t.files[f]=u;
		}
		else if(st.isDir()){
			if(deep)t.dirs[f]=await _dirent(basedir,srcdir+f+'/',(deep<0)?deep:(deep-1),opt);
			else t.dirs[f]={};
		}
	}
	return t;
}

function _serve_new(dir,opt={}){

	var tt={
		name:'YgEs_HTTPServe',
		User:opt.user??{},
		Dir:dir,
		Charset:(path)=>HTTPServer.DefaultCharset,
		Indices:['index.html','index.htm'],

		walk:(walker)=>{

			var step=walker.Layer[walker.Level];
			if(opt.route && opt.route[step]){
				_route_new(opt.route,{user:tt.User}).walk(walker);
				return;
			}

			// empty subpath requires entering to fix base 
			if(walker.Level>=walker.Layer.length && walker.Layer[walker.Layer.length-1]!=''){
				walker.ParsedURL.path+='/';
				var url=walker.ParsedURL.bake();
				walker.Response.writeHead(301,{Location:url});
				walker.Response.end();
				return;
			}

			var subpath=walker.Layer.slice(walker.Level).join('/');
			var basepath=tt.Dir+'/';
			var srcpath=basepath+subpath;

			Timing.toPromise(async (ok,ng)=>{

				var st=await File.stat(srcpath);

				if(srcpath.substring(srcpath.length-1)!='/'){
					// check file exists 
					if(!st){
						walker.Listener.Error(walker.Response,404,'Not found');
						ok();
						return;
					}

					// add extra / when srcpath is directory 
					if(st.isDir()){
						walker.ParsedURL.path+='/';
						var url=walker.ParsedURL.bake();
						walker.Response.writeHead(301,{Location:url});
						walker.Response.end();
						ok();
						return;
					}
				}

				if(srcpath.substring(srcpath.length-1)=='/'){
					if(opt.dirent){
						// get dirents 
						var g=await _dirent(basepath,srcpath,opt.deepent,{
							filter:opt.filter??null,
							mtime:opt.mtime??false,
							ctime:opt.ctime??false,
							atime:opt.atime??false,
							btime:opt.btime??false,
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
							var st2=await File.stat(srcpath+n);
							if(!st2)continue;
							if(!st2.isFile())continue;
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
		name:'YgEs_HTTPPresent',
		User:opt.user??{},
		Meth:meth,

		walk:(walker)=>{
			var m=walker.Request.method;
			if(!pt.Meth[m]){
				walker.Listener.Error(walker.Response,405,'Not allowed');
				return;
			}
			pt.Meth[m](walker);
		},
	}
	return pt;
}

function _route_new(map,opt={}){

	var rt={
		name:'YgEs_HTTPRoute',
		User:opt.user??{},
		Map:map,

		walk:(walker)=>{
			var n=walker.Layer[walker.Level];
			if(!rt.Map[n]){
				walker.Listener.Error(walker.Response,404,'Not found');
				return;
			}
			++walker.Level;
			rt.Map[n].walk(walker);
		},
	}
	return rt;
}

function _request(listener,req,res){

	try{
		var walker={
			name:'YgEs_HTTPWalker',
			User:{},
			Listener:listener,
			Request:req,
			Response:res,
			ParsedURL:URLBuilder.parse(req.url),
		}
		walker.Layer=walker.ParsedURL.extractPath();
		walker.Level=1;

		listener.Route.walk(walker);
	}
	catch(e){
		listener.getHappeningManager().happenError(e);
		listener.Error(res,500,'Internal Server Error');
	}
}

function _listener_new(port,route,opt={}){

	var log=opt.logger??Log;

	var _working=true;
	var _internal=http.createServer((req,res)=>_request(listener,req,res));

	var ws={
		name:'YgEs_HTTPServer',
		happen:opt.happen??HappeningManager.createLocal(),
		launcher:opt.launcher??Engine.createLauncher(),
		user:opt.user??{},

		cb_open:(wk)=>{
			log.info('bgn of server port '+port);
			_internal.listen(port);
		},
		cb_close:(wk)=>{
			var done=false;
			_internal.close(()=>{
				done=true;
			});
			wk.waitFor(()=>done);
		},
		cb_finish:(wk,clean)=>{
			log.info('end of server port '+port);
		},
	}

	var listener=AgentManager.standby(ws);
	listener.getPort=()=>port;
	listener.Route=route;
	listener.Error=_error_default;
	return listener;
}

let HTTPServer=YgEs.HTTPServer={
	name:'YgEs_HTTPServer',
	User:{},
	DefaultCharset:'utf-8',

	setup:_listener_new,

	serve:_serve_new,
	present:_present_new,
	route:_route_new,
}

})();
export default YgEs.HTTPServer;
