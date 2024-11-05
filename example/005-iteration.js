// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Examples: Iterators //

import util from '../api/util.js';
import log from '../api/logger.js';

// a famous problem 
// variables in looping scope are broken in delayed callbacks. 
for(var i=0;i<5;++i){
	setTimeout(()=>{
		log.warn('bad loop: '+i);
	},100);
}

// usually, such as this CRAZY coding for avoid the problem. 
for(var i=0;i<5;++i){
	((i_)=>{
		setTimeout(()=>{
			log.notice('good loop: '+i_);
		},100);
	})(i);
}

// safestepiter() is masking the CRAZY coding. 
util.safestepiter(0,5,1,(i)=>{
	setTimeout(()=>{
		log.info('safe loop: '+i);
	},100);
});

// can backword 
util.safestepiter(0,-5,-2,(i)=>{
	setTimeout(()=>{
		log.info('back skip loop: '+i);
	},100);
});

// return false to break safe loop.
util.safestepiter(0,5,1,(i)=>{
	setTimeout(()=>{
		log.info('braking in the safe loop: '+i);
	},100);
	return i<3;
});

// unstoppable iterations are blocked. 
util.safestepiter(0,5,-1,(i)=>{
	setTimeout(()=>{
		log.emerg('buggy loop: '+i);
	},100);
});

// can iterate an array likewise 
var a=[5,2.3,'x',5,-11]
util.safearrayiter(a,(v)=>{
	setTimeout(()=>{
		log.info('array iteration: '+v);
	},100);
});

// can iterate an object likewise 
var b={'a':'B',4.4:-0.6,true:false}
util.safedictiter(b,(k,v)=>{
	setTimeout(()=>{
		log.info('object iteration: '+k+':'+v);
	},100);
});