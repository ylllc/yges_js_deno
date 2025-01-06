// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import HappeningManager from '../../api/happening.js';

// Happening Manager Test --------------- //

const scenaria=[
	{
		title:'Global Happenning Manager',
		proc:(tool)=>{
			Test.chk_strict(true,HappeningManager.isCleaned(),'initialised global manager');
		},
	},
	{
		title:'Local Happening Manager',
		proc:(tool)=>{
			let hap_local1=HappeningManager.createLocal();
			let hap_local2=hap_local1.createLocal();

			Test.chk_strict(true,hap_local1.isCleaned(),'initialised local1 manager');
			Test.chk_strict(true,hap_local2.isCleaned(),'initialised local2 manager');
		},
	},
]

Test.run(scenaria);
