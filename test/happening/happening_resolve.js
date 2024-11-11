// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Happening Manager Test //

import test from '../../api/unittest.js';
import log from '../../api/logger.js';
import hap_global from '../../api/happening.js';

log.Way=(msg)=>{
//	console.log(msg);
}

var scenaria=[
	{
		title:'Happening Resolving',
		proc:()=>{
			var hap_local1=hap_global.createLocal();
			var hap_local2=hap_local1.createLocal();
			var hap_local3=hap_local2.createLocal();

			var h1=hap_local1.happenMsg('hap1');
			var h2=hap_local2.happenMsg('hap2');
			var h3=hap_local3.happenMsg('hap3');
			test.chk_strict(3,hap_global.countIssues(),'global manager issue count');
			test.chk_strict(3,hap_local1.countIssues(),'local1 manager issue count');
			test.chk_strict(2,hap_local2.countIssues(),'local2 manager issue count');
			test.chk_strict(1,hap_local3.countIssues(),'local3 manager issue count');

			h2.resolve();
			test.chk_strict(2,hap_local2.countIssues(),'resolved but dirty');

			hap_local1.cleanup();
			test.chk_strict(2,hap_global.countIssues(),'local1 cleaned up');
			test.chk_strict(2,hap_local1.countIssues(),'local1 cleaned up');
			test.chk_strict(1,hap_local2.countIssues(),'local1 cleaned up');
			test.chk_strict(1,hap_local3.countIssues(),'local1 cleaned up');

			hap_local2.abandon();
			test.chk_strict(1,hap_global.countIssues(),'local2 abandoned');
			test.chk_strict(1,hap_local1.countIssues(),'local2 abandoned');
			test.chk_strict(0,hap_local2.countIssues(),'local2 abandoned');
			test.chk_strict(0,hap_local3.countIssues(),'local2 abandoned');

			h3=hap_local3.happenMsg('hap3-2');
			test.chk_strict(2,hap_global.countIssues(),'local3 happened');
			test.chk_strict(2,hap_local1.countIssues(),'local3 happened');
			test.chk_strict(1,hap_local2.countIssues(),'local3 happened');
			test.chk_strict(1,hap_local3.countIssues(),'local3 happened');

			hap_global.abandon();
			test.chk_strict(0,hap_global.countIssues(),'global abandoned');
			test.chk_strict(0,hap_local1.countIssues(),'global abandoned');
			test.chk_strict(0,hap_local2.countIssues(),'global abandoned');
			test.chk_strict(0,hap_local3.countIssues(),'global abandoned');
			test.chk_strict(true,hap_global.isCleaned(),'global cleaned');
			test.chk_strict(true,hap_local1.isCleaned(),'global cleaned');
			test.chk_strict(true,hap_local2.isCleaned(),'global cleaned');
			test.chk_strict(true,hap_local3.isCleaned(),'global cleaned');
		},
	},
]

test.run(scenaria);
