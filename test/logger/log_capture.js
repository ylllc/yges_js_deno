// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Test from '../../api/unittest.js';

// Log Capture Test --------------------- //

const scenaria=[
	{
		Title:'Log Capturer',
		Proc:(tool)=>{
			const Log=tool.Log;

			// capture a log for test 
			let subj=null;
			Log.Format=(logger,src)=>{
				src.Text=src.Capt+':'+src.Lev+':'+src.Msg;
			}
			Log.Way=(logger,src)=>{
				Test.ChkStrict(src.Text,subj,'captured log');
			}

			// set showable log level 
			Log.Showable=Log.LEVEL.DEBUG;

			// set global log caption 
			Log.Caption='Global';

			subj='Global:3:test-msg';
			Log.Info('test-msg');
		},
	},
]

Test.Run(scenaria);
