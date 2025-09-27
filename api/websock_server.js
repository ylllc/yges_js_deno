// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2025 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import YgEs from './common.js';
import Log from './logger.js';
import HappeningManager from './happening.js';
import Engine from './engine.js';
import AgentManager from './agent.js';
import Network from './network.js';
import WebSockLowLevel from './websock_ll.js';

// WebSocket Server --------------------- //
(()=>{ // local namespace 

const WSDrvName='wsdrv';
const WSHostEPN='WebSockMaster';

function _server_new(port,opt={}){

	opt=YgEs.Validate(opt,{Others:true,Struct:{
		User:{Struct:true,Default:{}},
		Log:{Class:'YgEs.LocalLog'},
		HappenTo:{Class:'YgEs.HappeningManager'},
		Launcher:{Class:'YgEs.Launcher'},
		Trace:{Boolable:true},
		Trace_Agent:{Boolable:true},
		Trace_StMac:{Boolable:true},
		Trace_Proc:{Boolable:true},
		Trace_WebSock:{Boolable:true},
		ConnectionLimit:{Integer:true,Min:-1,Default:-1},
		OnConnect:{Callable:true,Default:(ctx)=>{return false;}},
		OnDisconnect:{Callable:true,Default:(ctx)=>{}},
		OnReceived:{Callable:true,Default:(ctx,data,isbin)=>{}},
		OnError:{Callable:true,Default:(ctx,err)=>{}},
		OnOpen:{Callable:true,Default:(agent)=>{}},
		OnReady:{Callable:true,Default:(agent)=>{}},
		OnClose:{Callable:true,Default:(agent)=>{}},
		OnFinish:{Callable:true,Default:(agent,cleaned)=>{}},
	}},'opt');

	const log=opt.Log??Log;

	const onOpenExtra=opt.OnOpen;
	const onReadyExtra=opt.OnReady;
	const onCloseExtra=opt.OnClose;
	const onFinishExtra=opt.OnFinish;

	let field=Object.assign(opt,{
		Log:log,
		HappenTo:opt.HappenTo??HappeningManager.CreateLocal(),
		Launcher:opt.Launcher??Engine.CreateLauncher(),

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
			onOpenExtra(agent);
		},
		OnReady:(agent)=>{
			log.Info('WebSock server ready port '+port);
			onReadyExtra(agent);
		},
		OnClose:(agent)=>{
			onCloseExtra(agent);

			let done=false;
			agent.ll.Close(()=>{done=true;});
			agent.WaitFor('WebSock server closing',()=>done);
		},
		OnFinish:(agent,clean)=>{
			onFinishExtra(agent,clean);

			log.Info('end of WebSock server port '+port);
			agent.ll=null;
		},
	});

	var agent=AgentManager.StandBy(field);
	agent.Extend('YgEs.WebSockServer.Agent',{
		// private 
		ll:null,
		tracing_websock:opt.Trace||opt.Trace_WebSock,

		trace:(msg)=>{
			if(!priv.tracing_websock)return;
			log.Trace(msg);
		},
	},{
		// public 
		SetTracing_WebSock:(side)=>priv.tracing_websock=!!side,

		GetPort:()=>port,
	});

	const agent_SetTracing=agent.Inherit('SetTracing',(side)=>{
		agent_SetTracing(side);
		agent.SetTracing_WebSock(side);
	});

	return agent;
}

function _manager_new(port,opt={}){

	opt=YgEs.Validate(opt,{Others:true,Struct:{
		User:{Struct:true,Default:{}},
		Trace:{Boolable:true},
		Trace_Agent:{Boolable:true},
		Trace_StMac:{Boolable:true},
		Trace_Proc:{Boolable:true},
		Trace_Network:{Boolable:true},
		Trace_Transport:{Boolable:true},
		Trace_WebSock:{Boolable:true},
		Trace_Manager:{Boolable:true},
		Log:{Class:'YgEs.LocalLog'},
		HappenTo:{Class:'YgEs.HappeningManager'},
		Launcher:{Class:'YgEs.Launcher'},
		AgentBypasses:{List:{Literal:true}},
		Dependencies:{Dict:{Class:'YgEs.Handle'}},
		ConnectionLimit:{Integer:true,Min:-1,Default:-1},
		PIDPrefix:{Literal:true,Default:''},
		PayloadSpecs:{Dict:{Struct:true}},
		PayloadHooks:{Dict:{Struct:true}},
		ToughOut:{Struct:true},
		ToughIn:{Struct:true},
		OnReady:{Callable:true,Default:(agent)=>{}},
		OnOpen:{Callable:true,Default:(agent)=>{}},
		OnClose:{Callable:true,Default:(agent)=>{}},
		OnConnect:{Callable:true,Default:(ctx)=>{return false;}},
		OnDisconnect:{Callable:true,Default:(ctx)=>{}},
		OnReceived:{Callable:true,Default:(ctx,data,isbin)=>{}},
		OnError:{Callable:true,Default:(ctx,err)=>{}},
	}},'opt');

	const log=opt.Log??Log;
	const hap_local=opt.HappenTo??HappeningManager.CreateLocal();
	const launcher=opt.Launcher??Engine.CreateLauncher();

	// Protocol within WebSocket context 
	let protocol={}

	// WebSocket LowLevel 
	let ws_ll=_server_new(8801,{
		Log:log,
		Launcher:launcher,
		HappenTo:hap_local,
		ConnectionLimit:opt.ConnectionLimit,

		OnOpen:(agent)=>{
		},
		OnClose:(agent)=>{
			for(let pid in protocol)protocol[pid].Release();
			protocol={}
		},
		OnReady:(agent)=>{
		},
		OnConnect:(ctx,req)=>{
			let prot=ws_tp.NewProtocol(WSHostEPN);
			let pid=prot.GetPID();

			Log.Info('client come: '+pid);

			ctx.ClientID=pid;
			prot.User.Context=ctx;
			protocol[pid]=prot;

			return true;
		},
		OnDisconnect:(ctx)=>{

			let pid=ctx.ClientID;
			let prot=protocol[pid];
			if(!prot)return;

			Log.Info('client gone: '+pid);

			prot.Release();
			delete protocol[pid];
		},
		OnReceived:(ctx,msg,isbin)=>{

			let pid=ctx.ClientID;
			let prot=protocol[pid];
			if(!prot){
				Log.Notice('invalid msg from '+pid+': '+msg);
				return;
			}

			Log.Trace('msg from '+pid+': '+msg);

			ws_drv.Receive(msg,{Prot:prot,HostEPN:WSHostEPN});
		},
		OnError:(ctx,err)=>{
			Log.Fatal('error in '+ctx.ClientID,err);
		},
	});

	// Network Driver 
	let ws_drv=Network.CreateDriver({
		Log:log,
		Launcher:launcher,
		HappenTo:hap_local,
		ToughOut:opt.ToughOut,
		ToughIn:opt.ToughIn,

		OnSend:(driver,rawdata,prop)=>{

			let prot=prop.Prot;
			if(!prot){
				Log.Notice('Protocol missing',rawdata);
				return;
			}

			let ctx=prot.User.Context;
			if(!ctx){
				Log.Notice('WebSock context missing',rawdata);
				return;
			}

			ctx.Send(rawdata);
		},
	});

	// Transport 
	let ws_tp=Network.CreateTransport({
		Log:log,
		Launcher:launcher,
		HappenTo:hap_local,
		PIDPrefix:opt.PIDPrefix,
		PayloadSpecs:opt.PayloadSpecs,
		PayloadHooks:opt.PayloadHooks,
	});
	ws_tp.AttachReceiver(WSDrvName,ws_drv);
	ws_tp.AttachSender(WSDrvName,ws_drv);
	ws_tp.SetSelector((tp,target,prop)=>WSDrvName);

	// Master EndPoint 
	let ws_ep=Network.CreateEndPoint({
		Log:log,
		Launcher:launcher,
		HappenTo:hap_local,
	});
	ws_tp.Connect(WSHostEPN,ws_ep);

	let field=Object.assign(opt,{
		Dependencies:Object.assign(
			Object.values(opt.Dependencies),
			[ws_ll.Fetch(),ws_ep.Fetch()]
		),
	});

	var agent=AgentManager.StandBy(field);
	agent.Extend('YgEs.WebSockServer.Manager',{
		// private 
		tracing_manager:opt.Trace||opt.Trace_Manager,

		trace:(msg)=>{
			if(!priv.tracing_manager)return;
			log.Trace(msg);
		},
	},{
		// public 
		SetTracing_Manager:(side)=>priv.tracing_manager=!!side,

		GetPort:()=>port,
	});

	const agent_SetTracing=agent.Inherit('SetTracing',(side)=>{
		agent_SetTracing(side);
		agent.SetTracing_Manager(side);
	});

	return agent;
}

let WebSockServer=YgEs.WebSockServer={
	Name:'YgEs.WebSockServer.Container',
	User:{},
	_private_:{},

	SetUp:_server_new,
	Manage:_manager_new,
}

})();
export default YgEs.WebSockServer;
