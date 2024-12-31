// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Examples: Quick Queue ---------------- //

import QuickQueue from '../api/quickqueue.js';
import Log from '../api/logger.js';

function test(){

	// create an arguments queue 
	var q=QuickQueue.create(arguments);

	// 1st arg 
	Log.info(q.next());

	// 2nd arg 
	Log.info(q.next());

	// 3rd arg (not step)
	Log.info(q.peek());

	// 3rd arg again
	Log.info(q.next());

	// 4th arg
	Log.info(q.next());

	q.reset();

	// 1st arg again
	Log.info(q.next());
}

test(1,'a',2);
