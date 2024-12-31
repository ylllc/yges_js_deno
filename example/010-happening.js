// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Examples: Happening Manager ---------- //

import HappeningManager from '../api/happening.js';
import Log from '../api/logger.js';

// can override common happening management procedure 
HappeningManager.Happened=(h)=>{
	Log.warn(h.toString(),h.getProp());
}

// wrapping any error type 
var h1=HappeningManager.happenMsg('Happened',{
	// override resolved callback 
	Resolved:(h)=>{
		Log.info('[Resolved] '+h.ToString());
	},
});
var h2=HappeningManager.happenProp({type:'Test',msg:'Happened'},{
	// user resolving protocol 
	user:{
		retry:()=>{
			// retry procedure from feature 
			//		:
			h2.resolve();
			Log.info('[Resolved] '+h2);
		},
	},
});
var h3=HappeningManager.happenError(new Error('Exception'));

// happened count 
Log.info('happened='+HappeningManager.countIssues());

// mark resolve (but still dirty)
h1.resolve();
Log.info('happened='+HappeningManager.countIssues());
// clean up 
HappeningManager.cleanup();
Log.info('happened='+HappeningManager.countIssues());

// local manager 
var lhap=HappeningManager.createLocal();

// local happen
var h4=lhap.happenMsg('Local Happened');
Log.info('happened='+HappeningManager.countIssues());

// polling 
HappeningManager.poll((h)=>{
	Log.info('poll: '+h);
});

// local abandon 
lhap.abandon();
Log.info('happened='+HappeningManager.countIssues());

// start user resolving protocol  
h2.User.retry();
HappeningManager.cleanup();
Log.info('happened='+HappeningManager.countIssues());

// global abandon 
HappeningManager.abandon();
Log.info('happened='+HappeningManager.countIssues());
