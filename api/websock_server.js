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

	const limit=opt.ConnectionLimit??-1;

	const _onConnect=opt.OnConnect??((ctx)=>{return false;})
	const _onDisconnect=opt.OnDisconnect??((ctx)=>{})
	const _onReceived=opt.OnReceived??((ctx,data,isbin)=>{})
	const _onError=opt.OnError??((ctx,err)=>{})

	let log=opt.Log??Log;

	let ws={
		Name:'YgEs.WebSockServer.Agent',
		HappenTo:opt.HappenTo??HappeningManager.CreateLocal(),
		Launcher:opt.Launcher??Engine.CreateLauncher(),
		User:opt.User??{},

		_private_:{
			ll:null,
		},

		OnOpen:(wk)=>{
			log.Info('bgn of WebSock server port '+port);

			let prm={
				ConnectionLimit:limit,

				OnConnect:(cnx,req)=>{
					let ctx=cnx.User;
					ctx.Close=(code=1000,msg='Shut from the server')=>{cnx.Close(code,msg);}
					ctx.Send=(data)=>{cnx.Send(data);}
					return _onConnect(ctx,req);
				},
				OnDisconnect:(cnx)=>{
					let ctx=cnx.User;
					_onDisconnect(ctx);
				},
				OnReceived:(cnx,data,isbin)=>{
					let ctx=cnx.User;
					_onReceived(ctx,data,isbin);
				},
				OnError:(err)=>{
					let ctx=cnx.User;
					_onError(ctx,err);
				},
			}
			ws._private_.ll=WebSockLowLevel.CreateServer(port,prm);
		},
		OnReady:(wk)=>{
			log.Info('WebSock server ready port '+port);
		},
		OnClose:(wk)=>{
			let done=false;
			ws._private_.ll.Close(()=>{done=true;});
			wk.WaitFor('WebSock server closing',()=>done);
		},
		OnFinish:(wk,clean)=>{
			log.Info('end of WebSock server port '+port);
			ws._private_.ll=null;
		},
	}

	var server=AgentManager.StandBy(ws);
	server.GetPort=()=>port;
	return server;
}

let WebSockServer=YgEs.WebSockServer={
	name:'YgEs.WebSockServer.Container',
	User:{},

	SetUp:_server_new,
}

})();
export default YgEs.WebSockServer;
