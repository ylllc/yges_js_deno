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
const WSHostEPN='WebSockMaster';

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

// payload definition (server side hooks) 
const pld_server={
	ECHO_REQ:{
		OnBound:(tp,payload,prop)=>{

			Log.Trace('bound new Protocol',payload);

			// host EndPoint name to respond 
			return prop.HostEPN;
		},
		OnRespond:(tp,prot,payload,prop)=>{

			Log.Trace('respond in Protocol '+prot.GetPID(),payload);

			// replying 
			prot.Send(payload.From,'ECHO_REP',payload.Body,prop);

			// this Protocol is controlled by a client, don't continue 
			return false;
		},
	},
}

var server_ws=WebSockServer.Manage(8801,{
	Log:log_local,
	Launcher:launcher,
	HappenTo:hap_local,
	PIDPrefix:'Exam101_',
	PayloadSpecs:pld_specs,
	PayloadHooks:pld_server,

	OnOpen:(agent)=>{
		Log.Info('WebSockServerManager opening');
	},
	OnClose:(agent)=>{
		Log.Info('WebSockServerManager closing');
	},
	OnReady:(agent)=>{
		Log.Info('WebSockServerManager ready');
	},

	// tough test for sending 
	ToughOut:{
		// insert random msec delay 
//		DelayMin:200,
//		DelayMax:1500,
	},
	// tough test for receiving 
	ToughIn:{
		// insert random msec delay 
		DelayMin:200,
		DelayMax:1500,
	},
}).Fetch();

(async()=>{
	// start server instances 
	server_ws.Open();

	// wait for server ready 
	await Timing.SyncKit(1000,()=>server_ws.IsReady()).ToPromise();

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
