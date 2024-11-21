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
		title:'test now',
		proc:()=>{
			// can test by any conditions 
			test.chk(true, 'always');
			// loose comparing 
			test.chk_loose(1, '1', 'loose comparing');
			// strict comparing 
			test.chk_strict(1, 1, 'strict comparing');
			// leftside less than rightside 
			test.chk_less(1,2);
			// leftside equal or less than rightside 
			test.chk_less_eq(1,2);
			test.chk_less_eq(1,1);
			// leftside greater than rightside 
			test.chk_great(2,1);
			// leftside equal or greater than rightside 
			test.chk_great_eq(2,1);
			test.chk_great_eq(2,2);
		},
	},
	// test 2 
	{
		title:'with waiting',
		proc: async ()=>{
			//  the process is kept until all test were ended 
			await delay(3000);
			test.chk(true, 'delayed test');
		},
	},
	// test 3 
	{
		title:'ignored',
		filter:false,
		proc: async ()=>{
			//  will not step it by filtered out
			test.never('deny');
		},
	},
	// more ...
]

test.run(scenaria);
