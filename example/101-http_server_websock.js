// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import YgEs from '../api/common.js';
import Engine from '../api/engine.js';
import Timing from '../api/timing.js';
import HappeningManager from '../api/happening.js';
import WebSockServer from '../api/websock_server.js';
import Network from '../api/network.js';
import File from '../api/file.js';
import Log from '../api/logger.js';

Log.Showable=Log.LEVEL.TRACE;

// Example: HTTP Server with WebSocket -- //

const LIFEFILE='../!http_server_running';
const WSHostEPN='WSHost';

// HTTP Server 
import './100-http_server.js'; 

// for environment 
let log_local=Log.CreateLocal('WebServerTest');
let launcher=Engine.CreateLauncher();
let hap_local=HappeningManager.CreateLocal({
	OnHappen:(hm,hap)=>{log_local.Fatal(hap.GetProp());},
});

// payload definition (shared between server and client) 
const pld_specs={
	ECHO_REQ:{
		CallOnce:{
			// only 1 call until replied 
			Limit:true,
			// can call again after msec 
			Timeout:10000,
		},
	},
	ECHO_REP:{
		// unlock ECHO_REQ when received 
		UnlockOnce:['ECHO_REQ'],
	},
}

// WebSocket receiver 
const recvopt={
	Log:log_local,
	Launcher:launcher,
	HappenTo:hap_local,
	// (for tough test) insert random msec delay 
	DelayMin:200,
	DelayMax:1500,
}
let ws_receiver=Network.CreateReceiver(recvopt);

// WebSocket sender 
const sendopt={
	Log:log_local,
	Launcher:launcher,
	HappenTo:hap_local,
	// (for tough test) insert random msec delay 
	DelayMin:200,
	DelayMax:1500,
	OnSend:(sender,rawdata,prop)=>{

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
}
let ws_sender=Network.CreateSender(sendopt);

// WebSocket Transport 
const tpopt={
	Log:log_local,
	Launcher:launcher,
	HappenTo:hap_local,
	PIDPrefix:'Exam101',
	PayloadSpecs:pld_specs,
	PayloadHooks:{
		ECHO_REQ:{
			OnRequest:(tp,payload,prop)=>{

				let prot=prop.Prot;
				if(!prot){
					Log.Notice('Protocol missing',payload);
					return;
				}

				Log.Trace('requested out of Protocol',payload);

				// replying 
				prot.Send(payload.From,'ECHO_REP',payload.Body,{Prot:prot});
			},
			OnBound:(tp,payload,prop)=>{

				Log.Trace('bound new Protocol',payload);

				return WSHostEPN;
			},
			OnRespond:(tp,prot,payload,prop)=>{

				Log.Trace('respond in Protocol '+prot.GetPID(),payload);

				// replying 
				prot.Send(payload.From,'ECHO_REP',payload.Body,prop);

				// this Protocol is continued 
				return true;
			},
		},
	},
}
let ws_transport=Network.CreateTransport(tpopt);
ws_transport.AttachReceiver('ws',ws_receiver);
ws_transport.AttachSender('ws',ws_sender);
ws_transport.SetSelector((tp,target,prop)=>'ws');

// WebSocket EndPoint 
const epopt={
	Log:log_local,
	Launcher:launcher,
	HappenTo:hap_local,
}
let ws_endpoint=Network.CreateEndPoint(epopt).Fetch();
ws_transport.Connect(WSHostEPN,ws_endpoint);

function _server_new(name,port,interval){

	let protocol={}

	let opt={
		// max clients 
		ConnectionLimit:5,

		OnOpen:(agent)=>{
			Log.Trace('WebSockServer opening');
			ws_endpoint.Open();
			agent.WaitFor('NetworkLayer',()=>ws_endpoint.IsReady());
		},
		OnClose:(agent)=>{
			Log.Trace('WebSockServer closing');
			ws_endpoint.Close();

			for(let pid in protocol)protocol[pid].Release();
			protocol={}
		},
		OnReady:(agent)=>{
			Log.Trace('WebSockServer ready');



		},
		OnConnect:(ctx,req)=>{

			let prot=ws_transport.NewProtocol(WSHostEPN);
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

			ws_receiver.Receive(msg,{Prot:prot});
		},
		OnError:(ctx,err)=>{
			Log.Fatal('error in '+ctx.ClientID,err);
		},
	}

	// create a server instance 
	let server=WebSockServer.SetUp(port,opt);
	return server.Fetch();
}

var server_ws=_server_new('WebSockForHTTPServer',8801,100);

(async()=>{
	// start server instances 
	server_ws.Open();

	// wait for server EndPoint ready 
	await Timing.SyncKit(1000,()=>ws_endpoint.IsReady()).ToPromise();

	// keep during LIFEFILE exists 
	await Timing.SyncKit(100,()=>{
		return !File.Exists(LIFEFILE);
	}).ToPromise();

	// stop server instances 
	server_ws.Close();

	// wait for end of all procedures 
	await Engine.ToPromise();
	Engine.ShutDown();
})();
