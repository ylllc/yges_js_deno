// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import Test from '../api/unittest.js';
import Timing from '../api/timing.js';

// Test Example ------------------------- //

const scenaria=[
	// test 1 
	{
		title:'Test Now',
		proc:(tool)=>{
			// can test by any conditions 
			Test.chk(true, 'always');
			// loose comparing 
			Test.chk_loose(1, '1', 'loose comparing');
			// strict comparing 
			Test.chk_strict(1, 1, 'strict comparing');
			// leftside less than rightside 
			Test.chk_less(1,2);
			// leftside equal or less than rightside 
			Test.chk_less_eq(1,2);
			Test.chk_less_eq(1,1);
			// leftside greater than rightside 
			Test.chk_great(2,1);
			// leftside equal or greater than rightside 
			Test.chk_great_eq(2,1);
			Test.chk_great_eq(2,2);
		},
	},
	// test 2 
	{
		title:'Test With Waiting',
		proc: async (tool)=>{
			//  the process is kept until all test were ended 
			await Timing.delayKit(2000).promise();
			Test.chk(true, 'delayed test');
		},
	},
	// test 3 
	{
		title:'Test Ignored',
		filter:false,
		proc: async (tool)=>{
			//  will not step it by filtered out
			Test.never('deny');
		},
	},
	// more ...
]

Test.run(scenaria);
