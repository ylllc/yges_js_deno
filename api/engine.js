// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Async Procedure Engine //

import hap_global from './happening.js';
import log from './logger.js';
import util from './util.js';
import timing from './timing.js';

const DEFAULT_ROOT_CYCLE=20;
const DEFAULT_LAUNCHER_CYCLE=20;
const DEFAULT_SYNC_CYCLE=10;
const CLASS_PROC='YgEs_Procedure';
const CLASS_LAUNCHER='YgEs_Launcher';
const CLASS_LAUNCHERPROC='YgEs_LauncherProc';
const CLASS_DELAYPROC='YgEs_DelayProc';
const CLASS_ROOT='YgEs_RootLauncher';

function _create_proc(prm){

	var cb_start=prm.cb_start??null;
	var cb_poll=prm.cb_poll;
	var cb_done=prm.cb_done??null;
	var cb_abort=prm.cb_abort??null;

	var started=false;
	var finished=false;
	var aborted=false;

	var proc={
		name:prm.name??CLASS_PROC,
		HappenTo:(prm.happen??hap_global).createLocal(),
		User:prm.user??{},

		isStarted:()=>started,
		isFinished:()=>finished,
		isAborted:()=>aborted,
		isEnd:()=>finished||aborted,

		_start:()=>{
			if(started)return;
			if(proc.isEnd())return;
			started=true;
			if(cb_start){
				try{
					cb_start(proc.User);
				}
				catch(e){
					proc.HappenTo.happenProp({
						class:CLASS_PROC,
						cause:'throw from start',
						src:proc,
						err:util.fromError(e),
					});
					proc.abort();
				}
			}
		},
		abort:()=>{
			if(proc.isEnd())return;
			aborted=true;
			if(cb_abort){
				try{
					cb_abort(proc.User);
				}
				catch(e){
					proc.HappenTo.happenProp({
						class:CLASS_PROC,
						cause:'throw from abort',
						src:proc,
						err:util.fromError(e),
					});
				}
			}
			else{
				proc.HappenTo.happenProp({
					class:CLASS_PROC,
					cause:'abort',
					src:proc,
				});
			}
		},
		poll:()=>{
			if(proc.isEnd())return false;
			try{
				if(cb_poll(proc.User))return true;
			}
			catch(e){
				proc.HappenTo.happenProp({
					class:CLASS_PROC,
					cause:'throw from poll',
					src:proc,
					err:util.fromError(e),
				});
				proc.abort();
				return false;
			}
			if(cb_done){
				try{
					cb_done(proc.User);
					finished=true;
				}
				catch(e){
					proc.HappenTo.happenProp({
						class:CLASS_PROC,
						cause:'throw from done',
						src:proc,
						err:util.fromError(e),
					});
					proc.abort();
					return false;
				}
			}
			else{
				finished=true;
			}
			return false;
		},

		sync:(cb_sync,interval=null)=>{
			if(!cb_sync){
				proc.HappenTo.happenProp({
					class:CLASS_LAUNCHER,
					cause:'empty callback from sync',
				});
				return;
			}
			if(interval===null)interval=DEFAULT_SYNC_CYCLE;
			timing.sync(interval,
				()=>{return proc.isEnd();},
				()=>{
					try{
						cb_sync(proc.User);
					}
					catch(e){
						proc.HappenTo.happenProp({
							class:CLASS_PROC,
							cause:'throw from sync',
							src:proc,
							err:util.fromError(e),
						});
					}
				},
			);
		},
		toPromise:(breakable,interval=null)=>{
			return timing.toPromise((ok,ng)=>{
				proc.sync(()=>{
					if(breakable || finished)ok(proc.User);
					else ng(new Error('abort',{cause:proc.User}));
				},interval);
			});
		},
	}
	return proc;
}

function _create_launcher(prm){

	var abandoned=false;
	var aborted=false;

	var lnc={
		name:prm.name??CLASS_LAUNCHER,
		HappenTo:(prm.happen??hap_global).createLocal(),
		Limit:prm.limit??-1,
		Cycle:prm.cycle??DEFAULT_LAUNCHER_CYCLE,
		User:prm.user??{},

		_sub:[],
		_launch:[],
		_active:[],

		isEnd:()=>{
			if(lnc._launch.length>0)return false;
			if(lnc._active.length>0)return false;
			for(var sub of lnc._sub){
				if(!sub.isEnd())return false;
			}
			return true;
		},
		isAbandoned:()=>abandoned,
		countActive:()=>{
			var n=lnc._active.length
			for(var sub of lnc._sub)n+=sub.countActive();
			return n;
		},
		countHeld:()=>{
			var n=lnc._launch.length
			for(var sub of lnc._sub)n+=sub.countHeld();
			return n;
		},

		abandon:()=>{
			abandoned=true;
			lnc.abort();
		},

		createLauncher:(prm={})=>{
			var sub=_create_launcher(prm);
			lnc._sub.push(sub);
			return sub;
		},

		launch:(prm={})=>{
			if(mif.isAbandoned()){
				lnc.HappenTo.happenMsg('the Engine was abandoned, no longer launch new procedures.');
				return;
			}
			if(!_working){
				log.notice('the Engine not startted. call start() to run.');
			}
			if(abandoned){
				if(prm.cb_abort)prm.cb_abort();
				return;
			}
			if(!prm.cb_poll){
				lnc.HappenTo.happenProp({
					class:CLASS_LAUNCHER,
					cause:'empty pollee',
				});
				return;
			}

			var proc=_create_proc(prm);
			if(lnc.Limit<0 || lnc._active.length<lnc.Limit){
				lnc._active.push(proc);
				proc._start();
			}
			else{
				lnc._launch.push(proc);
			}
			return proc;
		},
		abort:()=>{
			if(lnc.isEnd())return;
			aborted=true;
			for(var sub of lnc._sub)sub.abort();
			lnc._sub=[]
			for(var proc of lnc._launch)proc.abort();
			lnc._launch=[]
			for(var proc of lnc._active)proc.abort();
			lnc._active=[]
		},
		poll:()=>{
			for(var sub of lnc._sub){
				sub.poll();
			}

			var cont=[]
			for(var proc of lnc._active){
				if(proc.poll())cont.push(proc);
			}
			lnc._active=cont;

			if(lnc.Limit<0 || lnc._active.length<lnc.Limit){
				var hold=[]
				for(var proc of lnc._launch){
					if(lnc.Limit>=0 && lnc._active.length>=lnc.Limit)hold.push(proc);
					else{
						proc._start();
						lnc._active.push(proc);
					}
				}
				lnc._launch=hold;
			}
		},

		sync:(cb_sync,interval=null)=>{
			if(!cb_sync){
				lnc.HappenTo.happenProp({
					class:CLASS_LAUNCHER,
					cause:'empty callback from sync',
				});
				return;
			}
			if(interval===null)interval=DEFAULT_SYNC_CYCLE;
			timing.sync(interval,
				()=>{
					lnc.poll();
					return lnc.isEnd();
				},
				()=>{
					try{
						cb_sync(lnc.User);
					}
					catch(e){
						lnc.HappenTo.happenProp({
							class:CLASS_PROC,
							cause:'throw from sync',
							src:lnc,
							err:util.fromError(e),
						});
					}
				}
			);
		},

		toPromise:(breakable,interval=null)=>{
			return timing.toPromise((ok,ng)=>{
				lnc.sync(()=>{
					if(breakable || !aborted)ok(lnc.User);
					else ng(new Error('abort',{cause:lnc.User}));
				},interval);
			});
		},

		delay:(time,cb_done,cb_abort=null)=>{
			var until=new Date(Date.now()+time);
			return lnc.launch({
					name:CLASS_DELAYPROC,
					cb_poll:(user)=>{
						return Date.now()<until;
					},
					cb_done:cb_done,
					cb_abort:cb_abort??cb_done,
				});
		},
	}
	return lnc;
}


const mif=_create_launcher({
	name:CLASS_ROOT,
	cycle:DEFAULT_ROOT_CYCLE,
});

var _working=false;
var _cancel=null;

function _poll_engine(){

	if(!_working)return;
	if(mif.isAbandoned())return;

	mif.poll();

	_cancel=timing.delay(mif.Cycle,()=>{
		_cancel=null;
		_poll_engine();
	});
}

function _stop_engine(){

	_working=false;
	if(_cancel!=null)_cancel();
}

mif.start=()=>{

	if(mif.isAbandoned())return;
	if(_working)return;
	_working=true;
	_poll_engine();
}

mif.stop=()=>{

	_stop_engine();
	if(mif.isAbandoned())return;
	mif.abort();
}

mif.shutdown=()=>{
	mif.abandon();
	_stop_engine();
}

export default mif;
