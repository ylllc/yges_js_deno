// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2025 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import YgEs from './common.js';
import Agent from './agent.js';

// Transport Driver --------------------- //
(()=>{ // local namespace 

function _transport_new(opt={}){

	const payload=opt.Payload??null;
	const hurting=opt.Hurting??0.0;
	const unorderable=opt.Unorderable??false;
	const delay_min=opt.DelayMin??0;
	const delay_max=opt.DelayMax??0;

	const onPack=opt.OnPack??((ep_from,epid_to,payload)=>{
		return JSON.stringify({ClientFrom:ep_from.GetInstanceID(),ClientTo:epid_to,Payload:payload});
	});
	const onUnpack=opt.OnUnpack??((pack)=>{
		return JSON.parse(pack);
	});
	const onExtractEPIDFrom=opt.OnExtractEPIDFrom??((data)=>{
		return data.ClientFrom;
	});
	const onExtractEPIDTo=opt.OnExtractEPIDTo??((data)=>{
		return data.ClientTo;
	});
	const onExtractPayloadArray=opt.OnExtractPayloadArray??((data)=>{
		return data.Payload;
	});
	const onExtractPayloadType=opt.OnExtractPayloadType??((payload)=>null);
	const onSend=opt.OnSend??((ep_from,epid_to,pack)=>{
		let epid_from=ep_from.GetInstanceID();
		tp.GetLogger().Tick(()=>'terminated transport: '+pack);
	});
	const plss=opt.PayloadSpecs??{}
	const plrs=opt.PayloadReceivers??{}

	let prm=Object.assign({},opt,{
	});
	if(!prm.Name)prm.Name='YgEs.Transport.Driver';

	let tp=Agent.StandBy(prm);
	tp._private_.endpoint={}

	tp.IsUnorderable=()=>unorderable;
	tp.MakeDelay=()=>{
		if(delay_max<1)return 0;
		return delay_min+Math.random()*(delay_max-delay_min);
	}

	const checkReady=()=>{
		if(!tp.IsReady()){
			tp.GetLogger().Fatal('Transport '+tp.Name+' is not ready');
			return false;
		}
		return true;
	}

	const handleFetch=tp.Fetch;
	tp.Fetch=()=>{
		let h=handleFetch();
		h.Connect=tp.Connect;
		return h;
	}

	tp._private_.connect=(ep)=>{
		let epid=ep.GetInstanceID();
		if(tp._private_.endpoint[epid]){
			tp.GetLogger().Notice('EndPoint '+epid+' was overriden in Transport ('+tp.Name+')');
		}
		tp._private_.endpoint[epid]=ep;
	}
	tp._private_.disconnect=(ep)=>{
		let epid=ep.GetInstanceID();
		if(!tp._private_.endpoint[epid])return;
		delete tp._private_.endpoint[epid];
	}

	tp._private_.send=(ep_from,epid_to,payload)=>{
		if(!checkReady())return;
		try{
			let epid_from=ep_from.GetInstanceID();
			tp.GetLogger().Tick(()=>'Transport sending '+epid_from+'=>'+epid_to,payload);

			let pack=onPack(ep_from,epid_to,payload);
			if(hurting>0){
				if(Math.random()<hurting){
					// packet short test 
					pack=pack.substring(0,Math.random()*pack.substring.length);
				}
			}

			// send now 
			onSend(ep_from,epid_to,pack);
		}
		catch(e){
			tp.GetLogger().Fatal('Transport error at send: '+e.toString(),YgEs.FromError(e));
		}
	}

	tp.Receive=(from,pack)=>{
		if(!checkReady())return;

		tp.GetLogger().Tick(()=>'Transport received via '+YgEs.Inspect(from)+': '+pack);

		let data=onUnpack(pack);
		let epid_from=onExtractEPIDFrom(data);
		let epid_to=onExtractEPIDTo(data);
		if(epid_to==null){
			let pla=onExtractPayloadArray(data);
			if(!Array.isArray(pla)){
				tp.GetLogger().Notice(()=>'No payloads: ',data);
			}
			else for(let pl of pla){
				let plt=onExtractPayloadType(pl);
				let pls=(plt==null)?null:plss[plt];
				let plr=(plt==null)?null:plrs[plt];
				if(plr)plr(epid_from,pl);
				else{
					tp.GetLogger().Notice(()=>'Receiver not defined: '+plt);
				}
			}
			return;
		}

		let ep_to=tp._private_.endpoint[epid_to];
		if(!ep_to){
			tp.GetLogger().Notice(()=>'EndPoint '+epid_to+' not found in Transport '+tp.Name);
			return;
		}

		try{
			// receive to destination endpoint 
			for(let d of data.Payload){
				if(ep_to)ep_to._private_.receive(epid_from,d);
				else{
					tp.GetLogger().Tick(()=>'received',d);
				}
			}
		}
		catch(e){
			tp.GetLogger().Fatal('Transport error at unpack: '+e.toString(),YgEs.FromError(e));
		}
	}

	return tp;
}

function _loopback_new(opt={}){

	let prm=Object.assign({},opt,{
		Name:'YgEs.Transport.Loopback',
		OnSend:(ep_from,epid_to,pack)=>{
			let epid_from=ep_from.GetInstanceID();
			tp.Receive({Type:'loopback',Instance:null},pack);
		},
	});
	if(opt.Log)prm.Log=opt.Log;
	if(opt.Launcher)prm.Launcher=opt.Launcher;
	if(opt.HappenTo)prm.HappenTo=opt.HappenTo;

	let tp=_transport_new(prm);
	return tp;
}

function _terminate_new(opt={}){

	let prm=Object.assign({},opt,{
		Name:'YgEs.Transport.Terminate',
	});
	if(opt.Log)prm.Log=opt.Log;
	if(opt.Launcher)prm.Launcher=opt.Launcher;
	if(opt.HappenTo)prm.HappenTo=opt.HappenTo;

	return _transport_new(prm);
}

let Transport=YgEs.Transport={
	Name:'YgEs.Transport.Container',
	User:{},
	_private_:{},

	CreateDriver:_transport_new,
	CreateLoopback:_loopback_new,
	CreateTerminator:_terminate_new,
}

})();
export default YgEs.Transport;
