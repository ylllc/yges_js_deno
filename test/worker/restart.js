// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Worker Restart Test //

import test from '../../api/unittest.js';
import eng from '../../api/engine.js';
import workmng from '../../api/worker.js';
import log from '../../api/logger.js';
import hap_global from '../../api/happening.js';

eng.start();

var worker=null;
var handle=null;
var launcher=eng.createLauncher();
var hap_local=hap_global.createLocal({
	happen:(hap)=>{log.fatal(hap.GetProp());},
});

var workset={
	launcher:launcher,
	happen:hap_local,
	user:{count:1},
	cb_open:(worker)=>{
		++worker.User.count;
	},
	cb_ready:(worker)=>{
		if(worker.User.count<10)worker.restart();
		else handle.close();
	},
	cb_finish:(worker)=>{
		test.chk_strict(worker.User.count,10);
	},
}

var scenaria=[
	{
		title:'Worker Restart',
		proc:async ()=>{
			worker=workmng.standby(workset);
			test.chk_strict(worker.User.count,1);
			handle=worker.fetch();
			handle.open();

			await launcher.toPromise();
			eng.shutdown();
		},
	},
]

test.run(scenaria);
