// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import Util from '../../api/util.js';

// Iterator Test ------------------------ //

let max=100;
// 0+1+...+99 
let acc0=max*(max-1)/2;

const scenaria=[
	{
		Title:'Step Iterator',
		Proc:async (tool)=>{
			let acc1=0,acc2=0,ct=0;

			for(let i=0;i<max;++i)acc1+=i;
			Test.ChkStrict(acc0,acc1,'standard loop');

			await new Promise((ok,ng)=>{
				Util.SafeStepIter(0,max,1,(i_)=>{
					setTimeout(()=>{
						acc2+=i_;
						if(++ct==max)ok();
					},10);
				});
			});
			Test.ChkStrict(acc0,acc2,'SafeStepIter: '+acc2);
		},
	},
	{
		Title:'Array Iterator',
		Proc:async (tool)=>{
			let t=[...Array(max).keys()];
			let acc1=0,ct=0;

			await new Promise((ok,ng)=>{
				Util.SafeArrayIter(t,(i_)=>{
					setTimeout(()=>{
						acc1+=i_;
						if(++ct==max)ok();
					},10);
				});
			});
			Test.ChkStrict(acc0,acc1,'SafeArrayIter: '+acc1);
		},
	},
	{
		Title:'Dict Iterator',
		Proc:async (tool)=>{
			let t={}
			for(let i=0;i<max;++i)t['_'+i]=i;
			let acc1=0,ct=0;

			await new Promise((ok,ng)=>{
				Util.SafeDictIter(t,(k,v)=>{
					setTimeout(()=>{
						acc1+=v;
						if(++ct==max)ok();
					},10);
				});
			});
			Test.ChkStrict(acc0,acc1,'SafeDictIter: '+acc1);
		},
	},
]

Test.Run(scenaria);
