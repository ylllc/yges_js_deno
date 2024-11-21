// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Quick Queue Test //

import test from '../../api/unittest.js';
import qq from '../../api/quickqueue.js';

function create(/*...*/){
	var a=arguments;
	return qq.create(arguments);
}

var scenaria=[
	{
		title:'Empty Queue',
		proc:async ()=>{
			var q=qq.create([]);

			test.chk_strict(0,q.count());
			test.chk_strict(0,q.pos());
			test.chk_strict(true,q.isEnd());
			test.chk_strict(undefined,q.peek());
			test.chk_strict(undefined,q.next());
			test.chk_strict(0,q.pos());
		},
	},
	{
		title:'Array Queue',
		proc:async ()=>{
			var q=qq.create([2,'ABC',-7]);

			test.chk_strict(3,q.count());
			test.chk_strict(0,q.pos());
			test.chk_strict(false,q.isEnd());
			test.chk_strict(2,q.peek());
			test.chk_strict(2,q.next());
			test.chk_strict(1,q.pos());
			test.chk_strict('ABC',q.next());
			test.chk_strict(2,q.pos());
			test.chk_strict(false,q.isEnd());
			test.chk_strict(-7,q.next());
			test.chk_strict(3,q.pos());
			test.chk_strict(true,q.isEnd());
		},
	},
	{
		title:'Argument Queue',
		proc:async ()=>{
			var q=create(5,'T',[false,true],null);
			test.chk_strict(4,q.count());
			test.chk_strict(0,q.pos());
			test.chk_strict(5,q.next());
			test.chk_strict('T',q.next());
			q.reset();
			test.chk_strict(0,q.pos());
			test.chk_strict(5,q.peek());
		},
	},
	{
		title:'After Push',
		proc:async ()=>{
			var a=[]
			var q=qq.create(a);
			test.chk_strict(0,q.count());
			test.chk_strict(0,q.pos());
			a.push(-12);
			test.chk_strict(1,q.count());
			test.chk_strict(-12,q.next());
		},
	},
]

test.run(scenaria);
