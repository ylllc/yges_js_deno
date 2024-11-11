// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Happening Manager Test //

import test from '../../api/unittest.js';
import hap_global from '../../api/happening.js';

var scenaria=[
	{
		title:'Global Happenning Manager',
		proc:()=>{
			test.chk_strict(true,hap_global.isCleaned(),'initialised global manager');
		},
	},
	{
		title:'Local Happening Manager',
		proc:()=>{
			var hap_local1=hap_global.createLocal();
			var hap_local2=hap_local1.createLocal();

			test.chk_strict(true,hap_local1.isCleaned(),'initialised local1 manager');
			test.chk_strict(true,hap_local2.isCleaned(),'initialised local2 manager');
		},
	},
]

test.run(scenaria);
