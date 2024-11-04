// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Examples: Happening Manager //

import hap from '../api/happening.js';
import log from '../api/logger.js';

// can override common happening management procedure 
hap.Happened=(h)=>{
	log.warn(h.ToJSON());
}

// wrapping any error type 
var h1=hap.happenMsg('Happened',{
	// override resolved callback 
	Resolved:(h)=>{
		log.info('[Resolved] '+h.ToString());
	},
});
var h2=hap.happenProp({type:'Test',msg:'Happened'},{
	// user resolving protocol 
	User:{
		retry:()=>{
			// retry procedure from feature 
			//		:
			h2.resolve();
			log.info('[Resolved] '+h2.ToString());
		},
	},
});
var h3=hap.happenError(new Error('Exception'));

// happened count 
log.info('happened='+hap.countIssues());

// mark resolve (but still dirty)
h1.resolve();
log.info('happened='+hap.countIssues());
// clean up 
hap.cleanup();
log.info('happened='+hap.countIssues());

// local manager 
var lhap=hap.createLocal();

// local happen
var h4=lhap.happenMsg('Local Happened');
log.info('happened='+hap.countIssues());

// polling 
hap.poll((h)=>{
	log.info('poll: '+h.ToString());
});

// local abandon 
lhap.abandon();
log.info('happened='+hap.countIssues());

// start user resolving protocol  
h2.User.retry();
hap.cleanup();
log.info('happened='+hap.countIssues());

// global abandon 
hap.abandon();
log.info('happened='+hap.countIssues());
