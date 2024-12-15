// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Statemachine //

import engine from './engine.js';
import hap_global from './happening.js';

function _run(start,states={},opt={}){

	var launcher=opt.launcher??engine;
	var cur=null;

	var name=opt.name??'YgEs_Statemachine';
	var happen=opt.happen??hap_global;
	var user=opt.user??{};

	var state_prev=null;
	var state_cur=null;
	var state_next=start;

	var ctrl={
		name:name+'_Control',
		User:{},
		getHappeningManager:()=>happen,
		getPrevState:()=>state_prev,
		getCurState:()=>state_cur,
		getNextState:()=>state_next,
	}

	var getInfo=(phase)=>{
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

	var poll_nop=(user)=>{}
	var poll_cur=poll_nop;

	var call_start=(user)=>{
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
				err:util.fromError(e),
			});
			poll_cur=poll_nop;
		}
		// can try extra polling 
		poll_cur(user);
	}
	var poll_up=(user)=>{
		try{
			var r=cur.poll_up?cur.poll_up(ctrl,user):true;
		}
		catch(e){
			stmac.happen.happenProp({
				class:'YgEs_Statemachine_Error',
				cause:'throw from a callback',
				info:getInfo('poll_up'),
				err:util.fromError(e),
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
					err:util.fromError(e),
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
	var poll_keep=(user)=>{
		try{
			var r=cur.poll_keep?cur.poll_keep(ctrl,user):true;
		}
		catch(e){
			stmac.happen.happenProp({
				class:'YgEs_Statemachine_Error',
				cause:'throw from a callback',
				info:getInfo('poll_keep'),
				err:util.fromError(e),
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
	var call_stop=(user)=>{
		try{
			if(cur.cb_stop)cur.cb_stop(ctrl,user);
			poll_cur=poll_down;
		}
		catch(e){
			stmac.happen.happenProp({
				class:'YgEs_Statemachine_Error',
				cause:'throw from a callback',
				info:getInfo('cb_stop'),
				err:util.fromError(e),
			});
			poll_cur=poll_nop;
		}
		// can try extra polling 
		poll_cur(user);
	}
	var poll_down=(user)=>{
		try{
			var r=cur.poll_down?cur.poll_down(ctrl,user):true;
		}
		catch(e){
			stmac.happen.happenProp({
				class:'YgEs_Statemachine_Error',
				cause:'throw from a callback',
				info:getInfo('poll_down'),
				err:util.fromError(e),
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
	var call_end=(user)=>{
		try{
			if(cur.cb_end)cur.cb_end(ctrl,user);
			call_start(user);
		}
		catch(e){
			stmac.happen.happenProp({
				class:'YgEs_Statemachine_Error',
				cause:'throw from a callback',
				info:getInfo('cb_end'),
				err:util.fromError(e),
			});
			poll_cur=poll_nop;
		}
	}

	var stmac={
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

	var proc=launcher.launch(stmac);
	ctrl.isStarted=proc.isStarted;
	ctrl.isFinished=proc.isFinished;
	ctrl.isAborted=proc.isAborted;
	ctrl.isEnd=proc.isEnd;
	ctrl.abort=proc.abort;
	ctrl.sync=proc.sync;
	ctrl.toPromise=proc.toPromise;
	return ctrl;
}

var mif={
	name:'YgEs_StateMachineContainer',
	User:{},

	run:_run,
}

export default mif;
