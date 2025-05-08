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

	const autoreconnect=opt.AutoReconnectWait??0;

	const _onConnected=opt.OnConnected??(()=>{})
	const _onDisconnected=opt.OnDisconnected??((normal)=>{})
	const _onReceived=opt.OnReceived??((data)=>{})

	let log=opt.Log??Log;
	let _internal=null;
	let _reconnector=null;

	const connect=(cb_done)=>{
		_internal=new WebSocket(url);
		_internal.onerror=(err)=>{
			let hap=ws.HappenTo.Happen(err.message,err);
			if(autoreconnect>0)reconnect(hap,autoreconnect);
		}
		_internal.onclose=(ev)=>{
			if(ev.wasClean){
				// normal close 
			}
			else{
				ws.HappenTo.Happen('Cut off from the server');
			}
			_onDisconnected(ev.wasClean);
		}
		_internal.onopen=(ev)=>{
			if(cb_done)cb_done();
		}
		_internal.onmessage=(ev)=>{
			_onReceived(ev.data);
		};
	}
	const reconnect=(hap,delay)=>{
		YgEs.Timing.Delay(delay,()=>{connect(()=>{hap.Resolve();});});
	}

	let ws={
		Name:'YgEs.WebSockClient.Agent',
		User:opt.User??{},
		_private_:{},

		HappenTo:opt.HappenTo??HappeningManager.CreateLocal(),
		Launcher:opt.Launcher??Engine.CreateLauncher(),

		AgentBypasses:['GetURL','Send'],

		OnOpen:(wk)=>{
			log.Info('bgn of WebSock client: '+url);

			let done=false;
			connect(()=>{done=true;});
			wk.WaitFor('WebSock client connecting',()=>done);
		},
		OnReady:(wk)=>{
			_onConnected();
		},
		OnPollInHealthy:(wk)=>{
			if(!_internal){
				let hap=ws.HappenTo.Happen('Connection missing');
				if(autoreconnect>0)reconnect(hap,autoreconnect);
				return;
			}
			if(_internal.readyState!==WebSocket.OPEN){
				let hap=ws.HappenTo.Happen('Connection trouble');
				if(autoreconnect>0)reconnect(hap,autoreconnect);
				return;
			}
		},
		OnClose:(wk)=>{
			_onDisconnected(true);
			_internal.close(1000);
		},
		OnFinish:(wk,clean)=>{
			log.Info('end of WebSock client: '+url);
			_internal.onopen=null;
			_internal.onclose=null;
			_internal.onmessage=null;
			_internal.onerror=null;
			_internal=null;
		},
	}

	var client=AgentManager.StandBy(ws);
	client.GetURL=()=>url;
	client.Send=(data)=>{
		if(!client.IsReady()){
			log.Fatal('not ready');
			return;
		}
		_internal.send(data);
	}
	return client;
}

let WebSockClient=YgEs.WebSockClient={
	Name:'YgEs.WebSockClient.Container',
	User:{},
	_private_:{},

	SetUp:_client_new,
}

})();
export default YgEs.WebSockClient;
