// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2025 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import Network from '../api/network.js';
import Timing from '../api/timing.js';
import Engine from '../api/engine.js';
import HappeningManager from '../api/happening.js';
import Log from '../api/logger.js';

// Example: Protocol Simulation --------- //
Log.Showable=Log.LEVEL.TRACE;

// start the Engine 
Engine.Start();

// for environment 
let log_local=Log.CreateLocal('NetworkProtocolTest');
let launcher=Engine.CreateLauncher();
let hap_local=HappeningManager.CreateLocal({
	OnHappen:(hm,hap)=>{log_local.Fatal(hap.GetProp());},
});

// payload definition 
const pld_specs={
	HELLO:{},
	HI:{},
}

// receiver setting
const recvopt={
	Log:log_local,
	Launcher:launcher,
	HappenTo:hap_local,
	Trace_Agent:false,
	Trace_StMac:false,
	Trace_Proc:false,
	// (for tough test) insert random msec delay 
	DelayMin:0,
	DelayMax:400,
	// (for tough test) maybe break ordering by delay 
//	Unorderable:true,
	// (for tough test) ratio of dubbed packet on received 
//	DubRatio:0.25,
//	DubIntervalMin:0,
//	DubIntervalMax:500,
	// (for tough test) maybe cutoff during receiving 
	OnGate:(recver,rawdata,prop)=>{
//		if(Math.random()<0.25)return rawdata.substring(0,Math.random()*rawdata.length);
		return rawdata;
	},
}

// receiver 
let recv_host=Network.CreateReceiver(recvopt);
let recv_guest=Network.CreateReceiver(recvopt);

recv_host.SetTracing_Receiver(false);
recv_guest.SetTracing_Receiver(false);

// sender setting
const sendopt={
	Log:log_local,
	Launcher:launcher,
	HappenTo:hap_local,
	// (for tough test) insert random msec delay 
	DelayMin:0,
	DelayMax:400,
}

// sender 
let send_host=Network.CreateLoopback(recv_guest,sendopt);
let send_guest=Network.CreateLoopback(recv_host,sendopt);

// transport setting
const tpopt={
	Log:log_local,
	Launcher:launcher,
	HappenTo:hap_local,
	TraceAgent:false,
	TraceStMac:false,
	TraceProc:false,
	PIDPrefix:'Exam061',
	PayloadSpecs:pld_specs,
}

const tpopt_server=Object.assign({},tpopt,{
	PayloadHooks:{
		HELLO:{
			OnRequest:(tp,payload,prop)=>{

				// create a Protocol for continue communicating 
				let prot=tp.NewProtocol('host',{Name:'Replying'});
				if(!prot)return;

				log_local.Info('Protocol ('+prot.GetPID()+') created by requested HELLO',payload);

				// replying 
				prot.Send(payload.From,'HI','Hi, '+payload.From);
			},
		},
	},
});

const tpopt_client=Object.assign({},tpopt,{
	PayloadHooks:{
		HI:{
			OnBound:(tp,payload,prop)=>{

				// calling by,
				// - first replied by requested 
				// - restart communicating in an abandoned Protocol 

				log_local.Info('Protocol accepted',payload);

				// specify handing EndPoint 
				return 'guest';
			},
			OnRespond:(tp,prot,payload,prop)=>{

				log_local.Info('Replied on Protocol '+prot.GetPID(),payload);

				// terminate this Protocol 
				return false;
			},
		},
	},
});

let tp_host=Network.CreateTransport(tpopt_server);
tp_host.SetTracing_Transport(false);
tp_host.SetTracing_Agent(false);

let tp_guest=Network.CreateTransport(tpopt_client);
tp_guest.SetTracing_Transport(false);
tp_guest.SetTracing_Agent(false);

tp_host.AttachReceiver('port_host',recv_host);
tp_host.AttachSender('port_host',send_host);
tp_host.SetSelector((tp,target,prop)=>'port_host');

tp_guest.AttachReceiver('port_guest',recv_guest);
tp_guest.AttachSender('port_guest',send_guest);
tp_guest.SetSelector((tp,target,prop)=>'port_guest');

// endpoint setting
const epopt={
	Log:log_local,
	Launcher:launcher,
	HappenTo:hap_local,
}

let ep_host=Network.CreateEndPoint(epopt).Open();
let ep_guest=Network.CreateEndPoint(epopt).Open();

ep_host.SetTracing_EndPoint(false);
ep_guest.SetTracing_EndPoint(false);

tp_host.Connect('host',ep_host);
tp_guest.Connect('guest',ep_guest);

(async ()=>{

	// wait for endpoints ready 
	await Timing.SyncKit(1000,()=>ep_host.IsReady()).ToPromise();
	await Timing.SyncKit(1000,()=>ep_guest.IsReady()).ToPromise();

	Log.Info('all ready');

	// start a communicating 
	ep_guest.Send(null,'HELLO','Hello, host');

	await Timing.DelayKit(1500).ToPromise();

	ep_guest.Close();
	ep_host.Close();

	launcher.Sync((dmy)=>{
		Engine.ShutDown();
	});
})();
