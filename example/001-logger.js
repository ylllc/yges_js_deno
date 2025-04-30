// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Log from '../api/logger.js';

// Example: Logger ---------------------- //

// set showable log level 
Log.Showable=Log.LEVEL.DEBUG;

// set global log caption 
Log.Caption='Global';

// put log 
Log.Tick('TICK Log'); // will be suppressed 
Log.Trace('TRACE Log'); // will be suppressed 
Log.Debug('DEBUG Log');
Log.Info('INFO Log');
Log.Notice('NOTICE Log');
Log.Warn('WARN Log');
Log.Fatal('FATAL Log');
Log.Crit('CRIT Log');
Log.Alert('ALERT Log');
Log.Emerg('EMERG Log');

// put log with variable level
Log.Put(Log.LEVEL.INFO,'INFO Log too');
// overlevel logs are always suppressed 
Log.Put(Log.LEVEL.NEVER,'NEVER Log');

// can output an object directly, without JSON.stringify(), more correct   
let obj={a:1,b:NaN,c:Infinity,d:[undefined]}
Log.Debug(JSON.stringify(obj));
Log.Debug(obj);

// can outputan object as extra properties 
// useful on frontend, put on console without stringify 
Log.Debug('Log Props',obj);

// can postpone creating message to reduce CPU cost
Log.Debug(()=>'deferred message creation: '+Math.log10(1000));

// create local log instance 
let ll1=Log.CreateLocal('Local',Log.LEVEL.TRACE);

// put local log 
ll1.Tick('Local TICK Log'); // will be suppressed 
ll1.Trace('Local TRACE Log');
ll1.Put(Log.LEVEL.DEBUG,'Local DEBUG Log');

// can override output 
Log.Format=(src)=>{
}
Log.Way=(src)=>{
	console.log(JSON.stringify(src));
}
Log.Debug('Global override log');
// overridings affect to unoverridden local log 
ll1.Debug('Local override log');

// local overridings are selected first 
let ll2=ll1.CreateLocal('Local2');
ll2.Format=(src)=>{
	src.Text='* '+src.Msg+' *';
}
ll2.Way=(src)=>{
	console.log(src.Text);
}
ll2.Info('super-overridden local log');
