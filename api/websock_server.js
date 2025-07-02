// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2025 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import YgEs from './common.js';
import Log from './logger.js';
import HappeningManager from './happening.js';
import Engine from './engine.js';
import AgentManager from './agent.js';
import WebSockLowLevel from './websock_ll.js';

// WebSocket Server --------------------- //
(()=>{ // local namespace 

function _server_new(port,opt={}){

	opt=YgEs.Validate(opt,{Struct:{
		User:{Struct:true,Default:{}},
		Log:{Class:'YgEs.LocalLog'},
		HappenTo:{Class:'YgEs.HappeningManager'},
		Launcher:{Class:'YgEs.Launcher'},
		ConnectionLimit:{Integer:true,Min:-1,Default:-1},
		OnReady:{Callable:true,Default:(agent)=>{}},
		OnClose:{Callable:true,Default:(agent)=>{}},
		OnConnect:{Callable:true,Default:(ctx)=>{return false;}},
		OnDisconnect:{Callable:true,Default:(ctx)=>{}},
		OnReceived:{Callable:true,Default:(ctx,data,isbin)=>{}},
		OnError:{Callable:true,Default:(ctx,err)=>{}},
	}},'opt');

	const log=opt.Log??Log;

	let field={
		Log:log,
		HappenTo:opt.HappenTo??HappeningManager.CreateLocal(),
		Launcher:opt.Launcher??Engine.CreateLauncher(),
		User:opt.User,

		AgentBypasses:['GetPort'],

		OnOpen:(agent)=>{
			log.Info('bgn of WebSock server port '+port);

			let prm={
				ConnectionLimit:opt.ConnectionLimit,

				OnConnect:(cnx,req)=>{
					let ctx=cnx.User.Context=YgEs.SoftClass();
					ctx.Extend('YgEs.WebSockServer.Connection',{
						// private 
					},{
						// public 
						GetAgent:()=>agent,
						IsReady:()=>{
							return cnx.IsReady();
						},
						Close:(code=1000,msg='Shut from the server')=>{
							cnx.Close(code,msg);
						},
						Send:(data)=>{
							cnx.Send(data);
						},
					});
					return opt.OnConnect(ctx,req);
				},
				OnDisconnect:(cnx)=>{
					let ctx=cnx.User.Context;
					opt.OnDisconnect(ctx);
				},
				OnReceived:(cnx,data,isbin)=>{
					let ctx=cnx.User.Context;
					opt.OnReceived(ctx,data,isbin);
				},
				OnError:(err)=>{
					let ctx=cnx.User.Context;
					opt.OnError(ctx,err);
				},
			}
			agent.ll=WebSockLowLevel.CreateServer(port,prm);
		},
		OnReady:(agent)=>{
			log.Info('WebSock server ready port '+port);
			opt.OnReady(agent);
		},
		OnClose:(agent)=>{
			opt.OnClose(agent);

			let done=false;
			agent.ll.Close(()=>{done=true;});
			agent.WaitFor('WebSock server closing',()=>done);
		},
		OnFinish:(agent,clean)=>{
			log.Info('end of WebSock server port '+port);
			agent.ll=null;
		},
	}

	var agent=AgentManager.StandBy(field);
	agent.Extend('YgEs.WebSockServer.Agent',{
		// private 
		ll:null,
	},{
		// public 
		GetPort:()=>port,
	});

	return agent;
}

let WebSockServer=YgEs.WebSockServer={
	Name:'YgEs.WebSockServer.Container',
	User:{},
	_private_:{},

	SetUp:_server_new,
}

})();
export default YgEs.WebSockServer;
