// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import YgEs from './common.js';
import Engine from './engine.js';
import HappeningManager from './happening.js';
import Log from './logger.js';

// StateMachine ------------------------- //
(()=>{ // local namespace 

function _run(start,states={},opt={}){

	start=YgEs.Validate(start,{Key:states,Nullable:true},'start');
	states=YgEs.Validate(states,{Dict:true},'states');
	opt=YgEs.Validate(opt,{Others:true,Struct:{
		Name:{Literal:true,Default:'YgEs.StateMachine'},
		User:{Struct:true},
		Trace:{Boolable:true},
		Trace_Proc:{Boolable:true},
		Log:{Class:'YgEs.LocalLog',Default:Log},
		HappenTo:{Class:'YgEs.HappeningManager',Default:HappeningManager},
		Launcher:{Class:'YgEs.Launcher',Default:Engine},
		OnDone:{Callable:true},
		OnAbort:{Callable:true},
	}},'opt');

	let ctrl=YgEs.SoftClass(opt.Name,opt.User);

	let priv=ctrl.Extend('YgEs.StateMachine',{
		// private 
		tracing:opt.Trace,
		tracing_proc:opt.Trace_Proc,
		cur:null,
		state_prev:null,
		state_cur:null,
		state_next:start,

		trace:(msg)=>{
			if(!priv.tracing)return;
			ctrl.GetLogger().Trace(msg);
		},
	},{
		// public 
		SetTracing_StMac:(side)=>priv.tracing=!!side,
		SetTracing_Proc:(side)=>{
			priv.tracing_proc=!!side;
			proc.SetTracing(priv.tracing_proc);
		},
		SetTracing:(side)=>{
			SetTracing_StMac(side);
			SetTracing_Proc(side);
		},

		GetLogger:()=>opt.Log,
		GetHappeningManager:()=>opt.HappenTo,
		GetPrevState:()=>priv.state_prev,
		GetCurState:()=>priv.state_cur,
		GetNextState:()=>priv.state_next,
		GetInfo:(site='')=>{
			return {
				Name:ctrl.GetCaption(),
				CrashSite:site,
				Prev:priv.state_prev,
				Cur:priv.state_cur,
				Next:priv.state_next,
				User:opt.User,
			}
		},
	});

	let poll_nop=(proc)=>{}
	let poll_cur=poll_nop;

	let call_start=(proc)=>{
		if(priv.state_next==null){
			// normal end 
			priv.trace('end of statemachine');
			priv.cur=null;
			priv.state_prev=priv.state_cur;
			priv.state_cur=null;
			poll_cur=poll_nop;
			return;
		}
		priv.cur=states[priv.state_next]??null;
		if(!priv.cur){
			priv.trace(priv.state_next+' missing');
			opt.HappenTo.Happen(
				'Missing State: '+priv.state_next,{
				Source:ctrl.GetCaption(),
				Cause:'MissingState',
				Info:ctrl.GetInfo('selecting'),
			});
			poll_cur=poll_nop;
			return;
		}
		priv.state_prev=priv.state_cur;
		priv.state_cur=priv.state_next;
		priv.state_next=null;
		try{
			priv.trace(priv.state_cur+' start');
			if(priv.cur.OnStart)priv.cur.OnStart(ctrl,proc);
			poll_cur=poll_up;
		}
		catch(e){
			priv.trace(priv.state_cur+' crashed in OnStart');
			opt.HappenTo.Happen(e,{
				Source:ctrl.GetCaption(),
				Cause:'ThrownFromCallback',
				Info:ctrl.GetInfo('OnStart'),
			});
			poll_cur=poll_nop;
			return;
		}
		// can try extra polling 
		poll_cur(proc);
	}
	let poll_up=(proc)=>{
		try{
			var r=priv.cur.OnPollInUp?priv.cur.OnPollInUp(ctrl,proc):true;
		}
		catch(e){
			priv.trace(priv.state_cur+' crashed in OnPollInUp');
			opt.HappenTo.Happen(e,{
				Source:ctrl.GetCaption(),
				Cause:'ThrownFromCallback',
				Info:ctrl.GetInfo('OnPollInUp'),
			});
			poll_cur=poll_nop;
			return;
		}
		if(r==null)return; // continuing 
		else if(r===false)proc.Abort();
		else if(r===true){
			try{
				// normal transition 
				priv.trace(priv.state_cur+' ready');
				if(priv.cur.OnReady)priv.cur.OnReady(ctrl,proc);
				poll_cur=poll_keep;
			}
			catch(e){
				priv.trace(priv.state_cur+' crashed in OnReady');
				opt.HappenTo.Happen(e,{
					Source:ctrl.GetCaption(),
					Cause:'ThrownFromCallback',
					Info:ctrl.GetInfo('OnReady'),
				});
				poll_cur=poll_nop;
				return;
			}
			// can try extra polling 
			poll_cur(proc);
		}
		else{
			// interruption 
			priv.state_next=r.toString();
			priv.trace(priv.state_cur+' interrupted to '+priv.state_next);
			call_end(proc);
		}
	}
	let poll_keep=(proc)=>{
		try{
			var r=priv.cur.OnPollInKeep?priv.cur.OnPollInKeep(ctrl,proc):true;
		}
		catch(e){
			priv.trace(priv.state_cur+' crashed in OnPollInKeep');
			opt.HappenTo.Happen(e,{
				Source:ctrl.GetCaption(),
				Cause:'ThrownFromCallback',
				Info:ctrl.GetInfo('OnPollInKeep'),
			});
			poll_cur=poll_nop;
			return;
		}
		if(r==null)return; // continuing 
		else if(r===false)proc.Abort();
		else if(r===true){
			// normal end 
			priv.trace(priv.state_cur+' will terminate');
			priv.state_next=null;
			call_stop(proc);
		}
		else{
			// normal transition 
			priv.state_next=r.toString();
			priv.trace(priv.state_cur+' will transit to '+priv.state_next);
			call_stop(proc);
		}
	}
	let call_stop=(proc)=>{
		try{
			priv.trace(priv.state_cur+' stop');
			if(priv.cur.OnStop)priv.cur.OnStop(ctrl,proc);
			poll_cur=poll_down;
		}
		catch(e){
			priv.trace(priv.state_cur+' crashed in OnStop');
			opt.HappenTo.Happen(e,{
				Source:ctrl.GetCaption(),
				Cause:'ThrownFromCallback',
				Info:ctrl.GetInfo('OnStop'),
			});
			poll_cur=poll_nop;
			return;
		}
		// can try extra polling 
		poll_cur(proc);
	}
	let poll_down=(proc)=>{
		try{
			var r=priv.cur.OnPollInDown?priv.cur.OnPollInDown(ctrl,proc):true;
		}
		catch(e){
			priv.trace(priv.state_cur+' crashed in OnPollInDown');
			opt.HappenTo.Happen(e,{
				Source:ctrl.GetCaption(),
				Cause:'ThrownFromCallback',
				Info:ctrl.GetInfo('OnPollInDown'),
			});
			poll_cur=poll_nop;
			return;
		}
		if(r==null)return; // continuing 
		else if(r===false)proc.Abort();
		else if(r===true){
			// normal transition 
			priv.trace(priv.state_cur+' end');
			call_end(proc);
		}
		else{
			// interruption 
			priv.state_next=r.toString();
			priv.trace(priv.state_cur+' interrupted to '+priv.state_next);
			call_end(proc);
		}
	}
	let call_end=(proc)=>{
		try{
			if(priv.cur.OnEnd)priv.cur.OnEnd(ctrl,proc);
			call_start(proc);
		}
		catch(e){
			priv.trace(priv.state_cur+' crashed in OnEnd');
			opt.HappenTo.Happen(e,{
				Source:ctrl.GetCaption(),
				Cause:'ThrownFromCallback',
				Info:ctrl.GetInfo('OnEnd'),
			});
			poll_cur=poll_nop;
			return;
		}
	}

	let proc=opt.Launcher.Launch({
		Name:opt.Name+'.Proc',
		Trace:priv.tracing_proc,
		Log:opt.Log,
		HappenTo:opt.HappenTo,
		User:opt.User,
		OnStart:(proc)=>{
			call_start(proc);
		},
		OnPoll:(proc)=>{
			poll_cur(proc);
			return !!priv.cur;
		},
		OnDone:opt.OnDone,
		OnAbort:opt.OnAbort,
	});

	proc.Trait('YgEs.StateMachine.Proc');
	const proc_GetInfo=proc.Inherit('GetInfo',()=>{
		return {
			StateMachine:{
				Name:ctrl.GetCaption(),
				Prev:priv.state_prev,
				Cur:priv.state_cur,
				Next:priv.state_next,
			},
			Procedure:proc_GetInfo('ProcInfo'),
		}
	});

	ctrl.IsStarted=proc.IsStarted;
	ctrl.IsFinished=proc.IsFinished;
	ctrl.IsAborted=proc.IsAborted;
	ctrl.IsEnd=proc.IsEnd;
	ctrl.Abort=proc.Abort;
	ctrl.Sync=proc.Sync;
	ctrl.ToPromise=proc.ToPromise;
	return ctrl;
}

YgEs.StateMachine={
	Name:'YgEs.StateMachine.Container',
	User:{},
	_private_:{},

	Run:_run,
}

})();
export default YgEs.StateMachine;
