// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2025 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import Network from '../api/network.js';
import Timing from '../api/timing.js';
import Engine from '../api/engine.js';
import HappeningManager from '../api/happening.js';
import Log from '../api/logger.js';

// Example: Transport Simulation -------- //
Log.Showable=Log.LEVEL.TRACE;

// start the Engine 
Engine.Start();

// for environment 
let log_local=Log.CreateLocal('NetworkTransportTest');
let launcher=Engine.CreateLauncher();
let hap_local=HappeningManager.CreateLocal({
	OnHappen:(hm,hap)=>{log_local.Fatal(hap.GetProp());},
});

// driver setting
const drvopt={
	Log:log_local,
	Launcher:launcher,
	HappenTo:hap_local,
	Trace_Agent:false,
	Trace_StMac:false,
	Trace_Proc:false,
	// tough test for sending 
	ToughOut:{
		// insert random msec delay 
		DelayMin:0,
		DelayMax:400,
		// maybe break ordering by delay 
//		Unorderable:true,
		// ratio of packet dubbing
//		DubRatio:0.25,
//		DubIntervalMin:0,
//		DubIntervalMax:500,
	},
	// tough test for receiving 
	ToughIn:{
		// insert random msec delay 
		DelayMin:0,
		DelayMax:400,
		// maybe break ordering by delay 
//		Unorderable:true,
		// ratio of packet dubbing
//		DubRatio:0.25,
//		DubIntervalMin:0,
//		DubIntervalMax:500,
	},
	// (for tough test) maybe cutoff during receiving 
	OnGate:(driver,rawdata,prop)=>{
//		if(Math.random()<0.25)return rawdata.substring(0,Math.random()*rawdata.length);
		return rawdata;
	},
}

// loopback driver 
let loopback=Network.CreateLoopback(drvopt);
// terminate driver 
let terminal=Network.CreateTerminator(drvopt);

loopback.SetTracing_Network(false);
terminal.SetTracing_Network(false);

// transport setting
const tpopt={
	Log:log_local,
	Launcher:launcher,
	HappenTo:hap_local,
	Trace_Agent:false,
	Trace_StMac:false,
	Trace_Proc:false,
}

let tp=Network.CreateTransport(tpopt);
tp.SetTracing_Transport(false);
tp.SetTracing_Agent(false);

tp.AttachReceiver('lb',loopback);
tp.AttachSender('lb',loopback);
tp.AttachSender('tm',terminal);

tp.SetSelector((tp,target,prop)=>{
	return (target=='')?'tm':'lb';
});

// endpoint setting
const epopt={
	Log:log_local,
	Launcher:launcher,
	HappenTo:hap_local,
	OnCome:(from,body,prop)=>{
		Log.Info('received from '+from,body);
	},
}

// loopback endpoints 
let ep1=Network.CreateEndPoint(epopt).Open();
let ep2=Network.CreateEndPoint(epopt).Open();

ep1.SetTracing_EndPoint(false);
ep2.SetTracing_EndPoint(false);

tp.Connect('EP1',ep1);
tp.Connect('EP2',ep2);

(async ()=>{

	// wait for endpoints ready 
	await Timing.SyncKit(1000,()=>ep1.IsReady()).ToPromise();
	await Timing.SyncKit(1000,()=>ep2.IsReady()).ToPromise();

	Log.Info('all ready');

	// send each other 
	// (when onorderable delay test, maybe receive B to A) 
	ep1.Send('EP2',null,'Loopback Test1A');
	ep2.Send('EP1',null,'Loopback Test2A');
	// can send a structure 
	ep1.Send('EP2',null,{msg:'Loopback Test1B',tmp:[1,2,{a:3,b:4}]});
	ep2.Send('EP1',null,{msg:'Loopback Test2B',tmp:[0,false,null,'',[],{}]});

	// send to Transport (but not reach to opposite EndPoint) 
	// EndPoint does not have an instance address to reply 
	// and can only send in one way 
	ep1.Launch('EP2',null,'Communicate Test1');
	ep1.Send('EP1',null,'Loopback Test1');
	ep2.Launch('EP1',null,'Communicate Test2');
	ep2.Launch('',null,'Terminate Test');
	ep2.KickAll();

	await Timing.DelayKit(1500).ToPromise();

	ep1.Close();
	ep2.Close();

	launcher.Sync((dmy)=>{
		Engine.ShutDown();
	});
})();
