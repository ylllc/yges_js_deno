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

// Example: Call Once API --------------- //

// start the Engine 
Engine.Start();

// for environment 
let log_local=Log.CreateLocal('CallOnceTest');
let launcher=Engine.CreateLauncher();
let hap_local=HappeningManager.CreateLocal({
	OnHappen:(hm,hap)=>{log_local.Fatal(hap.GetProp());},
});

// payload definition (shared between server and client) 
const PAYLOAD_NAMES=['STATE_REQ','STATE_REP']
const PAYLOAD=YgEs.CreateEnum(PAYLOAD_NAMES);
const pld_specs={}
pld_specs[PAYLOAD.STATE_REQ]={
	CallOnce:{
		// only 1 call until replied 
		Limit:true,
		// can next request after replied 
		Reply:PAYLOAD.STATE_REP,
		// can call again after msec 
//		Timeout:1000,
	},
}
pld_specs[PAYLOAD.STATE_REP]={
}

// extract a payload type from received structure 
const pld_extract_type=(payload)=>payload.Type;

// transport setting
const topt={
	Log:log_local,
	Launcher:launcher,
	HappenTo:hap_local,
	HasHost:true, // clients can send to unknown server EndPoint 
	PayloadSpecs:pld_specs,
	PayloadReceivers:{}, // server's receive functions by available payload type 
	// (for tough test) insert random msec delay 
//	DelayMin:0,
//	DelayMax:400,
	// (for tough test) maybe break ordering by delay 
//	Unorderable:false,
	// (for tough test) ratio of short packet on sending 
//	Hurting:0.0,

	OnExtractPayloadType:pld_extract_type,
}
topt.PayloadReceivers[PAYLOAD.STATE_REQ]=(ep_to,epid_from,data)=>{

	log_local.Info('STATE_REQ received from '+epid_from,data);

	// respond to sender 
	lb_tp.Send(epid_from,{Type:PAYLOAD.STATE_REP,State:'OK'});
}
topt.PayloadReceivers[PAYLOAD.STATE_REP]=(ep_to,epid_from,data)=>{

	log_local.Info('STATE_REP received from '+epid_from,data);
}


// endpoint setting
const eopt={
	Log:log_local,
	Launcher:launcher,
	HappenTo:hap_local,
	OnReceived:(ep,from,data)=>{
		log_local.Info('EndPoint '+ep.GetInstanceID()+' received from '+from,data);
	},
}

// loopback endpoints 
let lb_tp=Transport.CreateLoopback(topt).Open();
let lb_ep1=EndPoint.Create(lb_tp.GetAgent(),eopt).Open();

(async ()=>{

	// wait for transport ready 
	await Timing.SyncKit(1000,()=>lb_tp.IsReady()).ToPromise();

	// wait for endpoints ready 
	await Timing.SyncKit(1000,()=>lb_ep1.IsReady()).ToPromise();

	// request to the server 
	lb_ep1.Send(null,{Type:PAYLOAD.STATE_REQ});
	// 2nd request will blocked by CallOnce option 
	lb_ep1.Send(null,{Type:PAYLOAD.STATE_REQ});

	await Timing.DelayKit(1000).ToPromise();

	// can 2nd request after STATE_REP replied 
	lb_ep1.Send(null,{Type:PAYLOAD.STATE_REQ});

	await Timing.DelayKit(1000).ToPromise();

	lb_ep1.Close();

	lb_tp.Close();

	launcher.Sync((dmy)=>{
		Engine.ShutDown();
	});
})();
