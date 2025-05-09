// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2025 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import YgEs from '../api/common.js';
import Transport from '../api/transport.js';
import EndPoint from '../api/endpoint.js';
import Timing from '../api/timing.js';
import Engine from '../api/engine.js';
import HappeningManager from '../api/happening.js';
import Log from '../api/logger.js';

// Example: Host ------------------------ //

// start the Engine 
Engine.Start();

// for environment 
let log_local=Log.CreateLocal('JoiningTest',Log.LEVEL.DEBUG);
let launcher=Engine.CreateLauncher();
let hap_local=HappeningManager.CreateLocal({
	OnHappen:(hm,hap)=>{log_local.Fatal(hap.GetProp());},
});

// payload definition (shared between server and client) 
const PAYLOAD_NAMES=['JOIN','WELCOME']
const PAYLOAD=YgEs.CreateEnum(PAYLOAD_NAMES);
const pld_specs={}
pld_specs[PAYLOAD.JOIN]={
//	QuickCall:true, // call on just received 
}
pld_specs[PAYLOAD.WELCOME]={
//	QuickCall:true, // call on just received 
}

// extract a payload type from received structure 
const pld_extract_type=(payload)=>payload.Type;

// server simulation Transport
let server_tp_opt={
	Log:log_local,
	Launcher:launcher,
	HappenTo:hap_local,
	HasHost:true, // clients can send to unknown server EndPoint 
	PayloadSpecs:pld_specs,
	PayloadReceivers:{}, // server's receive functions by available payload type 
	OnExtractPayloadType:pld_extract_type,
	OnSend:(ep_from,epid_to,pack)=>{
		// send to the client Transport 
		client_tp.Receive(epid_to,pack);
	},
}
server_tp_opt.PayloadReceivers[PAYLOAD.JOIN]=(ep_to,epid_from,data)=>{

	// client ID on the server 
	let cid=YgEs.NextID();

	log_local.Debug('JOIN received from '+epid_from+' as Client '+cid,data);

	// respond to sender 
	ep_to.Send(epid_from,{Type:PAYLOAD.WELCOME,ClientID:cid});
}
let server_tp=Transport.CreateDriver(server_tp_opt).Open();


// client simulation Transport
let client_tp_opt={
	Log:log_local,
	Launcher:launcher,
	HappenTo:hap_local,
	PayloadSpecs:pld_specs,
	PayloadReceivers:{}, // client's receive functions by available payload type 
	OnExtractPayloadType:pld_extract_type,
	OnSend:(ep,epid_to,pack)=>{
		// send to the server Transport 
		server_tp.Receive(null,pack);
	},
}
client_tp_opt.PayloadReceivers[PAYLOAD.WELCOME]=(ep_to,epid_from,data)=>{

	log_local.Debug('WELCOME received from '+epid_from,data);

	// indicate joining completed 
	ep_to.User.ClientID=data.ClientID;
}
let client_tp=Transport.CreateDriver(client_tp_opt).Open();

// client Endpoint 
let client_ep_opt={
	Log:log_local,
	Launcher:launcher,
	HappenTo:hap_local,
	User:{ClientID:null},
}
let client_ep1=EndPoint.Create(client_tp.GetAgent(),client_ep_opt).Open();
let client_ep2=EndPoint.Create(client_tp.GetAgent(),client_ep_opt).Open();

(async ()=>{

	// wait for server transport ready 
	await Timing.SyncKit(1000,()=>server_tp.IsReady()).ToPromise();

	// wait for endpoints ready 
	await Timing.SyncKit(1000,()=>client_ep1.IsReady()).ToPromise();
	await Timing.SyncKit(1000,()=>client_ep2.IsReady()).ToPromise();

	// connect to the server 
	client_ep1.Send(null,{Type:PAYLOAD.JOIN});
	client_ep2.Send(null,{Type:PAYLOAD.JOIN});

	// wait for join 
	await Timing.SyncKit(1000,()=>client_ep1.GetAgent().User.ClientID).ToPromise();
	await Timing.SyncKit(1000,()=>client_ep2.GetAgent().User.ClientID).ToPromise();

	client_ep1.Close();
	client_ep2.Close();
	client_tp.Close();
	server_tp.Close();

	launcher.Sync((dmy)=>{
		Engine.ShutDown();
	});
})();
