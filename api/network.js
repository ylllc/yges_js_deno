// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2025 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import YgEs from './common.js';
import Agent from './agent.js';
import Log from './logger.js';

// Network Drivers ---------------------- //
(()=>{ // local namespace 

function _recvctrl_new(){

	let ct={
	}
	return ct;
}

function _recvctrlset_new(){

	let ctset={target:{}}
	ctset.Get=(k)=>{
		return ctset.target[k]??null;
	}
	ctset.Ref=(k)=>{
		let t=ctset.target[k];
		if(!t)t=ctset.target[k]=_recvctrl_new();
		return t;
	}
	ctset.Each=(cb)=>{
		for(let k in ctset.target)cb(k,ctset.target[k]);
	}
	return ctset;
}

function _driver_new(opt={}){

	opt=YgEs.Validate(opt,{Others:true,Struct:{
		Name:{Literal:true,Default:'YgEs.NetworkDriver'},
		Trace_Network:{Boolable:true},
		Log:{Class:'YgEs.LocalLog',Default:Log},
		AgentBypasses:{List:{Literal:true}},
		ToughOut:{Struct:{
			Unorderable:{Boolable:true,Default:false},
			DelayMin:{Integer:true,Default:0},
			DelayMax:{Integer:true,Default:0},
			DubRatio:{Numeric:true,Default:0.0},
			DubIntervalMin:{Integer:true,Default:0},
			DubIntervalMax:{Integer:true,Default:0},
		}},
		ToughIn:{Struct:{
			Unorderable:{Boolable:true,Default:false},
			DelayMin:{Integer:true,Default:0},
			DelayMax:{Integer:true,Default:0},
			DubRatio:{Numeric:true,Default:0.0},
			DubIntervalMin:{Integer:true,Default:0},
			DubIntervalMax:{Integer:true,Default:0},
		}},
		OnGate:{Callable:true,Default:(driver,rawdata)=>rawdata},
		OnDecode:{Callable:true,Default:(driver,rawdata)=>{
			try{
				return JSON.parse(rawdata);
			}
			catch(e){
				return null;
			}
		}},
		OnEncode:{Callable:true,Default:(sender,contents,prop)=>{
			return JSON.stringify(contents);
		}},
		OnSend:{Callable:true,Default:(sender,rawdata,prop)=>{
			log.Fatal('OnSend is not impremented in Sender',rawdata);
		}},
	}},'opt');

	opt.AgentBypasses.push('IsListening','GetConnectionName',
		'GetTransport','CutOff','Receive','Send');

	const onClose=opt.OnClose??((agent)=>{});
	opt.OnClose=(agent)=>{

		driver.CutOff();
		onClose(agent);
	}

	const checkReady=()=>{
		if(!driver.IsReady()){
			log.Fatal('NetworkDriver ('+driver.GetCaption()+') is not ready');
			return false;
		}
		return true;
	}

	const callSend=(rawdata,prop)=>{

		priv.trace(()=>'sending from NetworkDriver ('+driver.GetCaption()+')');

		opt.OnSend(driver,rawdata,prop);
		if(opt.ToughOut.DubRatio<=0)return;
		if(Math.random()>=opt.ToughOut.DubRatio)return;

		priv.trace(()=>'dubs sending on NetworkDriver ('+driver.GetCaption()+')');

		let delay=(opt.DubIntervalMax<1)?0:
			(opt.ToughOut.DubIntervalMin+Math.random()*(opt.ToughOut.DubIntervalMax-opt.ToughOut.DubIntervalMin));
		launch_out.Delay(delay,()=>callSend(rawdata,prop));
	}

	const callRecv=(contents,prop)=>{

		let tp=driver.GetTransport();
		if(!tp){
			log.Notice('NetworkDriver ('+driver.GetCaption()+') already cutoff',contents);
			return;
		}
		tp._recv(contents,prop);

		if(opt.ToughIn.DubRatio<=0)return;
		if(Math.random()>=opt.ToughIn.DubRatio)return;

		let delay=(opt.DubIntervalMax<1)?0:
			(opt.ToughIn.DubIntervalMin+Math.random()*(opt.DubIntervalMax-opt.ToughIn.DubIntervalMin));
		launch_in.Delay(delay,()=>callRecv(contents,prop));
	}

	let log=opt.Log;
	let driver=Agent.StandBy(opt);
	const launch_in=driver.GetLauncher().CreateLauncher({Limit:opt.ToughIn.Unorderable?-1:1});
	const launch_out=driver.GetLauncher().CreateLauncher({Limit:opt.ToughOut.Unorderable?-1:1});
	const priv=driver.Extend('YgEs.NetworkDriver',{
		// private 
		tracing_network:opt.Trace||opt.Trace_Network,

		// control set 
		cset:_recvctrlset_new(),

		// receiver handle for conecting Transport 
		// caution: 
		// Sender not recognize connecting Transport 
		// and can connect from many Transport 
		h4t:null,

		trace:(msg)=>{
			if(!priv.tracing_network)return;
			log.Trace(msg);
		},
	},{
		// public
		SetTracing_Network:(side)=>priv.tracing_network=!!side,

		IsListening:()=>!!priv.h4t,
		GetConnectionName:()=>{
			if(!priv.h4t)return undefined;
			return priv.h4t.GetConnectionName();
		},
		GetTransport:()=>{
			if(!priv.h4t)return undefined;
			return priv.h4t.GetTransport();
		},
		CutOff:()=>{
			let rh=priv.h4t;
			if(!rh)return;
			priv.h4t=null;
			rh.Close();
		},

		Receive:(rawdata,prop={})=>{

			if(!priv.h4t){
				priv.trace(()=>'NetworkDriver ('+driver.GetCaption()+') not attached to a Transport, abandon it');
				return;
			}
			if(!driver.IsReady()){
				priv.trace(()=>'NetworkDriver ('+driver.GetCaption()+') received, but out of the service, abandon it');
				return;
			}

			rawdata=opt.OnGate(driver,rawdata,prop);
			if(!rawdata){
				priv.trace(()=>'NetworkDriver ('+driver.GetCaption()+') received invalid');
				return;
			}

			let contents=opt.OnDecode(driver,rawdata,prop);
			if(!contents){
				priv.trace(()=>'NetworkDriver ('+driver.GetCaption()+') received broken');
				return;
			}

			priv.trace(()=>'NetworkDriver ('+driver.GetCaption()+') received');

			if(opt.DelayMax<1){
				callRecv(contents,prop);
			}
			else{
				let delay=(opt.DelayMax<1)?0:
					(opt.ToughIn.DelayMin+Math.random()*(opt.ToughIn.DelayMax-opt.ToughIn.DelayMin));
				launch_in.Delay(delay,()=>callRecv(contents,prop));
			}
		},

		Send:(contents,prop={})=>{
			if(!checkReady())return;

			let rawdata=opt.OnEncode(driver,contents,prop);

			if(opt.DelayMax<1){
				callSend(rawdata,prop);
			}
			else{
				let delay=(opt.DelayMax<1)?0:
					(opt.ToughOut.DelayMin+Math.random()*(opt.ToughOut.DelayMax-opt.ToughOut.DelayMin));
				launch_out.Delay(delay,()=>callSend(rawdata,prop));
			}
		},

		// friends 
		_connectReceiverFromTransport:(name,tp)=>{

			priv.trace(()=>'new Receiver connection named '+name+' for a Transport '+tp.GetCaption());

			let rh=priv.h4t=driver.Fetch();
			rh.Extend('ReceiverFromTransport',{
				// private 
			},{
				// public 
				GetConnectionName:()=>name,
				GetTransport:()=>tp,
			});
			if(tp.IsOpen())rh.Open();

			return rh;
		},

		_connectSenderFromTransport:(name,tp)=>{

			priv.trace(()=>'new Sender connection named '+name+' for a Transport '+tp.GetCaption());

			let sh=driver.Fetch();
			sh.Extend('SenderFromTransport',{
				// private 
			},{
				// public 
				GetConnectionName:()=>name,
				GetTransport:()=>tp,
			});
			if(tp.IsOpen())sh.Open();

			return sh;
		},
	});

	const agent_SetTracing=driver.Inherit('SetTracing',(side)=>{
		agent_SetTracing(side);
		driver.SetTracing_Network(side);
	});

	return driver;
}

function _loopback_new(opt={}){

	opt=YgEs.Validate(opt,{Others:true,Struct:{
		Name:{Literal:true,Default:'YgEs.Sender.Loopback'},
		Log:{Class:'YgEs.LocalLog',Default:Log},
		Dependencies:{List:{Class:'YgEs.Handle'}},
	}},'opt');

	let log=opt.Log;

	opt.OnSend=(driver,rawdata,prop)=>{
		driver.Receive(rawdata,prop);
	}

	let driver=_driver_new(opt);
	driver.Trait('YgEs.Sender.Loopback',{
		// private 
	},{
		// public 
	});

	return driver;
}

function _terminate_new(opt={}){

	opt=YgEs.Validate(opt,{Others:true,Struct:{
		Name:{Literal:true,Default:'YgEs.Sender.Terminate'},
		Log:{Class:'YgEs.LocalLog',Default:Log},
	}},'opt');

	let log=opt.Log;

	opt.OnSend=(driver,rawdata,prop)=>{
		log.Tick('Sending terminated',rawdata);
	}

	let driver=_driver_new(opt);
	driver.Trait('YgEs.Sender.Terminate',{
		// private 
	},{
		// public 
	});

	return driver;
}

function _tpctrl_new(){

	let ct={
		SendQ:[],
	}
	return ct;
}

function _tpctrlset_new(){

	let ctset={target:{}}
	ctset.Get=(k)=>{
		return ctset.target[k]??null;
	}
	ctset.Ref=(k)=>{
		let t=ctset.target[k];
		if(!t)t=ctset.target[k]=_tpctrl_new();
		return t;
	}
	ctset.Each=(cb)=>{
		for(let k in ctset.target)cb(k,ctset.target[k]);
	}
	return ctset;
}

function _transport_new(opt={}){

	opt=YgEs.Validate(opt,{Others:true,Struct:{
		Name:{Literal:true,Default:'YgEs.Transport'},
		Trace_Transport:{Boolable:true},
		Log:{Class:'YgEs.LocalLog',Default:Log},
		AgentBypasses:{List:{Literal:true}},
		PIDPrefix:{Literal:true,Default:''},
		PayloadSpecs:{Dict:{Struct:true}},
		PayloadHooks:{Dict:{Struct:true}},
	}},'opt');
	let log=opt.Log;

	opt.AgentBypasses.push(
		'GetPayloadSpecs',
		'AttachReceiver','DetachReceiver',
		'AttachSender','DetachSender',
		'SetSelector',
		'GetEndPoint','Connect','Disconnect',
		'NewProtocol','ExpireProtocol',
	);

	const onOpen=opt.OnOpen??((agent)=>{});
	opt.OnOpen=(agent)=>{
		onOpen(agent);

		// open attached 
		for(let k in priv.recver){
			priv.recver[k].Open();
		}
		for(let k in priv.sender){
			priv.sender[k].Open();
		}
		// endpoints not open, should control by userside 
		// Transport opened by an EndPoint automatically 

		// wait for senders ready 
		agent.WaitFor('Senders',()=>{
			for(let k in priv.sender){
				if(!priv.sender[k].IsReady())return false;
			}
			return true;
		});

		// receivers and endpoints not required ready 
	}

	const onClose=opt.OnClose??((agent)=>{});
	opt.OnClose=(agent)=>{
		onClose(agent);

		// close attached 
		for(let k in priv.sender){
			priv.sender[k].Close();
		}
		for(let k in priv.recver){
			priv.recver[k].Close();
		}
	}

	const checkReady=()=>{
		if(!tp.IsReady()){
			log.Fatal('Transport ('+tp.GetCaption()+') is not ready');
			return false;
		}
		return true;
	}

	let tp=Agent.StandBy(opt);
	const priv=tp.Extend('YgEs.Transport',{
		// private 

		// control set 
		cset:_tpctrlset_new(),
		// attached Receiver 
		recver:{},
		// attached Sender
		sender:{},
		// connected EndPoint 
		ep:{},
		// active Protocol 
		prot:{},
		// selector 
		selector:null,

		tracing_transport:opt.Trace||opt.Trace_Transport,

		trace:(msg)=>{
			if(!priv.tracing_transport)return;
			log.Trace(msg);
		},
	},{
		// public 
		SetTracing_Transport:(side)=>priv.tracing_transport=!!side,

		GetPayloadSpecs:()=>opt.PayloadSpecs,

		GetEndPoint:(name)=>priv.ep[name]?.GetAgent(),

		AttachReceiver:(name,recver)=>{

			priv.trace(()=>'Receiver ('+recver.GetCaption()+') attaching as '+name+' on Transport ('+tp.Name+')');

			if(priv.recver[name]){
				log.Warn('Receiver['+name+'] already exists, replace it');
				tp.DetachReceiver(name);
			}

			recver=recver.GetAgent();
			if(recver.IsListening()){
				log.Warn('Receiver ('+recver.GetCaption()+') already connected, cut off it');
				recver.GetTransport().DetachReceiver(recver.GetConnectionName());
			}

			priv.recver[name]=recver._connectReceiverFromTransport(name,tp);
		},

		DetachReceiver:(name)=>{
			let rh=priv.recver[name];
			if(!rh)return;
			delete priv.recver[name];

			priv.trace(()=>'Receiver ('+rh.GetReceiver().GetCaption()+') detaching from Transport ('+tp.GetCaption()+')');

			rh.GetReceiver().CutOff();
		},

		AttachSender:(name,sender)=>{

			priv.trace(()=>'Sender ('+sender.GetCaption()+') attaching as '+name+' on Transport ('+tp.GetCaption()+')');

			if(priv.sender[name]){
				log.Warn('Sender['+name+'] already exists, replace it');
				tp.DetachSender(name);
			}

			sender=sender.GetAgent();

			priv.sender[name]=sender._connectSenderFromTransport(name,tp);
		},

		DetachSender:(name)=>{
			let sh=priv.sender[name];
			if(!sh)return;
			delete priv.sender[name];

			priv.trace(()=>'Sender ('+sh.GetSender().GetCaption()+') detaching from Transport ('+tp.GetCaption()+')');
		},

		SetSelector:(cb_sel)=>{
			priv.selector=cb_sel;
		},

		Connect:(name,ep)=>{

			priv.trace(()=>'EndPoint ('+ep.GetCaption()+') connecting as '+name+' on Transport ('+tp.GetCaption()+')');

			if(priv.ep[name]){
				log.Warn('EndPoint['+name+'] already exists, replace it');
				tp.Disconnect(name);
			}

			ep=ep.GetAgent();
			if(ep.IsConnected()){
				log.Warn('EndPoint ('+ep.GetCaption()+') already connected, cut off it');
				ep.GetTransport().Disconnect(eh.GetConnectionName());
			}

			priv.ep[name]=ep._connectEndPointFromTransport(name,tp);
		},

		Disconnect:(name)=>{
			let eh=priv.ep[name];
			if(!eh)return;
			delete priv.ep[name];

			priv.trace(()=>'EndPoint ('+eh.GetEndPoint().GetCaption()+') detaching from Transport ('+tp.GetCaption()+')');
		},

		NewProtocol:(epn,opt2={})=>{

			if(!priv.ep[epn]){
				log.Fatal('EndPoint('+epn+') not found in this Transport ('+tp.GetCaption()+')');
				return null;
			}

			let pid=opt2.PID;
			if(pid==undefined){
				do{
					pid=''+opt.PIDPrefix+YgEs.NextID();
				}while(priv.prot[pid]);
			}

			let prot=_protocol_new(tp,epn,pid,opt2);
			priv.prot[pid]=prot;
			return prot;
		},

		ExpireProtocol:(pid)=>{
			if(!priv.prot[pid])return;
			delete priv.prot[pid];
		},

		// friends 
		_launch:(pid,from,target,type,body,prop)=>{
			if(!checkReady())return;

			if(!priv.selector){
				log.Fatal(()=>'Transport ('+tp.GetCaption()+') has no selector to send');
				return;
			}

			let sn=priv.selector(tp,target,prop);
			if(sn==null){
				log.Fatal(()=>'Transport ('+tp.GetCaption()+') has no sender to send to '+target);
				return;
			}

			let cset=priv.cset.Ref(sn);
			let content={PID:pid,From:from,To:target,Type:type,Body:body}

			priv.trace(()=>'Transport ('+tp.GetCaption()+') launch on sender named '+sn+' to '+target,content);

			// queue this payload until kick() called 
			cset.SendQ.push(content);
		},
		_kick:(target,prop)=>{
			if(!checkReady())return;

			if(!priv.selector){
				log.Fatal(()=>'Transport ('+tp.GetCaption()+') has no selector to send');
				return;
			}

			let sn=priv.selector(tp,target,prop);
			if(!sn){
				log.Fatal(()=>'Transport ('+tp.GetCaption()+') has no sender to send to '+target);
				return;
			}

			let sender=priv.sender[sn];
			if(!sender){
				log.Fatal(()=>'Transport ('+tp.GetCaption()+') not recognized sender named '+sn);
				return;
			}

			// SendQ required 
			let cs=priv.cset.Get(sn);
			if(!cs)return;

			priv.trace(()=>'Transport ('+tp.GetCaption()+') kick a queue to sender named '+sn,cs.SendQ);

			// flush SendQ 
			let sq=cs.SendQ;
			if(sq.length<1)return;
			cs.SendQ=[]
	
			sender.Send(sq,prop);
		},
		_kickAll:(prop)=>{
			if(!checkReady())return;

			for(let sn in priv.sender){
				let sender=priv.sender[sn];
				let cs=priv.cset.Get(sn);
				if(!cs)continue;

				// flush SendQ 
				let sq=cs.SendQ;
				if(sq.length<1)return;
				cs.SendQ=[]
				sender.Send(sq,prop);
			}
		},
		_recv:(contents,prop)=>{
			if(!tp.IsReady()){
				priv.trace('Transport ('+tp.GetCaption()+') received out of the service, abandon it');
				return;
			}

			for(let pl of contents){
				let plt=pl.Type;
				if(plt==null){
					// endpoint call 
					let eh=priv.ep[pl.To];
					if(!eh){
						log.Notice(()=>'EndPoint ('+pl.To+') not found');
						continue;
					}
					eh.GetAgent()._come(pl.From,pl.Body,prop);
					continue;
				}


				let pls=opt.PayloadSpecs[plt];
				if(!pls){
					log.Notice(()=>'undefined payload type: '+plt);
					continue;
				}

				let pid=pl.PID;
				if(pid==null){
					// request from a guest 
					let cb=opt.PayloadHooks[plt]?.OnRequest;
					if(!cb){
						log.Notice(()=>'no hooks OnRequest of payload type: '+plt);
					}
					else{
						cb(tp,pl,prop);
					}
				}
				else{
					let cb=null;
					let prot=priv.prot[pid];
					if(!prot){
						// handshaking 
						cb=opt.PayloadHooks[plt]?.OnBound;
						if(!cb){
							log.Notice(()=>'no hooks OnBound of payload type: '+plt,pl);
						}
						else{
							let epn=cb(tp,pl,prop);
							if(epn==null){
								priv.trace(()=>'no handing EndPoint');
							}
							else{
								prot=tp.NewProtocol(epn,{PID:pid});
								if(prot){
									priv.trace(()=>'handing accepted by EndPoint ('+epn+')');
								}
							}
						}
					}
					if(!prot)continue;

					if(pls.UnlockOnce){
						for(let n of pls.UnlockOnce){
							prot.Unlock(n);
						}
					}

					// receivements 
					cb=opt.PayloadHooks[plt]?.OnRespond;
					if(cb && !cb(tp,prot,pl,prop)){
						priv.trace(()=>'end of Protocol ('+pid+')');
						tp.ExpireProtocol(pid);
					}
				}
			}
		},
	});

	const agent_SetTracing=tp.Inherit('SetTracing',(side)=>{
		agent_SetTracing(side);
		tp.SetTracing_Transport(side);
	});

	return tp;
}

function _protocol_new(tp,epn,pid,opt={}){

	opt=YgEs.Validate(opt,{Others:true,Struct:{
		Name:{Literal:true,Default:'YgEs.Protocol'},
		Log:{Class:'YgEs.LocalLog',Default:tp.GetLogger()},
		User:{Struct:true},
	}},'opt');
	let log=opt.Log;

	let prot=YgEs.SoftClass(opt.Name,opt.User);
	let priv=prot.Extend('YgEs.Protocol',{
		// private 
		pid:pid,
		tp:tp,
		calling:{},
	},{
		// public 
		GetPID:()=>pid,
		GetTransport:()=>tp,
		GetEndPoint:()=>tp.GetEndPoint(epn),

		Release:()=>{
			tp.ExpireProtocol(pid);
		},

		Launch:(target,type,body,prop={})=>{

			let pls=tp.GetPayloadSpecs()[type];
			if(!pls){
				log.Notice(()=>'undefined payload type: '+plt);
				return;
			}

			if(pls.CallOnce?.Limit){
				// this payload type is locked until reply or timeout 
				let now=Date.now();
				let cng=priv.calling[type];
				if(cng){
					// already calls with same payload type 
					if(cng.Timeout==null || cng.Timeout>now){
						log.Notice(()=>'Protocol ('+pid+') locked type '+type,body);
						return;
					}
				}
				else cng=priv.calling[type]={}
				cng.Timeout=(pls.CallOnce.Timeout)?(now+pls.CallOnce.Timeout):null;
			}

			tp._launch(pid,epn,target,type,body,prop);
		},
		Kick:(target,prop={})=>{
			tp._kick(target,prop);
		},
		KickAll:(prop={})=>{
			tp._kickAll(prop);
		},
		Send:(target,type,body,prop={})=>{
			prot.Launch(target,type,body,prop);
			prot.Kick(target,prop);
		},

		Unlock:(type)=>{
			if(!priv.calling[type])return;
			log.Trace(()=>'Protocol ('+pid+') unlock '+type);
			delete priv.calling[type];
		},
	});

	return prot;
}

function _endpoint_new(opt={}){

	opt=YgEs.Validate(opt,{Others:true,Struct:{
		Name:{Literal:true,Default:'YgEs.EndPoint'},
		Trace_EndPoint:{Boolable:true},
		Log:{Class:'YgEs.LocalLog',Default:Log},
		AgentBypasses:{List:{Literal:true}},
		OnCome:{Callable:true,Default:(from,body)=>{}},
	}},'opt');

	let log=opt.Log;

	opt.AgentBypasses.push(
		'SetTracing_EndPoint',
		'IsConnected',
		'GetTransportName','Launch','Kick','KickAll','Send'
	);

	const onOpen=opt.OnOpen??((agent)=>{});
	opt.OnOpen=(agent)=>{

		onOpen(agent);

		// wait for connected transport ready 
		if(priv.tp)priv.tp.Open();
		agent.WaitFor('Transport',()=>{
			if(!priv.tp)return true;
			return priv.tp.IsReady();
		});
	}

	const onClose=opt.OnClose??((agent)=>{});
	opt.OnClose=(agent)=>{

		if(priv.tp)priv.tp.Close();
		onClose(agent);
	}

	const checkReady=()=>{
		if(!ep.IsReady()){
			log.Fatal('EndPoint ('+ep.GetCaption()+') is not ready');
			return false;
		}
		return true;
	}

	const checkConnected=()=>{
		if(!priv.tp){
			log.Fatal('EndPoint ('+ep.GetCaption()+') is not connected to a Transport');
			return false;
		}
		return true;
	}

	let ep=Agent.StandBy(opt);

	let priv=ep.Extend('YgEs.EndPoint',{
		// private
		tracing_endpoint:opt.Trace||opt.Trace_EndPoint,

		// connected Transport 
		tp:null,

		trace:(msg)=>{
			if(!priv.tracing_endpoint)return;
			log.Trace(msg);
		},
	},{
		// public
		SetTracing_EndPoint:(side)=>priv.tracing_agent=!!side,

		IsConnected:()=>!!priv.tp,
		GetTransport:()=>{
			if(!priv.tp)return undefined;
			return priv.tp.GetAgent();
		},

		Launch:(target,type,body,prop={})=>{
			if(!checkConnected())return;

			let tp=ep.GetTransport();
			tp._launch(null,priv.tp.GetConnectionName(),target,type,body,prop);
		},
		Kick:(target,prop={})=>{
			if(!checkConnected())return;

			let tp=ep.GetTransport();
			tp._kick(target,prop);
		},
		KickAll:(prop)=>{
			if(!checkConnected())return;

			let tp=ep.GetTransport();
			tp._kickAll(prop);
		},
		Send:(target,type,body,prop={})=>{
			ep.Launch(target,type,body,prop);
			ep.Kick(target,prop);
		},

		// friends 
		_connectEndPointFromTransport:(name,tp)=>{

			priv.trace(()=>'new EndPoint connection named '+name+' for a Transport '+tp.GetCaption());

			let th=priv.tp=tp.Fetch();
			th.Extend('TransportFromEndPoint',{
				// private 
			},{
				// public 
				GetConnectionName:()=>name,
				GetEndPoint:()=>ep,
			});

			let eh=ep.Fetch();
			eh.Extend('EndPointFromTransport',{
				// private 
			},{
				// public 
				GetConnectionName:()=>name,
				GetTransport:()=>tp,
			});
			if(ep.IsOpen())th.Open();

			return eh;
		},
		_come:(from,body,prop)=>{
			if(!checkReady())return;

			opt.OnCome(from,body,prop);
		},
	});

	const agent_SetTracing=ep.Inherit('SetTracing',(side)=>{
		agent_SetTracing(side);
		ep.SetTracing_EndPoint(side);
	});

	return ep;
}

let Network=YgEs.Network={
	Name:'YgEs.Network',
	User:{},

	CreateDriver:_driver_new,
	CreateLoopback:_loopback_new,
	CreateTerminator:_terminate_new,

	CreateTransport:_transport_new,
	CreateEndPoint:_endpoint_new,
}

})();
export default YgEs.Network;
