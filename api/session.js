// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2025 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import YgEs from './common.js';
import Agent from './agent.js';

// Session ------------------------------ //
(()=>{ // local namespace 

function _session_new(opt={}){

	const sid=opt.SID??YgEs.NextID();

	const onOpen=opt.OnOpen??((agent)=>{});
	const onReady=opt.OnReady??((agent)=>{});

	const plss=opt.PayloadSpecs??{}
	const plrs=opt.PayloadReceivers??null

	let prm=Object.assign(opt,{
		AgentBypasses:['GetInstanceID','Join','Leave'],
		OnOpen:(agent)=>{
			onOpen(agent);
		},
		OnReady:(agent)=>{
			onReady(agent);
		},
	});
	if(!prm.Name)prm.Name='YgEs.Session';

	let sess=Agent.StandBy(prm);
	sess._private_={
		host:null,
		members:{},
	}

	sess.GetInstanceID=()=>sid;
	sess.IsJoined=(epid)=>!!sess._private_.members[epid];

	const checkReady=()=>{
		if(!sess.IsReady()){
			sess.GetLogger().Fatal('Session '+sid+' is not ready');
			return false;
		}
		return true;
	}

	sess.Join=(epid)=>{
		if(sess._private_.members[epid]){
			sess.GetLogger().Warn('EndPoint '+epid+' already joined');
			return;
		}
		sess._private_.members[epid]={}
	}
	sess.Leave=(epid)=>{
		if(!sess._private_.members[epid]){
			sess.GetLogger().Warn('EndPoint '+epid+' already left');
			return;
		}
		delete sess._private_.members[epid];
	}

	sess._private_.receive=(ep_to,epid_from,plt,pl)=>{
		if(!checkReady())return;

		if(!sess.IsJoined(epid_from)){
			sess.GetLogger().Notice('EndPoint '+epid_from+' is not in session '+sid);
			return;
		}

		let epid_to=ep_to.GetInstanceID();
		if(epid_to!=null && !sess.IsJoined(epid_to)){
			sess.GetLogger().Notice('EndPoint '+epid_to+' is not in session '+sid);
			return;
		}

		if(!plrs){
			// receive plain payload 
			ep_to._private_.receive(epid_from,pl);
		}
		else{
			// receive by payload type 	
			let pls=(plt==null)?null:plss[plt];
			let plr=(plt==null)?null:plrs[plt];
			if(!plr){
				sess.GetLogger().Notice(()=>'Receiver not defined: '+plt);
			}
			else if(!pls?.QuickCall){
				// call queue 
				sess.GetLogger().Tick(()=>'Payload queued '+epid_from+' => '+epid_to,pl);
				ep_to._private_.recvq.push({
					From:epid_from,
					Payload:pl,
					Spec:pls,
					Call:()=>{
						pls._private_.OnReceived(ep_to,epid_from);
						plr(ep_to,epid_from,pl);
					},
				});
			}
			else{
				// call now 
				pls._private_.OnReceived(ep_to,epid_from);
				plr(ep_to,epid_from,pl);
			}
		}
	}

	return sess;
}

let Session=YgEs.Session={
	Name:'YgEs.Session.Container',
	User:{},
	_private_:{},

	Create:_session_new,
}

})();
export default YgEs.Session;
