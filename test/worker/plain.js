// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Plain Worker Test //

import test from '../../api/unittest.js';
import eng from '../../api/engine.js';
import workmng from '../../api/worker.js';
import hap_global from '../../api/happening.js';

eng.start();

var scenaria=[
	{
		title:'Plain Worker',
		proc:async ()=>{
			var w=workmng.standby({});
			test.chk_strict(w.isOpen(),false);
			var h=w.open();
			test.chk_strict(w.isOpen(),true);
			h.close();
			test.chk_strict(w.isOpen(),false);
			eng.shutdown();
		},
	},
]

test.run(scenaria);
