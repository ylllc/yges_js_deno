// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

// Examples: Logger --------------------- //

import Log from '../api/logger.js';

// set showable log level 
Log.Showable=Log.LEVEL.DEBUG;

// set global log caption 
Log.Caption='Global';

// put log 
Log.tick('TICK Log'); // will be suppressed 
Log.trace('TRACE Log'); // will be suppressed 
Log.debug('DEBUG Log');
Log.info('INFO Log');
Log.notice('NOTICE Log');
Log.warn('WARN Log');
Log.fatal('FATAL Log');
Log.alert('ALERT Log');
Log.emerg('EMERG Log');

// put log with variable level
Log.put(Log.LEVEL.INFO,'INFO Log too');
// overlevel logs are always suppressed 
Log.put(Log.LEVEL.NEVER,'NEVER Log');

// can output an object directly, without JSON.stringify(), more correct   
let obj={a:1,b:NaN,c:Infinity,d:[undefined]}
Log.debug(JSON.stringify(obj));
Log.debug(obj);

// can outputan object as extra properties 
// useful on frontend, put on console without stringify 
Log.debug('Log Props',obj);

// can postpone creating message to reduce CPU cost
Log.debug(()=>'deferred message creation: '+Math.log10(1000));

// create local log instance 
let ll1=Log.createLocal('Local',Log.LEVEL.TRACE);

// put local log 
ll1.tick('Local TICK Log'); // will be suppressed 
ll1.trace('Local TRACE Log');
ll1.put(Log.LEVEL.DEBUG,'Local DEBUG Log');

// can override output 
Log.Format=(src)=>{
}
Log.Way=(src)=>{
	console.log(JSON.stringify(src));
}
Log.debug('Global override log');
// overridings affect to unoverridden local log 
ll1.debug('Local override log');

// local overridings are selected first 
let ll2=ll1.createLocal('Local2');
ll2.Format=(src)=>{
	src.Msg='* '+src.Msg+' *';
}
ll2.Way=(src)=>{
	console.log(src.Msg);
}
ll2.info('super-overridden local log');
