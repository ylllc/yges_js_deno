// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2025 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import YgEs from './common.js';
import Log from './logger.js';
import HappeningManager from './happening.js';
import Engine from './engine.js';
import AgentManager from './agent.js';

// WebSocket Client --------------------- //
(()=>{ // local namespace 

function _client_new(url,opt={}){

	url=YgEs.Validate(url,{Literal:true},'url');
	opt=YgEs.Validate(opt,{Others:true,Struct:{
		User:{Struct:true,Default:{}},
		Log:{Class:'YgEs.LocalLog'},
		HappenTo:{Class:'YgEs.HappeningManager'},
		Launcher:{Class:'YgEs.Launcher'},
		AutoReconnectWait:{Numeric:true,Default:0},
		OnConnected:{Callable:true,Default:(agent)=>{}},
		OnDisconnected:{Callable:true,Default:(agent,normal)=>{}},
		OnReceived:{Callable:true,Default:(agent,data)=>{}},
	}},'opt');

	const log=opt.Log??Log;

	let fld={
		Log:log,
		HappenTo:opt.HappenTo??HappeningManager.CreateLocal(),
		Launcher:opt.Launcher??Engine.CreateLauncher(),
		User:opt.User,

		AgentBypasses:['GetURL','Send'],

		OnOpen:(agent)=>{
			log.Info('bgn of WebSock client: '+url);

			let done=false;
			agent_priv.connect(()=>{done=true;});
			agent.WaitFor('WebSock client connecting',()=>done);
		},
		OnReady:(agent)=>{
			opt.OnConnected(agent);
		},
		OnPollInHealthy:(agent)=>{
			if(!agent_priv.internal){
				let hap=fld.HappenTo.Happen('Connection missing');
				if(opt.AutoReconnectWait>0)agent_priv.reconnect(hap,opt.AutoReconnectWait);
				return;
			}
			if(agent_priv.internal.readyState!==WebSocket.OPEN){
				let hap=fld.HappenTo.Happen('Connection trouble');
				if(opt.AutoReconnectWait>0)agent_priv.reconnect(hap,opt.AutoReconnectWait);
				return;
			}
		},
		OnClose:(agent)=>{
			opt.OnDisconnected(agent,true);
			agent_priv.internal.close(1000);
		},
		OnFinish:(agent,clean)=>{
			log.Info('end of WebSock client: '+url);
			agent_priv.internal.onopen=null;
			agent_priv.internal.onclose=null;
			agent_priv.internal.onmessage=null;
			agent_priv.internal.onerror=null;
			agent_priv.internal=null;
		},
	}

	let agent=AgentManager.StandBy(fld);
	let agent_priv=agent.Extend('YgEs.WebSockClient.Agent',{
		// private 
		internal:null,
		connect:(cb_done)=>{
			agent_priv.internal=new WebSocket(url);
			agent_priv.internal.onerror=(err)=>{
				let hap=fld.HappenTo.Happen(err.message,err);
				if(opt.AutoReconnectWait>0)agent_priv.reconnect(hap,opt.AutoReconnectWait);
			}
			agent_priv.internal.onclose=(ev)=>{
				if(ev.wasClean){
					// normal close 
				}
				else{
					fld.HappenTo.Happen('Cut off from the server');
				}
				opt.OnDisconnected(agent,ev.wasClean);
			}
			agent_priv.internal.onopen=(ev)=>{
				if(cb_done)cb_done();
			}
			agent_priv.internal.onmessage=(ev)=>{
				opt.OnReceived(agent,ev.data);
			};
		},
		reconnect:(hap,delay)=>{
			YgEs.Timing.Delay(delay,()=>{
				agent_priv.connect(()=>{hap.Resolve();});
			});
		},
	},{
		// public 
		GetURL:()=>url,
		Send:(data)=>{
			if(!agent.IsReady()){
				log.Fatal('not ready');
				return;
			}
			agent_priv.internal.send(data);
		}
	});

	return agent;
}

let WebSockClient=YgEs.WebSockClient={
	Name:'YgEs.WebSockClient.Container',
	User:{},
	_private_:{},

	SetUp:_client_new,
}

})();
export default YgEs.WebSockClient;
