// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import YgEs from './common.js';
import HappeningManager from './happening.js';
import Engine from './engine.js';
import StateMachine from './stmac.js';
import Util from './util.js';

// Agent -------------------------------- //
(()=>{ // local namespace 

// state 
const _state_names=Object.freeze(['IDLE','BROKEN','DOWN','REPAIR','UP','REST','TROUBLE','HEALTHY']);

// make reverse lookup 
let ll={}
for(let i in _state_names)ll[_state_names[i]]=parseInt(i);
const _state_lookup=Object.freeze(ll);

function _standby(prm){

	let opencount=0;
	let ctrl=null;
	let ready=false;
	let halt=false;
	let restart=false;
	let aborted=false;
	let wait=[]

	let name=prm.name??'YgEs_Agent';
	let happen=prm.happen??HappeningManager.createLocal();
	let launcher=prm.launcher??Engine.createLauncher();
	let user=prm.user??{};

	let getInfo=(phase)=>{
		return {
			name:name,
			phase:phase,
			state:ctrl?ctrl.getCurState():'NONE',
			wait:wait,
			user:user,
		}
	}

	let states={
		'IDLE':{
			poll_keep:(ctrl,user)=>{
				if(opencount<1)return true;
				restart=false;

				happen.cleanup();
				return happen.isCleaned()?'UP':'REPAIR';
			},
		},
		'BROKEN':{
			poll_keep:(ctrl,user)=>{
				if(opencount<1)return true;
				restart=false;

				return 'REPAIR';
			},
		},
		'REPAIR':{
			cb_start:(ctrl,user)=>{

				try{
					//start repairing 
					wait=[]
					if(prm.cb_repair)prm.cb_repair(agent);
				}
				catch(e){
					happen.happenProp({
						class:'YgEs_Agent_Error',
						cause:'throw from a callback',
						src:getInfo('cb_repair'),
						err:YgEs.fromError(e),
					});
				}
			},
			poll_keep:(ctrl,user)=>{
				if(opencount<1){
					happen.cleanup();
					return happen.isCleaned()?'IDLE':'BROKEN';
				}

				// wait for delendencies 
				let cont=[]
				for(let d of wait){
					try{
						if(d())continue;
						cont.push(d);
					}
					catch(e){
						happen.happenProp({
							class:'YgEs_Agent_Error',
							cause:'throw from a callback',
							src:getInfo('wait for repair'),
							err:YgEs.fromError(e),
						});
					}
				}
				wait=cont;
				if(wait.length>0)return;

				// wait for all happens resolved 
				happen.cleanup();
				if(happen.isCleaned())return 'UP';
			},
		},
		'DOWN':{
			cb_start:(ctrl,user)=>{
				try{
					wait=[]

					// down dependencles too 
					if(prm.dependencies){
						Util.safeDictIter(prm.dependencies,(k,h)=>{
							h.close();
						});
					}

					if(ctrl.getPrevState()=='UP'){
						if(prm.cb_back)prm.cb_back(agent);
					}
					else{
						if(prm.cb_close)prm.cb_close(agent);
					}
				}
				catch(e){
					happen.happenProp({
						class:'YgEs_Agent_Error',
						cause:'throw from a callback',
						src:getInfo('cb_close'),
						err:YgEs.fromError(e),
					});
				}
			},
			poll_keep:(ctrl,user)=>{

				// wait for delendencies 
				let cont=[]
				for(let d of wait){
					try{
						if(d())continue;
						cont.push(d);
					}
					catch(e){
						happen.happenProp({
							class:'YgEs_Agent_Error',
							cause:'throw from a callback',
							src:getInfo('wait for down'),
							err:YgEs.fromError(e),
						});
					}
				}
				wait=cont;
				if(wait.length>0)return null;
				happen.cleanup();
				return happen.isCleaned()?'IDLE':'BROKEN';
			},
		},
		'UP':{
			cb_start:(ctrl,user)=>{
				try{
					wait=[]
					if(prm.cb_open)prm.cb_open(agent);

					// up dependencles too 
					if(prm.dependencies){
						Util.safeDictIter(prm.dependencies,(k,h)=>{
							h.open();
							wait.push(()=>h.isReady());
						});
					}
				}
				catch(e){
					happen.happenProp({
						class:'YgEs_Agent_Error',
						cause:'throw from a callback',
						src:getInfo('cb_open'),
						err:YgEs.fromError(e),
					});
				}
			},
			poll_keep:(user)=>{
				if(opencount<1 || restart)return 'DOWN';

				// wait for delendencies 
				let cont=[]
				for(let d of wait){
					try{
						if(d())continue;
						cont.push(d);
					}
					catch(e){
						happen.happenProp({
							class:'YgEs_Agent_Error',
							cause:'throw from a callback',
							src:getInfo('wait for up'),
							err:YgEs.fromError(e),
						});
					}
				}
				wait=cont;
				if(!happen.isCleaned())return 'DOWN';
				if(wait.length<1)return 'HEALTHY';
			},
			cb_end:(ctrl,user)=>{
				if(ctrl.getNextState()=='HEALTHY'){
					try{
						// mark ready before callback 
						ready=true;
						if(prm.cb_ready)prm.cb_ready(agent);
					}
					catch(e){
						happen.happenProp({
							class:'YgEs_Agent_Error',
							cause:'throw from a callback',
							src:getInfo('cb_ready'),
							err:YgEs.fromError(e),
						});
					}
				}
			},
		},
		'HEALTHY':{
			poll_keep:(ctrl,user)=>{
				if(opencount<1 || restart){
					ready=false;
					return 'DOWN';
				}
				if(!happen.isCleaned())return 'TROUBLE';

				try{
					if(prm.poll_healthy)prm.poll_healthy(agent);
				}
				catch(e){
					happen.happenProp({
						class:'YgEs_Agent_Error',
						cause:'throw from a callback',
						src:getInfo('poll_healthy'),
						err:YgEs.fromError(e),
					});
					return 'TROUBLE';
				}
			},
		},
		'TROUBLE':{
			poll_keep:(ctrl,user)=>{
				if(opencount<1 || restart){
					ready=false;
					return 'DOWN';
				}
				happen.cleanup();
				if(happen.isCleaned())return 'HEALTHY';

				try{
					if(prm.poll_trouble)prm.poll_trouble(agent);
				}
				catch(e){
					happen.happenProp({
						class:'YgEs_Agent_Error',
						cause:'throw from a callback',
						src:getInfo('poll_trouble'),
						err:YgEs.fromError(e),
					});
				}
				if(!happen.isCleaned())return 'HALT';
			},
		},
		'HALT':{
			cb_start:(ctrl,user)=>{
				halt=true;
			},
			poll_keep:(ctrl,user)=>{
				if(opencount<1 || restart){
					ready=false;
					return 'DOWN';
				}
				happen.cleanup();
				if(happen.isCleaned())return 'HEALTHY';
			},
			cb_end:(ctrl,user)=>{
				halt=false;
			},
		},
	}

	let agent={
		name:name,
		User:user,

		isOpen:()=>opencount>0,
		isBusy:()=>!!ctrl || opencount>0,
		isReady:()=>ready && opencount>0,
		isHalt:()=>halt,
		getState:()=>ctrl?ctrl.getCurState():'NONE',

		getLauncher:()=>{return launcher;},
		getHappeningManager:()=>{return happen;},
		getDependencies:()=>{return prm.dependencies;},

		waitFor:(cb)=>{wait.push(cb)},
		restart:()=>{restart=true;},

		fetch:()=>{
			return handle(agent);
		},
		open:()=>{
			let h=agent.fetch();
			h.open();
			return h;
		},
	}

	let ctrlopt={
		name:name+'_Control',
		happen:happen,
		launcher:launcher,
		User:user,
		cb_done:(user)=>{
			ctrl=null;
			aborted=false;
			if(prm.cb_finish)prm.cb_finish(agent,happen.isCleaned());
		},
		cb_abort:(user)=>{
			ctrl=null;
			aborted=true;
			if(prm.cb_abort)prm.cb_abort(agent);
		},
	}

	let handle=(w)=>{
		let in_open=false;
		let h={
			name:name+'_Handle',

			getAgent:()=>{return agent;},
			getLauncher:()=>agent.getLauncher(),
			getHappeningManager:()=>agent.getHappeningManager(),
			getDependencies:()=>agent.getDependencies(),

			isOpenHandle:()=>in_open,
			isOpenAgent:()=>agent.isOpen(),
			isBusy:()=>agent.isBusy(),
			isReady:()=>agent.isReady(),
			isHalt:()=>agent.isHalt(),
			getState:()=>agent.getState(),

			restart:()=>agent.restart(),

			open:()=>{
				if(!in_open){
					in_open=true;
					++opencount;
				}
				if(!ctrl)ctrl=StateMachine.run('IDLE',states,ctrlopt);
			},
			close:()=>{
				if(!in_open)return;
				in_open=false;
				--opencount;
			},
		}
		return h;
	}

	return agent;
}

YgEs.AgentManager={
	name:'YgEs_AgentManager',
	User:{},

	standby:_standby,
	launch:(prm)=>{return _standby(prm).fetch();},
	run:(prm)=>{return _standby(prm).open();},
}

})();
export default YgEs.AgentManager;
