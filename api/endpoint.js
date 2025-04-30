// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2025 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import YgEs from './common.js';
import Agent from './agent.js';

// EndPoint ----------------------------- //
(()=>{ // local namespace 

function _epctrl_new(){

	let ct={
		SendQ:[],
		DelayQ:[],
		Calling:{},
	}
	return ct;
}

function _epctrlset_new(){

	let ctset={tp:null,ep:{}}
	ctset.Get=(k)=>{
		if(k==null){
			return ctset.tp;
		}
		else{
			return ctset.ep[k]??null;
		}
	}
	ctset.Ref=(k)=>{
		if(k==null){
			let t=ctset.tp;
			if(!t)t=ctset.tp=_epctrl_new();
			return t;
		}
		else{
			let t=ctset.ep[k];
			if(!t)t=ctset.ep[k]=_epctrl_new();
			return t;
		}
	}
	return ctset;
}

function _endpoint_new(tdrv,opt={}){

	const epid=(opt.EPID!==undefined)?opt.EPID:YgEs.NextID();

	const onClose=opt.OnClose;
	const onReady=opt.OnReady;
	const onReceived=opt.OnReceived;

	let prm=Object.assign({},opt,{
		AgentBypasses:['GetInstanceID','Launch','Kick','Send','UnlockOnce'],
		OnClose:(ep)=>{
			ep.GetLogger().Trace(()=>'EndPoint '+epid+' ('+ep.Name+') is closing');
			if(onClose)onClose(ep);
			tdrv._private_.disconnect(ep);
		},
		OnReady:(ep)=>{
			ep.GetLogger().Trace(()=>'EndPoint '+epid+' ('+ep.Name+') is ready');
			tdrv._private_.connect(ep);
			if(onReady)onReady(ep);
		},
		OnPollInHealthy:(agent)=>{

			let rq=ep._private_.recvq;
			ep._private_.recvq=[]
			for(let recv of rq){
				ep.GetLogger().Trace(()=>'EndPoint '+epid+' call with received from '+recv.From,recv.Payload);
				recv.Call();
			}
		},
	});
	if(!prm.Name)prm.Name='YgEs.EndPoint.Control';

	let ep=Agent.StandBy(prm);
	ep._private_.epid=epid;
	ep._private_.recvq=[]
	ep._private_.epcset=_epctrlset_new();

	const checkReady=()=>{
		if(!ep.IsReady()){
			ep.GetLogger().Fatal('EndPoint '+epid+' ('+ep.Name+') is not ready');
			return false;
		}
		return true;
	}

	ep.GetInstanceID=()=>epid;
	ep.Launch=(epid_to,payload)=>{
		if(!checkReady())return;
		let epc=ep._private_.epcset.Ref(epid_to);

		let plt=tdrv.ExtractPayloadType(payload);
		if(plt!=null){
			let pls=tdrv.GetPayloadSpec(plt);
			if(!pls){
				ep.GetLogger().Fatal(()=>'Undefined Payload: '+plt);
				return;
			}
			if(pls.CallOnce.Limit){
				let cng=epc.Calling[plt];
				let now=Date.now();
				if(cng){
					// already calls with same payload type 
					if(cng.Timeout==null)return;
					if(cng.Timeout>now)return;
				}
				else cng=epc.Calling[plt]={Timeout:null}
				if(pls.CallOnce.Timeout)cng.Timeout=now+pls.CallOnce.Timeout;
			}
		}

		ep.GetLogger().Tick(()=>'EndPoint '+epid+' ('+ep.Name+') launch to '+epid_to,payload);

		epc.SendQ.push(payload);
	}
	ep.Kick=(epid_to=null)=>{
		if(!checkReady())return;
		let epc=ep._private_.epcset.Get(epid_to);
		if(!epc)return;
		let sq=epc.SendQ;
		epc.SendQ=[]

		let delay=tdrv.MakeDelay();
		if(delay<1){
			tdrv._private_.send(ep,epid_to,sq);
			return;
		}

		if(tdrv.IsUnorderable()){
			// simple delay test  
			// may swap ordered packets by this delay 
			tdrv.GetLauncher().Delay(delay,()=>{
				tdrv._private_.send(ep,epid_to,sq);
			},()=>{});
			return;
		}

		// keep packets ordering 
		let dq=epc.DelayQ;
		dq.push(sq);
		const launch=()=>{
			tdrv.GetLauncher().Delay(delay,()=>{
				fire();
			},()=>{});
		}
		const fire=()=>{
			if(dq.length<1)return;
			// send first packet 
			sq=dq.shift();
			tdrv._private_.send(ep,epid_to,sq);
			if(dq.length<1)return;
			// delay again 
			delay=tdrv.MakeDelay();
			launch();
		}
		if(dq.length>1){
			// delaying already started 
		}
		else{
			// start delaying now 
			launch();
		}
	}
	ep.Send=(epid_to,payload)=>{
		ep.Launch(epid_to,payload);
		ep.Kick(epid_to);
	}

	ep.UnlockOnce=(epid_to,plt)=>{
		let epc=ep._private_.epcset.Get(epid_to);
		if(!epc)return;
		if(!epc.Calling[plt])return;	
		delete epc.Calling[plt];
	}
	ep._private_.receive=(epid_from,payload)=>{
		ep.GetLogger().Tick(()=>'EndPoint '+epid+' ('+ep.Name+') received from '+epid_from,payload);
		if(onReceived)onReceived(ep,epid_from,payload);
	}

	return ep;
}

let EndPoint=YgEs.EndPoint={
	Name:'YgEs.EndPoint.Container',
	User:{},
	_private_:{},

	Create:_endpoint_new,
}

})();
export default YgEs.EndPoint;
