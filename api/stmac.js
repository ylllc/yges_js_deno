// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import YgEs from './common.js';
import Engine from './engine.js';
import HappeningManager from './happening.js';

// Statemachine ------------------------- //
(()=>{ // local namespace 

function _run(start,states={},opt={}){

	let launcher=opt.launcher??YgEs.Engine;
	let cur=null;

	let name=opt.name??'YgEs_Statemachine';
	let happen=opt.happen??HappeningManager;
	let user=opt.user??{};

	let state_prev=null;
	let state_cur=null;
	let state_next=start;

	let ctrl={
		name:name+'_Control',
		User:{},
		getHappeningManager:()=>happen,
		getPrevState:()=>state_prev,
		getCurState:()=>state_cur,
		getNextState:()=>state_next,
	}

	let getInfo=(phase)=>{
		return {
			name:name,
			prev:state_prev,
			cur:state_cur,
			next:state_next,
			phase:phase,
			ctrl:ctrl.User,
			user:user,
		}
	}

	let poll_nop=(user)=>{}
	let poll_cur=poll_nop;

	let call_start=(user)=>{
		if(state_next==null){
			// normal end 
			cur=null;
			poll_cur=poll_nop;
			return;
		}
		cur=states[state_next]??null;
		if(!cur){
			stmac.happen.happenProp({
				class:'YgEs_Statemachine_Error',
				cause:'state missing: '+state_next,
				info:getInfo('selecing'),
			});
			poll_cur=poll_nop;
			return;
		}
		state_prev=state_cur;
		state_cur=state_next;
		state_next=null;
		try{
			if(cur.cb_start)cur.cb_start(ctrl,user);
			poll_cur=poll_up;
		}
		catch(e){
			stmac.happen.happenProp({
				class:'YgEs_Statemachine_Error',
				cause:'throw from a callback',
				info:getInfo('cb_start'),
				err:YgEs.fromError(e),
			});
			poll_cur=poll_nop;
		}
		// can try extra polling 
		poll_cur(user);
	}
	let poll_up=(user)=>{
		try{
			var r=cur.poll_up?cur.poll_up(ctrl,user):true;
		}
		catch(e){
			stmac.happen.happenProp({
				class:'YgEs_Statemachine_Error',
				cause:'throw from a callback',
				info:getInfo('poll_up'),
				err:YgEs.fromError(e),
			});
			r=false;
		}
		if(r==null)return; // continuing 
		else if(r===false)proc.abort();
		else if(r===true){
			try{
				// normal transition 
				if(cur.cb_ready)cur.cb_ready(ctrl,user);
				poll_cur=poll_keep;
			}
			catch(e){
				stmac.happen.happenProp({
					class:'YgEs_Statemachine_Error',
					cause:'throw from a callback',
					info:getInfo('cb_ready'),
					err:YgEs.fromError(e),
				});
				poll_cur=poll_nop;
			}
			// can try extra polling 
			poll_cur(user);
		}
		else{
			// interruption 
			state_next=r.toString();
			call_end(user);
		}
	}
	let poll_keep=(user)=>{
		try{
			var r=cur.poll_keep?cur.poll_keep(ctrl,user):true;
		}
		catch(e){
			stmac.happen.happenProp({
				class:'YgEs_Statemachine_Error',
				cause:'throw from a callback',
				info:getInfo('poll_keep'),
				err:YgEs.fromError(e),
			});
			r=false;
		}
		if(r==null)return; // continuing 
		else if(r===false)proc.abort();
		else if(r===true){
			// normal end 
			state_next=null;
			call_stop(user);
		}
		else{
			// normal transition 
			state_next=r.toString();
			call_stop(user);
		}
	}
	let call_stop=(user)=>{
		try{
			if(cur.cb_stop)cur.cb_stop(ctrl,user);
			poll_cur=poll_down;
		}
		catch(e){
			stmac.happen.happenProp({
				class:'YgEs_Statemachine_Error',
				cause:'throw from a callback',
				info:getInfo('cb_stop'),
				err:YgEs.fromError(e),
			});
			poll_cur=poll_nop;
		}
		// can try extra polling 
		poll_cur(user);
	}
	let poll_down=(user)=>{
		try{
			var r=cur.poll_down?cur.poll_down(ctrl,user):true;
		}
		catch(e){
			stmac.happen.happenProp({
				class:'YgEs_Statemachine_Error',
				cause:'throw from a callback',
				info:getInfo('poll_down'),
				err:YgEs.fromError(e),
			});
			r=false;
		}
		if(r==null)return; // continuing 
		else if(r===false)proc.abort();
		else if(r===true){
			// normal transition 
			call_end(user);
		}
		else{
			// interruption 
			state_next=r.toString();
			call_end(user);
		}
	}
	let call_end=(user)=>{
		try{
			if(cur.cb_end)cur.cb_end(ctrl,user);
			call_start(user);
		}
		catch(e){
			stmac.happen.happenProp({
				class:'YgEs_Statemachine_Error',
				cause:'throw from a callback',
				info:getInfo('cb_end'),
				err:YgEs.fromError(e),
			});
			poll_cur=poll_nop;
		}
	}

	let stmac={
		name:name,
		happen:happen,
		user:user,

		cb_start:(user)=>{
			call_start(user);
		},
		cb_poll:(user)=>{
			poll_cur(user);
			return !!cur;
		},
		cb_done:opt.cb_done??'',
		cb_abort:opt.cb_abort??'',
	}

	let proc=launcher.launch(stmac);
	ctrl.isStarted=proc.isStarted;
	ctrl.isFinished=proc.isFinished;
	ctrl.isAborted=proc.isAborted;
	ctrl.isEnd=proc.isEnd;
	ctrl.abort=proc.abort;
	ctrl.sync=proc.sync;
	ctrl.toPromise=proc.toPromise;
	return ctrl;
}

YgEs.StateMachine={
	name:'YgEs_StateMachineContainer',
	User:{},

	run:_run,
}

})();
export default YgEs.StateMachine;
