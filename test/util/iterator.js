// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Iterator Test //

import test from '../../api/unittest.js';
import util from '../../api/util.js';

var max=100;
// 0+1+...+99 
var acc0=max*(max-1)/2;

var scenaria=[
	{
		title:'Step Iterator',
		proc:async ()=>{
			var acc1=0,acc2=0,ct=0;

			for(var i=0;i<max;++i)acc1+=i;
			test.chk_strict(acc0,acc1,'standard loop');

			await new Promise((ok,ng)=>{
				util.safeStepIter(0,max,1,(i_)=>{
					setTimeout(()=>{
						acc2+=i_;
						if(++ct==max)ok();
					},10);
				});
			});
			test.chk_strict(acc0,acc2,'safeStepIter: '+acc2);
		},
	},
	{
		title:'Array Iterator',
		proc:async ()=>{
			var t=[...Array(max).keys()];
			var acc1=0,ct=0;

			await new Promise((ok,ng)=>{
				util.safeArrayIter(t,(i_)=>{
					setTimeout(()=>{
						acc1+=i_;
						if(++ct==max)ok();
					},10);
				});
			});
			test.chk_strict(acc0,acc1,'safeArrayIter: '+acc1);
		},
	},
	{
		title:'Dict Iterator',
		proc:async ()=>{
			var t={}
			for(var i=0;i<max;++i)t['_'+i]=i;
			var acc1=0,ct=0;

			await new Promise((ok,ng)=>{
				util.safeDictIter(t,(k,v)=>{
					setTimeout(()=>{
						acc1+=v;
						if(++ct==max)ok();
					},10);
				});
			});
			test.chk_strict(acc0,acc1,'safeDictIter: '+acc1);
		},
	},
]

test.run(scenaria);
