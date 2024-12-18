// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// HTTP Server for Deno //

import log_global from './logger.js';
import hap_global from './happening.js';
import engine from './engine.js';
import workmng from './worker.js';
import timing from './timing.js';
import urlb from './urlbuild.js';
import file from './file.js';

import http from 'node:http';
import path from 'node:path';
import mime from 'npm:mime-lite';

function _error_default(res,code,msg){
	res.writeHead(code,{'Content-Type':'text/plain'});
	res.end('['+code+'] '+msg);
}

function _route_new(map,opt={}){

	var rt={
		name:'YgEs_HTTPRoute',
		User:opt.user??{},
		Map:map,

		walk:(wlk)=>{
			var n=wlk.layer[wlk.level];
			if(!rt.Map[n]){
				wlk.ctl.Error(wlk.res,404,'Not found');
				return;
			}
			++wlk.level;
			rt.Map[n].walk(wlk);
		},
	}
	return rt;
}

function _present_new(meth,opt={}){

	var pt={
		name:'YgEs_HTTPPresent',
		User:opt.user??{},
		Meth:meth,

		walk:(wlk)=>{
			var m=wlk.req.method;
			if(!pt.Meth[m]){
				wlk.ctl.Error(res,405,'Not allowed');
				return;
			}
			pt.Meth[m](wlk);
		},
	}
	return pt;
}

function _transfer_new(dir,opt={}){

	var tt={
		name:'YgEs_HTTPTransfer',
		User:opt.user??{},
		Dir:dir,
		Charset:(path)=>mif.DefaultCharset,
		Indices:['index.html','index.htm'],

		walk:(wlk)=>{

			// empty subpath requires entering to fix base 
			if(wlk.level>=wlk.layer.length && wlk.layer[wlk.layer.length-1]!=''){
				wlk.parsed.path+='/';
				var url=wlk.parsed.bake();
				wlk.res.writeHead(301,{Location:url});
				wlk.res.end();
				return;
			}

			var subpath=wlk.layer.slice(wlk.level).join('/');
			var srcpath=tt.Dir+'/'+subpath;

			if(opt.route && opt.route[subpath]){
				_route_new(opt.route,{user:tt.User}).walk(wlk);
				return;
			}

			timing.toPromise(async (ok,ng)=>{

				var st=await file.stat(srcpath);

				if(srcpath.substring(srcpath.length-1)!='/'){
					// check file exists 
					if(!st){
						wlk.ctl.Error(wlk.res,404,'Not found');
						ok();
						return;
					}

					// add extra / when srcpath is directory 
					if(st.isDir()){
						wlk.parsed.path+='/';
						var url=wlk.parsed.bake();
						wlk.res.writeHead(301,{Location:url});
						wlk.res.end();
						ok();
						return;
					}
				}

				if(srcpath.substring(srcpath.length-1)=='/'){
					// try finding an index file 
					var f=false;
					for(var n of tt.Indices){
						var st2=await file.stat(srcpath+n);
						if(!st2)continue;
						if(!st2.isFile())continue;
						f=true;
						srcpath+=n;
						st=st2;
						break;
					}
					if(!f){
						wlk.ctl.Error(wlk.res,404,'Not found');
						ok();
						return;
					}
				}

				// content type	
				var ext=path.extname(srcpath);
				if(ext)ext=ext.substring(1);
				var type=mime.getType(ext);
				if(!type)type='apllication/octet-stream';
				else if(type=='text/html'){
					// charset 
					var cs=tt.Charset;
					if(typeof cs=='function')cs=cs(srcpath);
					if(cs)type+=';charset='+cs;
				}

				var body=await file.load(srcpath);
				wlk.res.writeHead(200,{'Content-Type':type,'Content-Length':st.getSize()});
				wlk.res.end(body);
			},(res)=>{
				return res;
			},(err)=>{
				wlk.ctl.Error(wlk.res,500,err.message);
			});
		},
	}
	return tt;
}

function _walk(wlk){

	var m=req.method;
	if(wlk.route[n][m]){
		var q=wlk.route[n][m](wlk);
		if(q){
			++wlk.level;
			_walk(srv,req,res,q.route,purl,q.level);
		}
	}
}

function _request(ctl,req,res){

	try{
		var wlk={
			name:'YgEs_HTTPWalker',
			User:{},
			ctl:ctl,
			req:req,
			res:res,
			parsed:urlb.parse(req.url),
		}
		wlk.layer=wlk.parsed.extractPath();
		wlk.level=1;

		ctl.Route.walk(wlk);
	}
	catch(e){
		ctl.getHappeningManager().happenError(e);
		ctl.Error(res,500,'Internal Server Error');
	}
}

function _server_new(port,route,opt){

	var log=opt.logger??log_global;

	var _working=true;
	var _internal=http.createServer((req,res)=>_request(ctl,req,res));

	var ws={
		name:'YgEs_HTTPServer',
		happen:opt.happen??hap_global.createLocal(),
		launcher:opt.launcher??engine.createLauncher(),
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

	var ctl=workmng.standby(ws);
	ctl.getPort=()=>port;
	ctl.Route=route;
	ctl.Error=_error_default;
	return ctl;
}

var mif={
	name:'YgEs_HTTPServer',
	User:{},
	DefaultCharset:'utf-8',

	setup:(port,route,opt={})=>{
		return _server_new(port,route,opt);
	},

	route:_route_new,
	present:_present_new,
	transfer:_transfer_new,
}

export default mif;
