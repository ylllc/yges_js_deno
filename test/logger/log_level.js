// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Test from '../../api/unittest.js';

// Log Level Test ----------------------- //

const scenaria=[
	{
		Title:'Log Level',
		Proc:(tool)=>{
			const Log=tool.Log;

			// capture a log for test 
			let count=0;
			Log.Way=(logger,src)=>{
				++count;
			}

			// set showable log level 
			Log.Showable=Log.LEVEL.DEBUG;
			Test.ChkStrict(count,0,'not logged yet');
			Log.Debug('?');
			Test.ChkStrict(count,1,'debug logged');
			Log.Trace('?'); // will be suppressed 
			Test.ChkStrict(count,1,'trace log  suppressed');

			// local log (unoverriden)
			let ll1=Log.CreateLocal('Local1',Log.LEVEL.WARN);
			ll1.Notice('?') // will be suppressed ;
			Test.ChkStrict(count,1,'notice log suppressed');
			ll1.Warn('?');
			Test.ChkStrict(count,2,'warn logged');

			// local log (instant overriden)
			let ll2=Log.CreateLocal('Local2');
			ll2.Way=(logger,msg)=>{count+=10;};
			ll2.Info('?');
			Test.ChkStrict(count,12,'local logged');
		},
	},
]

Test.Run(scenaria);
