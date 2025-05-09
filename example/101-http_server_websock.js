// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import YgEs from '../api/common.js';
import Engine from '../api/engine.js';
import Timing from '../api/timing.js';
import WebSockServer from '../api/websock_server.js';
import Transport from '../api/transport.js';
import EndPoint from '../api/endpoint.js';
import File from '../api/file.js';
import Log from '../api/logger.js';

//Log.Showable=Log.LEVEL.TRACE;

// Example: HTTP Server with WebSocket -- //

const LIFEFILE='../!http_server_running';

// HTTP Server 
import './100-http_server.js'; 

// WebSocket Server 

// payload definition (shared between server and client) 
const PAYLOAD_NAMES=['ECHO_REQ','ECHO_REP']
const PAYLOAD=YgEs.CreateEnum(PAYLOAD_NAMES);
const pld_specs={}
pld_specs[PAYLOAD.ECHO_REQ]={
//	QuickCall:true, // call on just received 
}
pld_specs[PAYLOAD.ECHO_REP]={
//	QuickCall:true, // call on just received 
}

// extract a payload type from received structure 
const pld_extract_type=(payload)=>payload.Type;

// server simulation Transport
let server_tp_opt={
	HasHost:true, // clients can send to unknown server EndPoint 
	PayloadSpecs:pld_specs,
	PayloadReceivers:{}, // server's receive functions by available payload type 
	OnExtractPayloadType:pld_extract_type,
	OnSend:(ep_from,epid_to,pack)=>{

		Log.Trace('send to '+epid_to,pack);

		// send to client 
		let ep=server_tp.GetEndPoint(epid_to);
		ep.User.WebSockCtx.Send(pack);
	},
}
server_tp_opt.PayloadReceivers[PAYLOAD.ECHO_REQ]=(ep_to,epid_from,data)=>{

	Log.Trace('ECHO_REQ received from '+epid_from+' as Client '+epid_from,data);

	// respond to sender 
	ep_to.Send(epid_from,{Type:PAYLOAD.ECHO_REP,Content:data.Content});
}
let server_tp=Transport.CreateDriver(server_tp_opt).Open();

function _server_new(name,port,interval){

	let endpoint={}

	let opt={
		// max clients 
		ConnectionLimit:5,

		OnClose:()=>{
			Log.Trace('WebSockServer closing');

			for(let cid in endpoint)endpoint[cid].Close();
			endpoint={}
		},
		OnReady:()=>{
			Log.Trace('WebSockServer ready');
		},
		OnConnect:(ctx,req)=>{
			let cid=null;
			do{
				cid=YgEs.NextID();
			}while(endpoint[cid]);

			Log.Info('client came: '+cid);

			ctx.ClientID=cid;

			// client Endpoint 
			let client_ep_opt={
				EPID:cid,
				User:{WebSockCtx:ctx},
			}
			let client_ep=endpoint[cid]=EndPoint.Create(server_tp.GetAgent(),client_ep_opt).Open();

			return true;
		},
		OnDisconnect:(ctx)=>{

			Log.Info('client gone: '+ctx.ClientID);

			let ep=endpoint[ctx.ClientID];
			if(ep){
				ep.Close();
				delete endpoint[ctx.ClientID];
			}
		},
		OnReceived:(ctx,msg,isbin)=>{
			Log.Trace('msg from '+ctx.ClientID+': '+msg);

			// (tentative) fix fake ClientFrom 
			// [ToDo] must get ctx.ClientID via Transport 
			let j=JSON.parse(msg);
			j.ClientFrom=ctx.ClientID;
			msg=JSON.stringify(j);

			// send to the server Transport 
			server_tp.Receive(null,msg);
		},
		OnError:(ctx,err)=>{
			Log.Fatal('error in '+ctx.ClientID+': '+err);
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

	// wait for server transport ready 
	await Timing.SyncKit(1000,()=>server_tp.IsReady()).ToPromise();

	// keep during LIFEFILE exists 
	await Timing.SyncKit(100,()=>{
		return !File.Exists(LIFEFILE);
	}).ToPromise();

	// stop server instances 
	server_ws.Close();
	server_tp.Close();

	// wait for end of all procedures 
	await Engine.ToPromise();
	Engine.ShutDown();
})();
