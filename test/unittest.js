// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Test Example //

import test from '../api/unittest.js';

function delay(ms) {
	return new Promise((resolve)=>setTimeout(resolve,ms));
}

var scenaria=[
	// test 1 
	{
		title:'Test Now',
		proc:()=>{
			// can test by any conditions 
			test.chk(true, 'always');
			// loose comparing 
			test.chk_loose(1, '1', 'loose comparing');
			// strict comparing 
			test.chk_strict(1, 1, 'strict comparing');
		},
	},
	// test 2 
	{
		title:'Test With Waiting',
		proc: async ()=>{
			//  the process is kept until all test were ended 
			await delay(3000);
			test.chk(true, 'delayed test');
		},
	},
	// test 3 
	{
		title:'Test Ignored',
		filter:false,
		proc: async ()=>{
			//  will not step it by filtered out
			test.chk(false, 'deny');
		},
	},
	// more ...
]

test.run(scenaria);
