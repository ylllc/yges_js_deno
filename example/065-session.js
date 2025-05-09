// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2025 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import YgEs from '../api/common.js';
import Transport from '../api/transport.js';
import EndPoint from '../api/endpoint.js';
import Session from '../api/session.js';
import Timing from '../api/timing.js';
import Engine from '../api/engine.js';
import HappeningManager from '../api/happening.js';
import Log from '../api/logger.js';

// Example: Session --------------------- //

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
}
pld_specs[PAYLOAD.STATE_REP]={
}

// extract a payload type from received structure 
const pld_extract_type=(payload)=>payload.Type;
const pld_extract_sid=(payload)=>payload.SID;

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
	OnExtractSessionID:pld_extract_sid,
}
topt.PayloadReceivers[PAYLOAD.STATE_REP]=(ep_to,epid_from,data)=>{

	log_local.Info('EndPoint '+ep_to.GetInstanceID()+' received STATE_REP from '+epid_from,data);
}

// session setting 
const sopt={
	Log:log_local,
	Launcher:launcher,
	HappenTo:hap_local,
	PayloadSpecs:pld_specs,
	PayloadReceivers:{}, // server's receive functions by available payload type
}
sopt.PayloadReceivers[PAYLOAD.STATE_REQ]=(ep_to,epid_from,data,sess)=>{

	log_local.Info('EndPoint '+ep_to.GetInstanceID()+' received STATE_REQ from '+epid_from,data);

	// respond to sender 
	lb_tp.Send(epid_from,{Type:PAYLOAD.STATE_REP,State:'OK'});
}

// endpoint setting
const eopt={
	Log:log_local,
	Launcher:launcher,
	HappenTo:hap_local,
	OnReceived:(ep_to,from,data)=>{
		log_local.Info('EndPoint '+ep_to.GetInstanceID()+' received from '+from,data);
	},
}

// loopback endpoints 
let lb_tp=Transport.CreateLoopback(topt).Open();
let lb_ep1=EndPoint.Create(lb_tp.GetAgent(),eopt).Open();
let lb_ep2=EndPoint.Create(lb_tp.GetAgent(),eopt).Open();
let lb_ep3=EndPoint.Create(lb_tp.GetAgent(),eopt).Open();

// sessions 
let sess1=lb_tp.AttachSession(Session.Create(sopt));
let sess2=lb_tp.AttachSession(Session.Create(sopt));

sess1.Join(lb_ep1.GetInstanceID());
sess1.Join(lb_ep2.GetInstanceID());

sess2.Join(lb_ep1.GetInstanceID());
sess2.Join(lb_ep3.GetInstanceID());


(async ()=>{

	// wait for transport ready 
	await Timing.SyncKit(1000,()=>lb_tp.IsReady()).ToPromise();

	// wait for endpoints ready 
	await Timing.SyncKit(1000,()=>lb_ep1.IsReady()).ToPromise();
	await Timing.SyncKit(1000,()=>lb_ep2.IsReady()).ToPromise();
	await Timing.SyncKit(1000,()=>lb_ep3.IsReady()).ToPromise();

	// wait for sessions ready 
	await Timing.SyncKit(1000,()=>sess1.IsReady()).ToPromise();
	await Timing.SyncKit(1000,()=>sess2.IsReady()).ToPromise();

	// requests are allowed from insession members only 
	lb_ep1.Send(null,{Type:PAYLOAD.STATE_REQ,SID:sess1.GetInstanceID()});
	lb_ep2.Send(null,{Type:PAYLOAD.STATE_REQ,SID:sess1.GetInstanceID()});
	lb_ep3.Send(null,{Type:PAYLOAD.STATE_REQ,SID:sess1.GetInstanceID()});
	await Timing.DelayKit(1000).ToPromise();

	lb_ep1.Send(null,{Type:PAYLOAD.STATE_REQ,SID:sess2.GetInstanceID()});
	lb_ep2.Send(null,{Type:PAYLOAD.STATE_REQ,SID:sess2.GetInstanceID()});
	lb_ep3.Send(null,{Type:PAYLOAD.STATE_REQ,SID:sess2.GetInstanceID()});
	await Timing.DelayKit(1000).ToPromise();

	// left EndPoint could receive any longer  
	sess1.Leave(lb_ep1.GetInstanceID());
	lb_ep1.Send(null,{Type:PAYLOAD.STATE_REQ,SID:sess1.GetInstanceID()});
	await Timing.DelayKit(1000).ToPromise();

	// still availed 
	lb_ep1.Send(null,{Type:PAYLOAD.STATE_REQ,SID:sess2.GetInstanceID()});
	await Timing.DelayKit(1000).ToPromise();

	// detached Session could receive any longer  
	lb_tp.DetachSession(sess2);
	lb_ep3.Send(null,{Type:PAYLOAD.STATE_REQ,SID:sess2.GetInstanceID()});
	await Timing.DelayKit(1000).ToPromise();

	// still availed 
	lb_ep2.Send(null,{Type:PAYLOAD.STATE_REQ,SID:sess1.GetInstanceID()});
	await Timing.DelayKit(1000).ToPromise();

	lb_ep1.Close();
	lb_ep2.Close();
	lb_ep3.Close();

	lb_tp.Close();

	launcher.Sync((dmy)=>{
		Engine.ShutDown();
	});
})();
