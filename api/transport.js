// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2025 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import YgEs from './common.js';
import Agent from './agent.js';

// Transport Driver --------------------- //
(()=>{ // local namespace 

function _transport_new(opt={}){

	const hurting=opt.Hurting??0.0;
	const unorderable=opt.Unorderable??false;
	const delay_min=opt.DelayMin??0;
	const delay_max=opt.DelayMax??0;

	const onPack=opt.OnPack??((data)=>{
		return JSON.stringify(data);
	});
	const onUnpack=opt.OnUnpack??((pack)=>{
		return JSON.parse(pack);
	});
	const onSend=opt.OnSend??((ep,epid_to,pack)=>{
		let epid_from=ep.GetInstanceID();
		tp.GetLogger().Tick(()=>'terminated transport '+epid_from+'=>'+epid_to+': '+pack);
	});

	let prm=Object.assign({},opt,{
	});
	if(!prm.Name)prm.Name='YgEs.Transport.Driver';

	let tp=Agent.StandBy(prm);
	tp._private_.endpoint={}

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

	tp._private_.send=(ep,epid_to,data)=>{
		if(!checkReady())return;
		try{
			let epid_from=ep.GetInstanceID();
			tp.GetLogger().Tick(()=>'Transport sending '+epid_from+'=>'+epid_to,data);

			let pack=onPack(data);
			if(hurting>0){
				if(Math.random()<hurting){
					// packet short test 
					pack=pack.substring(0,Math.random()*pack.substring.length);
				}
			}

			if(delay_max>0){
				// delay test 
				let delay=delay_min+Math.random()*(delay_max-delay_min);
				if(ep._private_.delaying[epid_to] && !unorderable){
					// keep ordering from previous delay 
					ep._private_.delaying[epid_to].Sync(()=>{
						ep._private_.delaying[epid_to]=tp.GetLauncher().Delay(delay,()=>{
							delete ep._private_.delaying[epid_to];
							onSend(ep,epid_to,pack);
						},()=>{});
					});
				}
				else{
					ep._private_.delaying[epid_to]=tp.GetLauncher().Delay(delay,()=>{
						delete ep._private_.delaying[epid_to];
						onSend(ep,epid_to,pack);
					},()=>{});
				}
			}
			else{
				// send now 
				onSend(ep,epid_to,pack);
			}
		}
		catch(e){
			tp.GetLogger().Fatal('Transport error at send: '+e.toString(),YgEs.FromError(e));
		}
	}

	tp.Receive=(epid_from,epid_to,pack)=>{
		if(!checkReady())return;

		tp.GetLogger().Tick(()=>'Transport received '+epid_from+'=>'+epid_to+': '+pack);

		let ep=tp._private_.endpoint[epid_to];
		if(!ep){
			tp.GetLogger().Notice(()=>'EndPoint '+epid_to+' not found in Transport '+tp.Name);
			return;
		}

		try{
			// receive to destination endpoint 
			let data=onUnpack(pack);
			for(let d of data){
				ep._private_.receive(epid_from,d);
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
		OnSend:(ep,epid_to,pack)=>{
			let epid_from=ep.GetInstanceID();
			tp.Receive(epid_from,epid_to,pack);
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
