// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Test from '../../api/unittest.js';

// Log Capture Test --------------------- //

const scenaria=[
	{
		title:'Log Capturer',
		proc:(tool)=>{
			const Log=tool.Log;

			// capture a log for test 
			let subj=null;
			Log.Format=(src)=>{
				src.Msg=src.Capt+':'+src.Lev+':'+src.Msg;
			}
			Log.Way=(src)=>{
				Test.chk_strict(src.Msg,subj,'captured log');
			}

			// set showable log level 
			Log.Showable=Log.LEVEL.DEBUG;

			// set global log caption 
			Log.Caption='Global';

			subj='Global:3:test-msg';
			Log.info('test-msg');
		},
	},
]

Test.run(scenaria);
