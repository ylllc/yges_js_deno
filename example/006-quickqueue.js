// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Example: Quick Queue //

import qq from '../api/quickqueue.js';
import log from '../api/logger.js';

function test(){

	// create an arguments queue 
	var q=qq.create(arguments);

	// 1st arg 
	log.info(q.next());

	// 2nd arg 
	log.info(q.next());

	// 3rd arg (not step)
	log.info(q.peek());

	// 3rd arg again
	log.info(q.next());

	// 4th arg
	log.info(q.next());

	q.reset();

	// 1st arg again
	log.info(q.next());
}

test(1,'a',2);
