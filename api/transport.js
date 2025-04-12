// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2025 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import YgEs from './common.js';
import Agent from './agent.js';
import EndPoint from './endpoint.js';

// Transport Driver --------------------- //
(()=>{ // local namespace 

function _transport_new(opt={}){

	const payload=opt.Payload??null;
	const hurting=opt.Hurting??0.0;
	const unorderable=opt.Unorderable??false;
	const delay_min=opt.DelayMin??0;
	const delay_max=opt.DelayMax??0;

	const onOpen=opt.OnOpen??((agent)=>{});
	const onClose=opt.OnClose??((agent)=>{});
	const onReady=opt.OnReady??((agent)=>{});
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
	const plrs=opt.PayloadReceivers??null

	let prm=Object.assign({},opt,{
		AgentBypasses:['Send','Receive'],
		OnOpen:(agent)=>{
			onOpen(agent);
		},
		OnClose:(agent)=>{
			onClose(agent);
			if(tp._private_.host)tp._private_.host.Close();
		},
		OnReady:(agent)=>{
			onReady(agent);
			if(tp._private_.host)tp._private_.host.Open();
		},
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

	tp._private_.send=(ep_from,epid_to,data)=>{
		if(!checkReady())return;
		try{
			let epid_from=ep_from.GetInstanceID();
			tp.GetLogger().Tick(()=>'Transport sending '+epid_from+'=>'+epid_to,data);

			let pack=onPack(ep_from,epid_to,data);
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

	tp.Launch=(epid_to,data)=>{
		if(!tp._private_.host){
			tp.GetLogger().Fatal('Host not attached for send');
			return;
		}
		return tp._private_.host.Launch(epid_to,data);
	}

	tp.Kick=(epid_to=null)=>{
		if(!tp._private_.host){
			tp.GetLogger().Fatal('Host not attached for send');
			return;
		}
		return tp._private_.host.Kick(epid_to);
	}

	tp.Send=(epid_to,data)=>{
		if(!tp._private_.host){
			tp.GetLogger().Fatal('Host not attached for send');
			return;
		}
		return tp._private_.host.Send(epid_to,data);
	}

	tp.Receive=(from,pack)=>{
		if(!checkReady())return;

		tp.GetLogger().Tick(()=>'Transport received via '+YgEs.Inspect(from)+': '+pack);

		let data=onUnpack(pack);
		let epid_from=onExtractEPIDFrom(data);
		let epid_to=onExtractEPIDTo(data);

		let ep_to=(epid_to==null)?
			(tp._private_.host?tp._private_.host.GetAgent():null):
			tp._private_.endpoint[epid_to];

		if(!ep_to){
			tp.GetLogger().Notice(()=>((epid_to==null)?'Host':('EndPoint '+epid_to))+' not found in Transport '+tp.Name);
			return;
		}

		try{
			let pla=onExtractPayloadArray(data);
			if(!Array.isArray(pla)){
				tp.GetLogger().Notice(()=>'No payloads: ',data);
			}
			else for(let pl of pla){
				if(!plrs){
					// receive plain payload 
					ep_to._private_.receive(epid_from,pl);
				}
				else{
					// receive by payload type 	
					let plt=onExtractPayloadType(pl);
					let pls=(plt==null)?null:plss[plt];
					let plr=(plt==null)?null:plrs[plt];
					if(!pls?.QuickCall){
						// call queue 
						tp.GetLogger().Tick(()=>'Payload queued '+epid_from+' => '+epid_to,data);
						ep_to._private_.recvq.push({
							From:epid_from,
							Payload:pl,
							Spec:pls,
							Call:plr,
						});
					}
					else if(plr){
						// call now 
						plr(ep_to,epid_from,pl);
					}
					else{
						tp.GetLogger().Notice(()=>'Receiver not defined: '+plt);
					}
				}
			}
		}
		catch(e){
			tp.GetLogger().Fatal('Transport error at unpack: '+e.toString(),YgEs.FromError(e));
		}
	}

	tp._private_.host=opt.HasHost?EndPoint.Create(tp,{
		Log:tp.GetLogger(),
		Launcher:tp.GetLauncher(),
		HappenTo:tp.GetHappeningManager(),
		OnReceived:opt.OnReceived,
	}).Fetch():null;

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
