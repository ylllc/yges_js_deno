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

function _standby(field){

	field=YgEs.Validate(field,{Others:true,Struct:{
		Name:{Literal:true,Default:'YgEs.Agent'},
		User:{Struct:true},
		Trace:{Boolable:true},
		Trace_Agent:{Boolable:true},
		Trace_StMac:{Boolable:true},
		Trace_Proc:{Boolable:true},
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
	}},'field');

	let states={
		'IDLE':{
			OnPollInKeep:(ctrl,proc)=>{
				if(priv_a.opencount<1)return true;
				priv_a.restart=false;

				field.HappenTo.CleanUp();
				let cleaned=field.HappenTo.IsCleaned();
				priv_a.trace(()=>agent.GetCaption()+' end of IDLE to '+(cleaned?'UP':'REPAIR'));
				return cleaned?'UP':'REPAIR';
			},
		},
		'BROKEN':{
			OnPollInKeep:(ctrl,proc)=>{
				if(priv_a.opencount<1)return true;
				priv_a.restart=false;

				priv_a.trace(()=>agent.GetCaption()+' end of BROKEN to REPAIR');
				return 'REPAIR';
			},
		},
		'REPAIR':{
			OnStart:(ctrl,proc)=>{

				try{
					priv_a.trace(()=>agent.GetCaption()+' bgn of REPAIR');

					//start repairing 
					priv_a.wait=[]
					field.OnRepair(agent);
				}
				catch(e){
					priv_a.trace(()=>agent.GetCaption()+' crash in OnRepair',e);

					field.HappenTo.Happen(e,{
						Class:'YgEs.Agent',
						Cause:'ThrownFromCallback',
						Info:agent.GetInfo('OnRepair'),
					});
				}
			},
			OnPollInKeep:(ctrl,proc)=>{
				let cleaned=undefined;
				if(priv_a.opencount<1){
					field.HappenTo.CleanUp();
					cleaned=field.HappenTo.IsCleaned();
					priv_a.trace(()=>agent.GetCaption()+' abort repairing '+(cleaned?'clearly':'dirty'));
					return cleaned?'IDLE':'BROKEN';
				}

				// wait for delendencies 
				let cont=[]
				for(let d of priv_a.wait){
					try{
						if(d.Chk(d.Prop)){
							priv_a.trace(()=>agent.GetCaption()+' confirmed repairing about '+d.Label);
							continue;
						}
						cont.push(d);
					}
					catch(e){
						priv_a.trace(()=>agent.GetCaption()+' crash in '+d.Label+' Chk',e);

						field.HappenTo.Happen(e,{
							Class:'YgEs.Agent',
							Cause:'ThrownFromCallback',
							Info:agent.GetInfo('wait for repair'),
						});
					}
				}
				priv_a.wait=cont;
				if(priv_a.wait.length>0)return;

				// wait for all happens resolved 
				field.HappenTo.CleanUp();
				cleaned=field.HappenTo.IsCleaned();
				priv_a.trace(()=>agent.GetCaption()+' end of REPAIR '+(cleaned?'clearly':'dirty'));
				if(cleaned)return 'UP';
			},
		},
		'DOWN':{
			OnStart:(ctrl,proc)=>{
				let back=false;
				try{
					priv_a.wait=[]

					// down dependencles too 
					if(field.Dependencies){
						Util.SafeDictIter(field.Dependencies,(k,h)=>{
							h.Close();
						});
					}

					if(ctrl.GetPrevState()=='UP'){
						back=true;
						priv_a.trace(()=>agent.GetCaption()+' bgn of DOWN for back');
						field.OnBack(agent);
					}
					else{
						priv_a.trace(()=>agent.GetCaption()+' bgn of DOWN for close');
						field.OnClose(agent);
					}
				}
				catch(e){
					priv_a.trace(()=>agent.GetCaption()+' crash in '+(back?'OnBack':'OnClose'),e);

					field.HappenTo.Happen(e,{
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
						if(d.Chk(d.Prop)){
							priv_a.trace(()=>agent.GetCaption()+' confirmed closed about '+d.Label);
							continue;
						}
						cont.push(d);
					}
					catch(e){
						priv_a.trace(()=>agent.GetCaption()+' crash in '+d.Label+' Chk',e);

						field.HappenTo.Happen(e,{
							Class:'YgEs.Agent',
							Cause:'ThrownFromCallback',
							Info:agent.GetInfo('wait for down'),
						});
					}
				}
				priv_a.wait=cont;
				if(priv_a.wait.length>0)return null;
				field.HappenTo.CleanUp();
				let cleaned=field.HappenTo.IsCleaned();
				priv_a.trace(()=>agent.GetCaption()+' end of DOWN '+(cleaned?'clearly':'dirty'));
				return cleaned?'IDLE':'BROKEN';
			},
		},
		'UP':{
			OnStart:(ctrl,proc)=>{
				try{
					priv_a.trace(()=>agent.GetCaption()+' bgn of UP');

					priv_a.wait=[]
					field.OnOpen(agent);

					// up dependencles too 
					if(field.Dependencies){
						Util.SafeDictIter(field.Dependencies,(k,h)=>{
							h.Open();
							priv_a.wait.push({
								Label:'Depends '+h.GetAgent().Name,
								Chk:()=>h.IsReady(),
							});
						});
					}
				}
				catch(e){
					priv_a.trace(()=>agent.GetCaption()+' crash in OnOpen',e);

					field.HappenTo.Happen(e,{
						Class:'YgEs.Agent',
						Cause:'ThrownFromCallback',
						Info:agent.GetInfo('OnOpen'),
					});
				}
			},
			OnPollInKeep:(ctrl,proc)=>{
				if(priv_a.opencount<1){
					priv_a.trace(()=>agent.GetCaption()+' abort UP for close');
					return 'DOWN';
				}
				if(priv_a.restart){
					priv_a.trace(()=>agent.GetCaption()+' abort UP for restart');
					return 'DOWN';
				}

				// wait for delendencies 
				let cont=[]
				for(let d of priv_a.wait){
					try{
						if(d.Chk(d.Prop)){
							priv_a.trace(()=>agent.GetCaption()+' confirmed opened about '+d.Label);
							continue;
						}
						cont.push(d);
					}
					catch(e){
						priv_a.trace(()=>agent.GetCaption()+' crash in '+d.Label+' Chk',e);

						field.HappenTo.Happen(e,{
							Class:'YgEs.Agent',
							Cause:'ThrownFromCallback',
							Info:agent.GetInfo('wait for up'),
						});
					}
				}
				priv_a.wait=cont;
				if(!field.HappenTo.IsCleaned()){
					priv_a.trace(()=>agent.GetCaption()+' abort UP with happen');
					return 'DOWN';
				}
				if(priv_a.wait.length<1){
					priv_a.trace(()=>agent.GetCaption()+' fully UP');
					return 'HEALTHY';
				}
			},
			OnEnd:(ctrl,proc)=>{
				if(ctrl.GetNextState()=='HEALTHY'){
					try{
						priv_a.trace(()=>agent.GetCaption()+' end of UP with ready');

						// mark ready before callback 
						priv_a.ready=true;
						field.OnReady(agent);
					}
					catch(e){
						priv_a.trace(()=>agent.GetCaption()+' crash in OnReady',e);

						field.HappenTo.Happen(e,{
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
					priv_a.trace(()=>agent.GetCaption()+' end of HEALTHY to DOWN');

					priv_a.ready=false;
					return 'DOWN';
				}
				if(!field.HappenTo.IsCleaned()){
					priv_a.trace(()=>agent.GetCaption()+' end of HEALTHY to TROUBLE');

					return 'TROUBLE';
				}

				try{
					field.OnPollInHealthy(agent);
				}
				catch(e){
					priv_a.trace(()=>agent.GetCaption()+' crash in OnPollInHealthy',e);

					field.HappenTo.Happen(e,{
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
					priv_a.trace(()=>agent.GetCaption()+' bgn of TROUBLE');

					field.OnTrouble(agent);
				}
				catch(e){
					priv_a.trace(()=>agent.GetCaption()+' crash in OnTrouble',e);

					field.HappenTo.Happen(e,{
						Class:'YgEs.AgentError',
						Cause:'ThrownFromCallback',
						Info:agent.GetInfo('OnTrouble'),
					});
				}
			},
			OnPollInKeep:(ctrl,proc)=>{
				if(priv_a.opencount<1 || priv_a.restart){
					priv_a.trace(()=>agent.GetCaption()+' end of TROUBLE to DOWN');

					priv_a.ready=false;
					return 'DOWN';
				}
				field.HappenTo.CleanUp();
				if(field.HappenTo.IsCleaned()){
					priv_a.trace(()=>agent.GetCaption()+' end of TROUBLE to HEALTHY');
					return 'HEALTHY';
				}

				try{
					let c=field.HappenTo.CountIssues();
					field.OnPollInTrouble(agent);
					if(c<field.HappenTo.CountIssues()){
						priv_a.trace(()=>agent.GetCaption()+' end of TROUBLE to HALT');
						return 'HALT';
					}
				}
				catch(e){
					priv_a.trace(()=>agent.GetCaption()+' crash in OnPollInTrouble',e);

					field.HappenTo.Happen(e,{
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
						priv_a.trace(()=>agent.GetCaption()+' end of TROUBLE');

						field.OnRecover(agent);
					}
					catch(e){
						priv_a.trace(()=>agent.GetCaption()+' crash in OnRecover',e);

						field.HappenTo.Happen(e,{
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
					priv_a.trace(()=>agent.GetCaption()+' bgn of HALT');

					field.OnHalt(agent);
				}
				catch(e){
					priv_a.trace(()=>agent.GetCaption()+' crash in OnHalt',e);

					field.HappenTo.Happen(e,{
						Class:'YgEs.AgentError',
						Cause:'ThrownFromCallback',
						Info:agent.GetInfo('OnHalt'),
					});
				}
			},
			OnPollInKeep:(ctrl,proc)=>{
				if(priv_a.opencount<1 || priv_a.restart){
					priv_a.trace(()=>agent.GetCaption()+' end of HALT to DOWN');
					priv_a.ready=false;
					return 'DOWN';
				}
				field.HappenTo.CleanUp();
				if(field.HappenTo.IsCleaned()){
					priv_a.trace(()=>agent.GetCaption()+' end of HALT to HEALTHY');
					return 'HEALTHY';
				}
			},
			OnEnd:(ctrl,proc)=>{
				priv_a.halt=false;

				if(ctrl.GetNextState()=='HEALTHY'){
					try{
						priv_a.trace(()=>agent.GetCaption()+' mark recovered');

						field.OnRecover(agent);
					}
					catch(e){
						priv_a.trace(()=>agent.GetCaption()+' crash in OnRecover',e);

						field.HappenTo.Happen(e,{
							Class:'YgEs.AgentError',
							Cause:'ThrownFromCallback',
							Info:agent.GetInfo('OnRecover'),
						});
					}
				}
			},
		},
	}

	let agent=YgEs.SoftClass(field.Name+'.Worker',field.User);

	let priv_a=agent.Extend('YgEs.Agent',{
		// private 
		tracing_agent:field.Trace||field.Trace_Agent,
		tracing_stmac:field.Trace||field.Trace_StMac,
		tracing_proc:field.Trace||field.Trace_Proc,
		opencount:0,
		ctrl:null,
		ready:false,
		halt:false,
		restart:false,
		aborted:false,
		wait:[],

		trace:(msg)=>{
			if(!priv_a.tracing_agent)return;
			field.Log.Trace(msg);
		},
	},{
		// public 
		IsOpen:()=>priv_a.opencount>0,
		IsBusy:()=>!!priv_a.ctrl || priv_a.opencount>0,
		IsReady:()=>priv_a.ready && priv_a.opencount>0,
		IsHalt:()=>priv_a.halt,
		GetState:()=>priv_a.ctrl?priv_a.ctrl.GetCurState():'NONE',
		GetInfo:(site='')=>{
			let r={
				Name:field.Name,
				CrashSite:site,
				State:priv_a.ctrl?priv_a.ctrl.GetCurState():'NONE',
				Busy:!!priv_a.ctrl,
				Ready:priv_a.ready,
				Halt:priv_a.halt,
				Aborted:priv_a.aborted,
				Restarting:priv_a.restart,
				Handles:priv_a.opencount,
				User:field.User,
				Waiting:[],
				Happening:field.HappenTo.GetInfo(),
			}
			for(let w of priv_a.wait)r.Waiting.push({Label:w.Label,Prop:w.Prop});
			return r;
		},

		SetTracing_Agent:(side)=>priv_a.tracing_agent=!!side,
		SetTracing_StMac:(side)=>priv_a.tracing_stmac=!!side,
		SetTracing_Proc:(side)=>priv_a.tracing_proc=!!side,
		SetTracing:(side)=>{
			SetTracing_Agent(side);
			SetTracing_StMac(side);
			SetTracing_Proc(side);
		},

		GetLogger:()=>field.Log,
		GetLauncher:()=>{return field.Launcher;},
		GetHappeningManager:()=>{return field.HappenTo;},
		GetDependencies:()=>{return field.Dependencies;},

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
		Name:field.Name+'.StateMachine',
		Log:field.Log,
		HappenTo:field.HappenTo,
		Launcher:field.Launcher,
		User:field.User,
		OnDone:(proc)=>{
			priv_a.trace(()=>agent.GetCaption()+' done');
			priv_a.ctrl=null;
			priv_a.aborted=false;
			if(field.OnFinish)field.OnFinish(agent,field.HappenTo.IsCleaned());
		},
		OnAbort:(proc)=>{
			priv_a.trace(()=>agent.GetCaption()+' abort');
			priv_a.ctrl=null;
			priv_a.aborted=true;
			if(field.OnAbort)field.OnAbort(agent);
		},
	}

	let handle=(w)=>{

		let h=YgEs.SoftClass(field.Name+'.Handle');
		let priv_h=h.Extend('YgEs.Handle',{
			// private
			in_open:false,
		},{
			// public
			SetTracing_Agent:(side)=>priv_a.tracing_agent=!!side,
			SetTracing_StMac:(side)=>priv_a.tracing_stmac=!!side,
			SetTracing_Proc:(side)=>priv_a.tracing_proc=!!side,
			SetTracing:(side)=>{
				SetTracing_Agent(side);
				SetTracing_StMac(side);
				SetTracing_Proc(side);
			},

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
					priv_a.trace(()=>h.GetCaption()+' open ('+priv_a.opencount+' => '+(priv_a.opencount+1)+')');
					++priv_a.opencount;
				}
				if(!priv_a.ctrl){
					priv_a.trace(()=>agent.GetCaption()+' start');
					ctrlopt.Trace_StMac=priv_a.tracing_stmac;
					ctrlopt.Trace_Proc=priv_a.tracing_proc;
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
				priv_a.trace(()=>h.GetCaption()+' close ('+priv_a.opencount+' => '+(priv_a.opencount-1)+')');
				--priv_a.opencount;
			},
		});

		for(let n of field.AgentBypasses){
			h[n]=(...args)=>{
				if(!h.IsReady()){
					h.GetLogger().Notice('not ready');
					return null;
				}
				return agent[n].call(null,...args);
			}
		}
		for(let n of field.UserBypasses){
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
	Launch:(field)=>{return _standby(field).Fetch();},
	Run:(field)=>{return _standby(field).Open();},
}

})();
export default YgEs.AgentManager;
