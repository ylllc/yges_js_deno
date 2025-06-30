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

	start=YgEs.Validate(start,{Literal:true,Nullable:true},'start');
	states=YgEs.Validate(states,{Dict:true},'states');
	opt=YgEs.Validate(opt,{Others:true,Struct:{
		Name:{Literal:true,Default:'YgEs.StateMachine'},
		User:{Struct:true},
		Log:{Class:'YgEs.LocalLog',Default:Log},
		HappenTo:{Class:'YgEs.HappeningManager',Default:HappeningManager},
		Launcher:{Class:'YgEs.Launcher',Default:Engine},
		OnDone:{Callable:true},
		OnAbort:{Callable:true},
	}},'opt');

	let ctrl=YgEs.SoftClass(opt.Name,opt.User);

	let priv=ctrl.Extend('YgEs.StateMachine',{
		// private 
		cur:null,
		state_prev:null,
		state_cur:null,
		state_next:start,
	},{
		// public 
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
			priv.cur=null;
			priv.state_prev=priv.state_cur;
			priv.state_cur=null;
			poll_cur=poll_nop;
			return;
		}
		priv.cur=states[priv.state_next]??null;
		if(!priv.cur){
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
			if(priv.cur.OnStart)priv.cur.OnStart(ctrl,proc);
			poll_cur=poll_up;
		}
		catch(e){
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
				if(priv.cur.OnReady)priv.cur.OnReady(ctrl,proc);
				poll_cur=poll_keep;
			}
			catch(e){
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
			call_end(proc);
		}
	}
	let poll_keep=(proc)=>{
		try{
			var r=priv.cur.OnPollInKeep?priv.cur.OnPollInKeep(ctrl,proc):true;
		}
		catch(e){
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
			priv.state_next=null;
			call_stop(proc);
		}
		else{
			// normal transition 
			priv.state_next=r.toString();
			call_stop(proc);
		}
	}
	let call_stop=(proc)=>{
		try{
			if(priv.cur.OnStop)priv.cur.OnStop(ctrl,proc);
			poll_cur=poll_down;
		}
		catch(e){
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
			call_end(proc);
		}
		else{
			// interruption 
			priv.state_next=r.toString();
			call_end(proc);
		}
	}
	let call_end=(proc)=>{
		try{
			if(priv.cur.OnEnd)priv.cur.OnEnd(ctrl,proc);
			call_start(proc);
		}
		catch(e){
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
