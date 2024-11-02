// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Logger Examples //

import log from '../api/logger.js';

// set showable log level 
log.Showable=log.LEVEL.DEBUG;

// set global log caption 
log.Caption='Global';

// put log 
log.tick('TICK Log'); // will be suppressed 
log.trace('TRACE Log'); // will be suppressed 
log.debug('DEBUG Log');
log.info('INFO Log');
log.notice('NOTICE Log');
log.warn('WARN Log');
log.fatal('FATAL Log');
log.alert('ALERT Log');
log.emerg('EMERG Log');

// put log with variable level
log.put(log.LEVEL.INFO,'INFO Log too');
// overlevel logs are always suppressed 
log.put(log.LEVEL.NEVER,'NEVER Log');

// create local log instance 
var ll1=log.createLocal('Local',log.LEVEL.TRACE);

// put local log 
ll1.tick('Local TICK Log'); // will be suppressed 
ll1.trace('Local TRACE Log');
ll1.put(log.LEVEL.DEBUG,'Local DEBUG Log');

// can override output 
log.Format=(capt,lev,msg)=>{
	// returning is not necessarily a string 
	// but must acceptable in LogWay 
	return {capt:capt,lev:lev,msg:msg}
}
log.Way=(msg)=>{
	console.log(JSON.stringify(msg));
}
log.debug('Global override log');
// overridings affect to unoverridden local log 
ll1.debug('Local override log');

// local overridings are selected first 
var ll2=ll1.createLocal('Local2');
ll2.Format=(capt,lev,msg)=>msg;
ll2.Way=(msg)=>{
	console.log(msg);
}
ll2.info('super-overridden local log');
