// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import Log from '../../api/logger.js';

// Log Capture Test --------------------- //

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

const scenaria=[
	{
		title:'Log Capturer',
		proc:(tool)=>{
			subj='Global:3:test-msg';
			Log.info('test-msg');
		},
	},
]

Test.run(scenaria);
