// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2025 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import Transport from '../api/transport.js';
import EndPoint from '../api/endpoint.js';
import Timing from '../api/timing.js';
import Engine from '../api/engine.js';
import HappeningManager from '../api/happening.js';
import Log from '../api/logger.js';

// Example: Transport Simulation -------- //

// start the Engine 
Engine.Start();

// for environment 
let log_local=Log.CreateLocal('TransportTest');
let launcher=Engine.CreateLauncher();
let hap_local=HappeningManager.CreateLocal({
	OnHappen:(hap)=>{log_local.Fatal(hap.GetProp());},
});

// transport setting
const topt={
	Log:log_local,
	Launcher:launcher,
	HappenTo:hap_local,
	// (for tough test) insert random msec delay 
	DelayMin:0,
	DelayMax:400,
	// (for tough test) maybe break ordering by delay 
	Unorderable:false,
	// (for tough test) ratio of short packet on sending 
	Hurting:0.0,
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
let lb_ep2=EndPoint.Create(lb_tp.GetAgent(),eopt).Open();

// terminate endpoints 
let tm_tp=Transport.CreateTerminator(topt).Open();
let tm_ep1=EndPoint.Create(tm_tp.GetAgent(),eopt).Open();
let tm_ep2=EndPoint.Create(tm_tp.GetAgent(),eopt).Open();

(async ()=>{

	// wait for endpoints ready 
	await Timing.SyncKit(1000,()=>lb_ep1.IsReady()).ToPromise();
	await Timing.SyncKit(1000,()=>lb_ep2.IsReady()).ToPromise();

	// send each other 
	// (when onorderable delay test, maybe receive B to A) 
	lb_ep1.Send(lb_ep2.GetInstanceID(),'Loopback Test1A');
	lb_ep2.Send(lb_ep1.GetInstanceID(),'Loopback Test2A');
	lb_ep1.Send(lb_ep2.GetInstanceID(),'Loopback Test1B');
	lb_ep2.Send(lb_ep1.GetInstanceID(),'Loopback Test2B');
	// send to me 
	// always received in random order from another senders 
	lb_ep1.Send(lb_ep1.GetInstanceID(),'Loopback Myself Test1');
	lb_ep2.Send(lb_ep2.GetInstanceID(),'Loopback Myself Test2');

	// wait for endpoints ready 
	await Timing.SyncKit(1000,()=>tm_ep1.IsReady()).ToPromise();
	await Timing.SyncKit(1000,()=>tm_ep2.IsReady()).ToPromise();

	// sendings will ignored 
	tm_ep1.Send(tm_ep2.GetInstanceID(),'Terminate Test1');
	tm_ep2.Send(tm_ep1.GetInstanceID(),'Terminate Test2');

	await Timing.DelayKit(1000).ToPromise();

	lb_ep1.Close();
	lb_ep2.Close();
	tm_ep1.Close();
	tm_ep2.Close();

	lb_tp.Close();
	tm_tp.Close();

	launcher.Sync((dmy)=>{
		Engine.ShutDown();
	});
})();
