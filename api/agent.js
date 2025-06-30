// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import YgEs from './common.js';
import HappeningManager from './happening.js';
import Log from './logger.js';
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

	prm=YgEs.Validate(prm,{Others:true,Struct:{
		Name:{Literal:true,Default:'YgEs.Agent'},
		User:{Struct:true},
		Log:{Class:'YgEs.LocalLog',Default:Log},
		HappenTo:{Class:'YgEs.HappeningManager',Default:HappeningManager},
		Launcher:{Class:'YgEs.Launcher',Default:Engine},
		AgentBypasses:{List:{Literal:true}},
		UserBypasses:{List:{Literal:true}},
		Dependencies:{Dict:{Class:'YgEs.Handle'}},
		OnOpen:{Callable:true,Default:(agent)=>{}},
		OnClose:{Callable:true,Default:(agent)=>{}},
		OnBack:{Callable:true,Default:(agent)=>{}},
		OnRepair:{Callable:true,Default:(agent)=>{}},
		OnReady:{Callable:true,Default:(agent)=>{}},
		OnTrouble:{Callable:true,Default:(agent)=>{}},
		OnRecover:{Callable:true,Default:(agent)=>{}},
		OnHalt:{Callable:true,Default:(agent)=>{}},
		OnPollInHealthy:{Callable:true,Default:(agent)=>{}},
		OnPollInTrouble:{Callable:true,Default:(agent)=>{}},
		OnFinish:{Callable:true,Default:(agent,cleaned)=>{}},
		OnAbort:{Callable:true,Default:(agent)=>{}},
	}},'prm');

	let states={
		'IDLE':{
			OnPollInKeep:(ctrl,proc)=>{
				if(priv_a.opencount<1)return true;
				priv_a.restart=false;

				prm.HappenTo.CleanUp();
				return prm.HappenTo.IsCleaned()?'UP':'REPAIR';
			},
		},
		'BROKEN':{
			OnPollInKeep:(ctrl,proc)=>{
				if(priv_a.opencount<1)return true;
				priv_a.restart=false;

				return 'REPAIR';
			},
		},
		'REPAIR':{
			OnStart:(ctrl,proc)=>{

				try{
					//start repairing 
					priv_a.wait=[]
					prm.OnRepair(agent);
				}
				catch(e){
					prm.HappenTo.Happen(e,{
						Class:'YgEs.Agent',
						Cause:'ThrownFromCallback',
						Info:agent.GetInfo('OnRepair'),
					});
				}
			},
			OnPollInKeep:(ctrl,proc)=>{
				if(priv_a.opencount<1){
					prm.HappenTo.CleanUp();
					return prm.HappenTo.IsCleaned()?'IDLE':'BROKEN';
				}

				// wait for delendencies 
				let cont=[]
				for(let d of priv_a.wait){
					try{
						if(d.Chk(d.Prop))continue;
						cont.push(d);
					}
					catch(e){
						prm.HappenTo.Happen(e,{
							Class:'YgEs.Agent',
							Cause:'ThrownFromCallback',
							Info:agent.GetInfo('wait for repair'),
						});
					}
				}
				priv_a.wait=cont;
				if(priv_a.wait.length>0)return;

				// wait for all happens resolved 
				prm.HappenTo.CleanUp();
				if(prm.HappenTo.IsCleaned())return 'UP';
			},
		},
		'DOWN':{
			OnStart:(ctrl,proc)=>{
				let back=false;
				try{
					priv_a.wait=[]

					// down dependencles too 
					if(prm.Dependencies){
						Util.SafeDictIter(prm.Dependencies,(k,h)=>{
							h.Close();
						});
					}

					if(ctrl.GetPrevState()=='UP'){
						back=true;
						prm.OnBack(agent);
					}
					else{
						prm.OnClose(agent);
					}
				}
				catch(e){
					prm.HappenTo.Happen(e,{
						Class:'YgEs.Agent',
						Cause:'ThrownFromCallback',
						Info:agent.GetInfo(back?'OnBack':'OnClose'),
					});
				}
			},
			OnPollInKeep:(ctrl,proc)=>{

				// wait for delendencies 
				let cont=[]
				for(let d of priv_a.wait){
					try{
						if(d.Chk(d.Prop))continue;
						cont.push(d);
					}
					catch(e){
						prm.HappenTo.Happen(e,{
							Class:'YgEs.Agent',
							Cause:'ThrownFromCallback',
							Info:agent.GetInfo('wait for down'),
						});
					}
				}
				priv_a.wait=cont;
				if(priv_a.wait.length>0)return null;
				prm.HappenTo.CleanUp();
				return prm.HappenTo.IsCleaned()?'IDLE':'BROKEN';
			},
		},
		'UP':{
			OnStart:(ctrl,proc)=>{
				try{
					priv_a.wait=[]
					prm.OnOpen(agent);

					// up dependencles too 
					if(prm.Dependencies){
						Util.SafeDictIter(prm.Dependencies,(k,h)=>{
							h.Open();
							priv_a.wait.push({
								Label:'Depends '+h.GetAgent().Name,
								Chk:()=>h.IsReady(),
							});
						});
					}
				}
				catch(e){
					prm.HappenTo.Happen(e,{
						Class:'YgEs.Agent',
						Cause:'ThrownFromCallback',
						Info:agent.GetInfo('OnOpen'),
					});
				}
			},
			OnPollInKeep:(ctrl,proc)=>{
				if(priv_a.opencount<1 || priv_a.restart)return 'DOWN';

				// wait for delendencies 
				let cont=[]
				for(let d of priv_a.wait){
					try{
						if(d.Chk(d.Prop))continue;
						cont.push(d);
					}
					catch(e){
						prm.HappenTo.Happen(e,{
							Class:'YgEs.Agent',
							Cause:'ThrownFromCallback',
							Info:agent.GetInfo('wait for up'),
						});
					}
				}
				priv_a.wait=cont;
				if(!prm.HappenTo.IsCleaned())return 'DOWN';
				if(priv_a.wait.length<1)return 'HEALTHY';
			},
			OnEnd:(ctrl,proc)=>{
				if(ctrl.GetNextState()=='HEALTHY'){
					try{
						// mark ready before callback 
						priv_a.ready=true;
						prm.OnReady(agent);
					}
					catch(e){
						prm.HappenTo.Happen(e,{
							Class:'YgEs.AgentError',
							Cause:'ThrownFromCallback',
							Info:agent.GetInfo('OnReady'),
						});
					}
				}
			},
		},
		'HEALTHY':{
			OnPollInKeep:(ctrl,proc)=>{
				if(priv_a.opencount<1 || priv_a.restart){
					priv_a.ready=false;
					return 'DOWN';
				}
				if(!prm.HappenTo.IsCleaned())return 'TROUBLE';

				try{
					prm.OnPollInHealthy(agent);
				}
				catch(e){
					prm.HappenTo.Happen(e,{
						Class:'YgEs.AgentError',
						Cause:'ThrownFromCallback',
						Info:agent.GetInfo('OnPollInHealthy'),
					});
					return 'TROUBLE';
				}
			},
		},
		'TROUBLE':{
			OnStart:(ctrl,proc)=>{
				try{
					prm.OnTrouble(agent);
				}
				catch(e){
					prm.HappenTo.Happen(e,{
						Class:'YgEs.AgentError',
						Cause:'ThrownFromCallback',
						Info:agent.GetInfo('OnTrouble'),
					});
				}
			},
			OnPollInKeep:(ctrl,proc)=>{
				if(priv_a.opencount<1 || priv_a.restart){
					priv_a.ready=false;
					return 'DOWN';
				}
				prm.HappenTo.CleanUp();
				if(prm.HappenTo.IsCleaned())return 'HEALTHY';

				try{
					let c=prm.HappenTo.CountIssues();
					prm.OnPollInTrouble(agent);
					if(c<prm.HappenTo.CountIssues())return 'HALT';
				}
				catch(e){
					prm.HappenTo.Happen(e,{
						Class:'YgEs.AgentError',
						Cause:'ThrownFromCallback',
						Info:agent.GetInfo('OnPollInTrouble'),
					});
					return 'HALT';
				}
			},
			OnEnd:(ctrl,proc)=>{
				if(ctrl.GetNextState()=='HEALTHY'){
					try{
						prm.OnRecover(agent);
					}
					catch(e){
						prm.HappenTo.Happen(e,{
							Class:'YgEs.AgentError',
							Cause:'ThrownFromCallback',
							Info:agent.GetInfo('OnRecover'),
						});
					}
				}
			},
		},
		'HALT':{
			OnStart:(ctrl,proc)=>{
				priv_a.halt=true;

				try{
					prm.OnHalt(agent);
				}
				catch(e){
					prm.HappenTo.Happen(e,{
						Class:'YgEs.AgentError',
						Cause:'ThrownFromCallback',
						Info:agent.GetInfo('OnHalt'),
					});
				}
			},
			OnPollInKeep:(ctrl,proc)=>{
				if(priv_a.opencount<1 || priv_a.restart){
					priv_a.ready=false;
					return 'DOWN';
				}
				prm.HappenTo.CleanUp();
				if(prm.HappenTo.IsCleaned())return 'HEALTHY';
			},
			OnEnd:(ctrl,proc)=>{
				priv_a.halt=false;

				if(ctrl.GetNextState()=='HEALTHY'){
					try{
						prm.OnRecover(agent);
					}
					catch(e){
						prm.HappenTo.Happen(e,{
							Class:'YgEs.AgentError',
							Cause:'ThrownFromCallback',
							Info:agent.GetInfo('OnRecover'),
						});
					}
				}
			},
		},
	}

	let agent=YgEs.SoftClass(prm.Name+'.Worker',prm.User);

	let priv_a=agent.Extend('YgEs.Agent',{
		// private 
		opencount:0,
		ctrl:null,
		ready:false,
		halt:false,
		restart:false,
		aborted:false,
		wait:[],
	},{
		// public 
		IsOpen:()=>priv_a.opencount>0,
		IsBusy:()=>!!priv_a.ctrl || priv_a.opencount>0,
		IsReady:()=>priv_a.ready && priv_a.opencount>0,
		IsHalt:()=>priv_a.halt,
		GetState:()=>priv_a.ctrl?priv_a.ctrl.GetCurState():'NONE',
		GetInfo:(site='')=>{
			let r={
				Name:prm.Name,
				CrashSite:site,
				State:priv_a.ctrl?priv_a.ctrl.GetCurState():'NONE',
				Busy:!!priv_a.ctrl,
				Ready:priv_a.ready,
				Halt:priv_a.halt,
				Aborted:priv_a.aborted,
				Restarting:priv_a.restart,
				Handles:priv_a.opencount,
				User:prm.User,
				Waiting:[],
				Happening:prm.HappenTo.GetInfo(),
			}
			for(let w of priv_a.wait)r.Waiting.push({Label:w.Label,Prop:w.Prop});
			return r;
		},

		GetLogger:()=>prm.Log,
		GetLauncher:()=>{return prm.Launcher;},
		GetHappeningManager:()=>{return prm.HappenTo;},
		GetDependencies:()=>{return prm.Dependencies;},

		WaitFor:(label,cb_chk,prop={})=>{
			priv_a.wait.push({Label:label,Chk:cb_chk,Prop:prop});
		},
		Restart:()=>{priv_a.restart=true;},

		Fetch:()=>{
			return handle(agent);
		},
		Open:()=>{
			let h=agent.Fetch();
			h.Open();
			return h;
		},
	});

	let ctrlopt={
		Name:prm.Name+'.StateMachine',
		Log:prm.Log,
		HappenTo:prm.HappenTo,
		Launcher:prm.Launcher,
		User:prm.User,
		OnDone:(proc)=>{
			priv_a.ctrl=null;
			priv_a.aborted=false;
			if(prm.OnFinish)prm.OnFinish(agent,prm.HappenTo.IsCleaned());
		},
		OnAbort:(proc)=>{
			priv_a.ctrl=null;
			priv_a.aborted=true;
			if(prm.OnAbort)prm.OnAbort(agent);
		},
	}

	let handle=(w)=>{

		let h=YgEs.SoftClass(prm.Name+'.Handle');
		let priv_h=h.Extend('YgEs.Handle',{
			// private
			in_open:false,
		},{
			// public
			GetAgent:()=>{return agent;},
			GetLogger:()=>agent.GetLogger(),
			GetLauncher:()=>agent.GetLauncher(),
			GetHappeningManager:()=>agent.GetHappeningManager(),
			GetDependencies:()=>agent.GetDependencies(),

			IsOpenHandle:()=>priv_h.in_open,
			IsOpenAgent:()=>agent.IsOpen(),
			IsBusy:()=>agent.IsBusy(),
			IsReady:()=>agent.IsReady(),
			IsHalt:()=>agent.IsHalt(),
			GetState:()=>agent.GetState(),

			Restart:()=>agent.Restart(),

			Open:()=>{
				if(!priv_h.in_open){
					priv_h.in_open=true;
					++priv_a.opencount;
				}
				if(!priv_a.ctrl){
					priv_a.ctrl=StateMachine.Run('IDLE',states,ctrlopt);
					const stmac_GetInfo=priv_a.ctrl.Inherit('GetInfo',()=>{
						return {
							Agent:agent.GetInfo('StMacInfo'),
							StMac:stmac_GetInfo(),
						}
					});
				}
			},
			Close:()=>{
				if(!priv_h.in_open)return;
				priv_h.in_open=false;
				--priv_a.opencount;
			},
		});

		for(let n of prm.AgentBypasses){
			h[n]=(...args)=>{
				if(!h.IsReady()){
					h.GetLogger().Notice('not ready');
					return null;
				}
				return agent[n].call(null,...args);
			}
		}
		for(let n of prm.UserBypasses){
			h[n]=(...args)=>{
				if(!h.IsReady()){
					h.GetLogger().Notice('not ready');
					return null;
				}
				return agent.User[n].call(null,...args);
			}
		}

		return h;
	}

	return agent;
}

YgEs.AgentManager={
	Name:'YgEs.AgentManager',
	User:{},
	_private_:{},

	StandBy:_standby,
	Launch:(prm)=>{return _standby(prm).Fetch();},
	Run:(prm)=>{return _standby(prm).Open();},
}

})();
export default YgEs.AgentManager;
