// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Util from '../api/util.js';
import Log from '../api/logger.js';

// Example: Iterators ------------------- //

// a famous problem 
// variables in looping scope are broken in delayed callbacks. 
for(var i=0;i<5;++i){
	setTimeout(()=>{
		Log.Warn('bad loop: '+i);
	},100);
}

// usually, such as this CRAZY coding for avoid the problem. 
for(var i=0;i<5;++i){
	((i_)=>{
		setTimeout(()=>{
			Log.Notice('good loop: '+i_);
		},100);
	})(i);
}

// SafeStepIter() is masking the CRAZY coding. 
Util.SafeStepIter(0,5,1,(i)=>{
	setTimeout(()=>{
		Log.Info('safe loop: '+i);
	},100);
});

// can backword 
Util.SafeStepIter(0,-5,-2,(i)=>{
	setTimeout(()=>{
		Log.Info('back skip loop: '+i);
	},100);
});

// return false to break safe loop.
Util.SafeStepIter(0,5,1,(i)=>{
	setTimeout(()=>{
		Log.Info('braking in the safe loop: '+i);
	},100);
	return i<3;
});

// unstoppable iterations are blocked. 
Util.SafeStepIter(0,5,-1,(i)=>{
	setTimeout(()=>{
		Log.Emerg('buggy loop: '+i);
	},100);
});

// can iterate an array likewise 
var a=[5,2.3,'x',5,-11]
Util.SafeArrayIter(a,(v)=>{
	setTimeout(()=>{
		Log.Info('array iteration: '+v);
	},100);
});

// can iterate an object likewise 
var b={'a':'B',4.4:-0.6,true:false}
Util.SafeDictIter(b,(k,v)=>{
	setTimeout(()=>{
		Log.Info('object iteration: '+k+':'+v);
	},100);
});
