// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import QuickQueue from '../api/quickqueue.js';
import Log from '../api/logger.js';

// Example: Quick Queue ----------------- //

function test(){

	// create an arguments queue 
	var q=QuickQueue.Create(arguments);

	// 1st arg 
	Log.Info(q.Next());

	// 2nd arg 
	Log.Info(q.Next());

	// 3rd arg (not step)
	Log.Info(q.Peek());

	// 3rd arg again
	Log.Info(q.Next());

	// 4th arg
	Log.Info(q.Next());

	q.Reset();

	// 1st arg again
	Log.Info(q.Next());
}

test(1,'a',2);
