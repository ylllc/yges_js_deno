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
const _state_names=Object.freeze(['IDLE','BROKEN','DOWN','REPAIR','UP','HALT','TROUBLE','HEALTHY']);

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

	let name=prm.Name??'YgEs.Agent';
	let happen=prm.HappenTo??HappeningManager;
	let launcher=prm.Launcher??Engine;
	let user=prm.User??{};

	let GetInfo=(phase)=>{
		return {
			Name:name,
			Phase:phase,
			State:ctrl?ctrl.GetCurState():'NONE',
			Wait:wait,
			User:user,
		}
	}

	let states={
		'IDLE':{
			OnPollInKeep:(ctrl,user)=>{
				if(opencount<1)return true;
				restart=false;

				happen.CleanUp();
				return happen.IsCleaned()?'UP':'REPAIR';
			},
		},
		'BROKEN':{
			OnPollInKeep:(ctrl,user)=>{
				if(opencount<1)return true;
				restart=false;

				return 'REPAIR';
			},
		},
		'REPAIR':{
			OnStart:(ctrl,user)=>{

				try{
					//start repairing 
					wait=[]
					if(prm.OnRepair)prm.OnRepair(agent);
				}
				catch(e){
					happen.HappenProp({
						Class:'YgEs.Agent',
						Cause:'ThrownFromCallback',
						Src:GetInfo('OnRepair'),
						Err:YgEs.FromError(e),
					});
				}
			},
			OnPollInKeep:(ctrl,user)=>{
				if(opencount<1){
					happen.CleanUp();
					return happen.IsCleaned()?'IDLE':'BROKEN';
				}

				// wait for delendencies 
				let cont=[]
				for(let d of wait){
					try{
						if(d())continue;
						cont.push(d);
					}
					catch(e){
						happen.HappenProp({
							Class:'YgEs.Agent',
							Cause:'ThrownFromCallback',
							Src:GetInfo('wait for repair'),
							Err:YgEs.FromError(e),
						});
					}
				}
				wait=cont;
				if(wait.length>0)return;

				// wait for all happens resolved 
				happen.CleanUp();
				if(happen.IsCleaned())return 'UP';
			},
		},
		'DOWN':{
			OnStart:(ctrl,user)=>{
				let back=false;
				try{
					wait=[]

					// down dependencles too 
					if(prm.Dependencies){
						Util.SafeDictIter(prm.Dependencies,(k,h)=>{
							h.Close();
						});
					}

					if(ctrl.GetPrevState()=='UP'){
						back=true;
						if(prm.OnBack)prm.OnBack(agent);
					}
					else{
						if(prm.OnClose)prm.OnClose(agent);
					}
				}
				catch(e){
					happen.HappenProp({
						Class:'YgEs.Agent',
						Cause:'ThrownFromCallback',
						Src:GetInfo(back?'OnBack':'OnClose'),
						Err:YgEs.FromError(e),
					});
				}
			},
			OnPollInKeep:(ctrl,user)=>{

				// wait for delendencies 
				let cont=[]
				for(let d of wait){
					try{
						if(d())continue;
						cont.push(d);
					}
					catch(e){
						happen.HappenProp({
							Class:'YgEs.Agent',
							Cause:'ThrownFromCallback',
							Src:GetInfo('wait for down'),
							Err:YgEs.FromError(e),
						});
					}
				}
				wait=cont;
				if(wait.length>0)return null;
				happen.CleanUp();
				return happen.IsCleaned()?'IDLE':'BROKEN';
			},
		},
		'UP':{
			OnStart:(ctrl,user)=>{
				try{
					wait=[]
					if(prm.OnOpen)prm.OnOpen(agent);

					// up dependencles too 
					if(prm.Dependencies){
						Util.SafeDictIter(prm.Dependencies,(k,h)=>{
							h.Open();
							wait.push(()=>h.IsReady());
						});
					}
				}
				catch(e){
					happen.HappenProp({
						Class:'YgEs.Agent',
						Cause:'ThrownFromCallback',
						Src:GetInfo('OnOpen'),
						Err:YgEs.FromError(e),
					});
				}
			},
			OnPollInKeep:(user)=>{
				if(opencount<1 || restart)return 'DOWN';

				// wait for delendencies 
				let cont=[]
				for(let d of wait){
					try{
						if(d())continue;
						cont.push(d);
					}
					catch(e){
						happen.HappenProp({
							Class:'YgEs.Agent',
							Cause:'ThrownFromCallback',
							Src:GetInfo('wait for up'),
							Err:YgEs.FromError(e),
						});
					}
				}
				wait=cont;
				if(!happen.IsCleaned())return 'DOWN';
				if(wait.length<1)return 'HEALTHY';
			},
			OnEnd:(ctrl,user)=>{
				if(ctrl.GetNextState()=='HEALTHY'){
					try{
						// mark ready before callback 
						ready=true;
						if(prm.OnReady)prm.OnReady(agent);
					}
					catch(e){
						happen.HappenProp({
							Class:'YgEs.AgentError',
							Cause:'throw from a callback',
							Src:GetInfo('OnReady'),
							Err:YgEs.FromError(e),
						});
					}
				}
			},
		},
		'HEALTHY':{
			OnPollInKeep:(ctrl,user)=>{
				if(opencount<1 || restart){
					ready=false;
					return 'DOWN';
				}
				if(!happen.IsCleaned())return 'TROUBLE';

				try{
					if(prm.OnPollInHealthy)prm.OnPollInHealthy(agent);
				}
				catch(e){
					happen.HappenProp({
						Class:'YgEs.AgentError',
						Cause:'throw from a callback',
						Src:GetInfo('OnPollInHealthy'),
						Err:YgEs.FromError(e),
					});
					return 'TROUBLE';
				}
			},
		},
		'TROUBLE':{
			OnPollInKeep:(ctrl,user)=>{
				if(opencount<1 || restart){
					ready=false;
					return 'DOWN';
				}
				happen.CleanUp();
				if(happen.IsCleaned())return 'HEALTHY';

				try{
					if(prm.OnPollInTrouble)prm.OnPollInTrouble(agent);
				}
				catch(e){
					happen.HappenProp({
							Class:'YgEs.AgentError',
							Cause:'throw from a callback',
							Src:GetInfo('OnRecover'),
							Err:YgEs.FromError(e),
					});
				}
				if(!happen.IsCleaned())return 'HALT';
			},
		},
		'HALT':{
			OnStart:(ctrl,user)=>{
				halt=true;
			},
			OnPollInKeep:(ctrl,user)=>{
				if(opencount<1 || restart){
					ready=false;
					return 'DOWN';
				}
				happen.CleanUp();
				if(happen.IsCleaned())return 'HEALTHY';
			},
			OnEnd:(ctrl,user)=>{
				halt=false;
			},
		},
	}

	let agent={
		name:name,
		User:user,

		IsOpen:()=>opencount>0,
		IsBusy:()=>!!ctrl || opencount>0,
		IsReady:()=>ready && opencount>0,
		IsHalt:()=>halt,
		GetState:()=>ctrl?ctrl.GetCurState():'NONE',

		GetLauncher:()=>{return launcher;},
		GetHappeningManager:()=>{return happen;},
		GetDependencies:()=>{return prm.Dependencies;},

		WaitFor:(cb)=>{wait.push(cb)},
		Restart:()=>{restart=true;},

		Fetch:()=>{
			return handle(agent);
		},
		Open:()=>{
			let h=agent.Fetch();
			h.Open();
			return h;
		},
	}

	let ctrlopt={
		Name:name+'_Control',
		HappenTo:happen,
		Launcher:launcher,
		User:user,
		OnDone:(user)=>{
			ctrl=null;
			aborted=false;
			if(prm.OnFinish)prm.OnFinish(agent,happen.IsCleaned());
		},
		OnAbort:(user)=>{
			ctrl=null;
			aborted=true;
			if(prm.OnAbort)prm.OnAbort(agent);
		},
	}

	let handle=(w)=>{
		let in_open=false;
		let h={
			name:name+'_Handle',

			GetAgent:()=>{return agent;},
			GetLauncher:()=>agent.GetLauncher(),
			GetHappeningManager:()=>agent.GetHappeningManager(),
			GetDependencies:()=>agent.GetDependencies(),

			IsOpenHandle:()=>in_open,
			IsOpenAgent:()=>agent.IsOpen(),
			IsBusy:()=>agent.IsBusy(),
			IsReady:()=>agent.IsReady(),
			IsHalt:()=>agent.IsHalt(),
			GetState:()=>agent.GetState(),

			Restart:()=>agent.Restart(),

			Open:()=>{
				if(!in_open){
					in_open=true;
					++opencount;
				}
				if(!ctrl){
					ctrl=StateMachine.Run('IDLE',states,ctrlopt);
					let StMacInfo=ctrl.GetInfo;
					ctrl.GetInfo=()=>{
						return {
							'StMac':StMacInfo(),
							'Agent':GetInfo(''),
						}
					}
				}
			},
			Close:()=>{
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
	name:'YgEs.AgentManager',
	User:{},

	StandBy:_standby,
	Launch:(prm)=>{return _standby(prm).Fetch();},
	Run:(prm)=>{return _standby(prm).Open();},
}

})();
export default YgEs.AgentManager;
