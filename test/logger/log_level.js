// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Log Level Test //

import test from '../../api/unittest.js';
import log from '../../api/logger.js';

// capture a log for test 
var count=0;
log.Way=(msg)=>{
	++count;
}

var scenaria=[
	{
		title:'log level',
		proc:()=>{
			// set showable log level 
			log.Showable=log.LEVEL.DEBUG;
			test.chk_strict(count,0,'mismatch');
			log.debug('?');
			test.chk_strict(count,1,'mismatch');
			log.trace('?'); // will be suppressed 
			test.chk_strict(count,1,'mismatch');

			// local log (unoverriden)
			var ll1=log.createLocal('Local1',log.LEVEL.WARN);
			ll1.notice('?');
			test.chk_strict(count,1,'mismatch');
			ll1.warn('?');
			test.chk_strict(count,2,'mismatch');

			// local log (instant overriden)
			var ll2=log.createLocal('Local2');
			ll2.Way=(msg)=>{count+=10;};
			ll2.info('?');
			test.chk_strict(count,12,'mismatch');
		},
	},
]

test.run(scenaria);
