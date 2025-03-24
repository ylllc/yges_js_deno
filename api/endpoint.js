// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2025 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import YgEs from './common.js';
import Agent from './agent.js';

// EndPoint ----------------------------- //
(()=>{ // local namespace 

function _qset_new(){

	let qt={tp:null,ep:{}}
	qt.Ref=(k)=>{
		if(k==null){
			let t=qt.tp;
			if(!t)t=qt.tp=[]
			return t;
		}
		else{
			let t=qt.ep[k];
			if(!t)t=qt.ep[k]=[]
			return t;
		}
	}
	qt.Flush=(k)=>{
		if(k==null){
			let t=qt.tp;
			if(t)qt.tp=null
			return t;
		}
		else{
			let t=qt.ep[k];
			if(t)delete qt.ep[k];
			return t;
		}
	}
	return qt;
}

function _endpoint_new(tdrv,opt={}){

	const epid=opt.EPID??YgEs.NextID();

	const onClose=opt.OnClose;
	const onReady=opt.OnReady;
	const onReceived=opt.OnReceived;

	let prm=Object.assign({},opt,{
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
	});
	if(!prm.Name)prm.Name='YgEs.EndPoint.Control';

	let ep=Agent.StandBy(prm);
	ep._private_.epid=epid;
	ep._private_.sendq=_qset_new();
	ep._private_.delaying=_qset_new(); // for delay test 

	const checkReady=()=>{
		if(!ep.IsReady()){
			ep.GetLogger().Fatal('EndPoint '+epid+' ('+ep.Name+') is not ready');
			return false;
		}
		return true;
	}

	const handleFetch=ep.Fetch;
	ep.Fetch=()=>{
		let h=handleFetch();
		h.GetInstanceID=ep.GetInstanceID;
		h.Send=ep.Send;
		return h;
	}

	ep.GetInstanceID=()=>epid;
	ep.Launch=(epid_to,data)=>{
		if(!checkReady())return;
		let sq=ep._private_.sendq.Ref(epid_to);

		ep.GetLogger().Tick(()=>'EndPoint '+epid+' ('+ep.Name+') launch to '+epid_to,data);

		sq.push(data);
	}
	ep.Kick=(epid_to=null)=>{
		if(!checkReady())return;
		let sq=ep._private_.sendq.Flush(epid_to);
		if(!sq)return;

		let delay=tdrv.MakeDelay();
		if(delay<1){
			tdrv.Send(ep,epid_to,sq);
			return;
		}

		if(tdrv.IsUnorderable()){
			// simple delay test  
			// may swap ordered packets by this delay 
			tdrv.GetLauncher().Delay(delay,()=>{
				tdrv.Send(ep,epid_to,sq);
			},()=>{});
			return;
		}

		// keep packets ordering 
		let dq=ep._private_.delaying.Ref(epid_to);
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
			tdrv.Send(ep,epid_to,sq);
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
	ep.Send=(epid_to,data)=>{
		ep.Launch(epid_to,data);
		ep.Kick(epid_to);
	}

	ep._private_.receive=(epid_from,data)=>{
		ep.GetLogger().Tick(()=>'EndPoint '+epid+' ('+ep.Name+') received from '+epid_from,data);
		if(onReceived)onReceived(ep,epid_from,data);
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
