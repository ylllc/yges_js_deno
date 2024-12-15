// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Worker //

import hap_global from './happening.js';
import engine from './engine.js';
import stmac from './stmac.js';
import util from './util.js';

// state 
const _state_names=Object.freeze(['IDLE','BROKEN','DOWN','REPAIR','UP','REST','TROUBLE','HEALTHY']);

// make reverse lookup 
var ll={}
for(var i in _state_names)ll[_state_names[i]]=parseInt(i);
const _state_lookup=Object.freeze(ll);

function _standby(prm){

	var opencount=0;
	var ctrl=null;
	var ready=false;
	var halt=false;
	var restart=false;
	var aborted=false;
	var wait=[]

	var name=prm.name??'YgEs_Worker';
	var happen=prm.happen??hap_global.createLocal();
	var launcher=prm.launcher??engine.createLauncher();
	var user=prm.user??{};

	var getInfo=(phase)=>{
		return {
			name:name,
			phase:phase,
			state:ctrl?ctrl.getCurState():'NONE',
			wait:wait,
			user:user,
		}
	}

	var states={
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
					if(prm.cb_repair)prm.cb_repair(worker);
				}
				catch(e){
					happen.happenProp({
						class:'YgEs_Worker_Error',
						cause:'throw from a callback',
						src:getInfo('cb_repair'),
						err:util.fromError(e),
					});
				}
			},
			poll_keep:(ctrl,user)=>{
				if(opencount<1){
					happen.cleanup();
					return happen.isCleaned()?'IDLE':'BROKEN';
				}

				// wait for delendencies 
				var cont=[]
				for(var d of wait){
					try{
						if(d())continue;
						cont.push(d);
					}
					catch(e){
						happen.happenProp({
							class:'YgEs_Worker_Error',
							cause:'throw from a callback',
							src:getInfo('wait for repair'),
							err:util.fromError(e),
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
						util.safeDictIter(prm.dependencies,(k,h)=>{
							h.close();
						});
					}

					if(ctrl.getPrevState()=='UP'){
						if(prm.cb_back)prm.cb_back(worker);
					}
					else{
						if(prm.cb_close)prm.cb_close(worker);
					}
				}
				catch(e){
					happen.happenProp({
						class:'YgEs_Worker_Error',
						cause:'throw from a callback',
						src:getInfo('cb_close'),
						err:util.fromError(e),
					});
				}
			},
			poll_keep:(ctrl,user)=>{

				// wait for delendencies 
				var cont=[]
				for(var d of wait){
					try{
						if(d())continue;
						cont.push(d);
					}
					catch(e){
						happen.happenProp({
							class:'YgEs_Worker_Error',
							cause:'throw from a callback',
							src:getInfo('wait for down'),
							err:util.fromError(e),
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
					if(prm.cb_open)prm.cb_open(worker);

					// up dependencles too 
					if(prm.dependencies){
						util.safeDictIter(prm.dependencies,(k,h)=>{
							h.open();
							wait.push(()=>h.isReady());
						});
					}
				}
				catch(e){
					happen.happenProp({
						class:'YgEs_Worker_Error',
						cause:'throw from a callback',
						src:getInfo('cb_open'),
						err:util.fromError(e),
					});
				}
			},
			poll_keep:(user)=>{
				if(opencount<1 || restart)return 'DOWN';

				// wait for delendencies 
				var cont=[]
				for(var d of wait){
					try{
						if(d())continue;
						cont.push(d);
					}
					catch(e){
						happen.happenProp({
							class:'YgEs_Worker_Error',
							cause:'throw from a callback',
							src:getInfo('wait for up'),
							err:util.fromError(e),
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
						if(prm.cb_ready)prm.cb_ready(worker);
					}
					catch(e){
						happen.happenProp({
							class:'YgEs_Worker_Error',
							cause:'throw from a callback',
							src:getInfo('cb_ready'),
							err:util.fromError(e),
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
					if(prm.poll_healthy)prm.poll_healthy(worker);
				}
				catch(e){
					happen.happenProp({
						class:'YgEs_Worker_Error',
						cause:'throw from a callback',
						src:getInfo('poll_healthy'),
						err:util.fromError(e),
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
					if(prm.poll_trouble)prm.poll_trouble(worker);
				}
				catch(e){
					happen.happenProp({
						class:'YgEs_Worker_Error',
						cause:'throw from a callback',
						src:getInfo('poll_trouble'),
						err:util.fromError(e),
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

	var worker={
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
			return handle(worker);
		},
		open:()=>{
			var h=worker.fetch();
			h.open();
			return h;
		},
	}

	var ctrlopt={
		name:name+'_Control',
		happen:happen,
		launcher:launcher,
		User:user,
		cb_done:(user)=>{
			ctrl=null;
			aborted=false;
			if(prm.cb_finish)prm.cb_finish(worker,happen.isCleaned());
		},
		cb_abort:(user)=>{
			ctrl=null;
			aborted=true;
			if(prm.cb_abort)prm.cb_abort(worker);
		},
	}

	var handle=(w)=>{
		var in_open=false;
		var h={
			name:name+'_Handle',

			getWorker:()=>{return worker;},
			getLauncher:()=>worker.getLauncher(),
			getHappeningManager:()=>worker.getHappeningManager(),
			getDependencies:()=>worker.getDependencies(),

			isOpenHandle:()=>in_open,
			isOpenWorker:()=>worker.isOpen(),
			isBusy:()=>worker.isBusy(),
			isReady:()=>worker.isReady(),
			isHalt:()=>worker.isHalt(),
			getState:()=>worker.getState(),

			restart:()=>worker.restart(),

			open:()=>{
				if(!in_open){
					in_open=true;
					++opencount;
				}
				if(!ctrl)ctrl=stmac.run('IDLE',states,ctrlopt);
			},
			close:()=>{
				if(!in_open)return;
				in_open=false;
				--opencount;
			},
		}
		return h;
	}

	return worker;
}


var mif={
	name:'YgEs_WorkerContainer',
	User:{},

	standby:_standby,
	launch:(prm)=>{return _standby(prm).fetch();},
	run:(prm)=>{return _standby(prm).open();},
}

export default mif;
