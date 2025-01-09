// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import HappeningManager from '../api/happening.js';
import Log from '../api/logger.js';

// Examples: Happening Manager ---------- //

// can override common happening management procedure 
HappeningManager.OnHappen=(h)=>{
	Log.Warn(h.ToString(),h.GetProp());
}

// wrapping any error type 
var h1=HappeningManager.HappenMsg('Happened',{
	// override resolved callback 
	OnResolved:(h)=>{
		Log.Info('[Resolved] '+h.ToString());
	},
});
var h2=HappeningManager.HappenProp({type:'Test',msg:'Happened'},{
	// user resolving protocol 
	User:{
		Retry:()=>{
			// retry procedure from feature 
			//		:
			h2.Resolve();
			Log.Info('[Resolved] '+h2);
		},
	},
});
var h3=HappeningManager.HappenError(new Error('Exception'));

// happened count 
Log.Info('happened='+HappeningManager.CountIssues());

// mark resolve (but still dirty)
h1.Resolve();
Log.Info('happened='+HappeningManager.CountIssues());
// clean up 
HappeningManager.CleanUp();
Log.Info('happened='+HappeningManager.CountIssues());

// local manager 
var lhap=HappeningManager.CreateLocal();

// local happen
var h4=lhap.HappenMsg('Local Happened');
Log.Info('happened='+HappeningManager.CountIssues());

// polling 
HappeningManager.Poll((h)=>{
	Log.Info('poll: '+h);
});

// local abandon 
lhap.Abandon();
Log.Info('happened='+HappeningManager.CountIssues());

// start user resolving protocol  
h2.User.Retry();
HappeningManager.CleanUp();
Log.Info('happened='+HappeningManager.CountIssues());

// global abandon 
HappeningManager.Abandon();
Log.Info('happened='+HappeningManager.CountIssues());
