// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import HappeningManager from '../../api/happening.js';
import Log from '../../api/logger.js';

// Happening Manager Test --------------- //

Log.Way=(src)=>{
//	console.log(src.Msg);
}

const scenaria=[
	{
		title:'Happening Resolving',
		proc:(tool)=>{
			let hap_local1=HappeningManager.createLocal();
			let hap_local2=hap_local1.createLocal();
			let hap_local3=hap_local2.createLocal();

			let h1=hap_local1.happenMsg('hap1');
			let h2=hap_local2.happenMsg('hap2');
			let h3=hap_local3.happenMsg('hap3');
			Test.chk_strict(3,HappeningManager.countIssues(),'global manager issue count');
			Test.chk_strict(3,hap_local1.countIssues(),'local1 manager issue count');
			Test.chk_strict(2,hap_local2.countIssues(),'local2 manager issue count');
			Test.chk_strict(1,hap_local3.countIssues(),'local3 manager issue count');

			h2.resolve();
			Test.chk_strict(2,hap_local2.countIssues(),'resolved but dirty');

			hap_local1.cleanup();
			Test.chk_strict(2,HappeningManager.countIssues(),'local1 cleaned up');
			Test.chk_strict(2,hap_local1.countIssues(),'local1 cleaned up');
			Test.chk_strict(1,hap_local2.countIssues(),'local1 cleaned up');
			Test.chk_strict(1,hap_local3.countIssues(),'local1 cleaned up');

			hap_local2.abandon();
			Test.chk_strict(1,HappeningManager.countIssues(),'local2 abandoned');
			Test.chk_strict(1,hap_local1.countIssues(),'local2 abandoned');
			Test.chk_strict(0,hap_local2.countIssues(),'local2 abandoned');
			Test.chk_strict(0,hap_local3.countIssues(),'local2 abandoned');

			h3=hap_local3.happenMsg('hap3-2');
			Test.chk_strict(2,HappeningManager.countIssues(),'local3 happened');
			Test.chk_strict(2,hap_local1.countIssues(),'local3 happened');
			Test.chk_strict(1,hap_local2.countIssues(),'local3 happened');
			Test.chk_strict(1,hap_local3.countIssues(),'local3 happened');

			HappeningManager.abandon();
			Test.chk_strict(0,HappeningManager.countIssues(),'global abandoned');
			Test.chk_strict(0,hap_local1.countIssues(),'global abandoned');
			Test.chk_strict(0,hap_local2.countIssues(),'global abandoned');
			Test.chk_strict(0,hap_local3.countIssues(),'global abandoned');
			Test.chk_strict(true,HappeningManager.isCleaned(),'global cleaned');
			Test.chk_strict(true,hap_local1.isCleaned(),'global cleaned');
			Test.chk_strict(true,hap_local2.isCleaned(),'global cleaned');
			Test.chk_strict(true,hap_local3.isCleaned(),'global cleaned');
		},
	},
]

Test.run(scenaria);
