// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import YgEs from '../../api/common.js';

// Class Definition --------------------- //

const scenaria=[
	{
		Title:'Primal Class',
		Proc:async (tool)=>{

			const obj=YgEs.SoftClass();
			Test.ChkStrict('YgEs.SoftClass',obj.GetClassName());
			Test.ChkStrict(true,obj.IsComprised('YgEs.SoftClass'),'means SoftClass instance');
			Test.ChkStrict(false,obj.IsComprised(undefined),'means not extended');

			Test.ChkStrict('YgEs.SoftClass',obj.GetCaption(),'caption is same to class name');
			obj.Name='MySoftClass';
			Test.ChkStrict('MySoftClass',obj.GetCaption(),'caption is same to user defined name');
		},
	},
	{
		Title:'Extended Class',
		Proc:async (tool)=>{

			const obj=YgEs.SoftClass();
			const cn1='TestClass1';
			const cn2='TestClass2';

			const priv1=obj.Extend(cn1,{test1:-1},{
				Func1:()=>123,
			});
			Test.ChkStrict(cn1,obj.GetClassName());
			Test.ChkStrict(true,obj.IsComprised('YgEs.SoftClass'),'means SoftClass instance');
			Test.ChkStrict(true,obj.IsComprised(cn1),'means extended');
			Test.ChkStrict(false,obj.IsComprised(cn2),'try with unrelated class');
			Test.ChkStrict(-1,priv1.test1,'private member');
			Test.ChkStrict(123,obj.Func1(),'public func');
			Test.ChkStrict(123,priv1._public.Func1(),'public func via private instance');

			const priv2=obj.Extend(cn2,{test1:-2},{
				Func1:()=>234,
			});
			Test.ChkStrict(cn2,obj.GetClassName());
			Test.ChkStrict(true,obj.IsComprised('YgEs.SoftClass'),'means SoftClass instance');
			Test.ChkStrict(true,obj.IsComprised(cn1),'means extended');
			Test.ChkStrict(true,obj.IsComprised(cn2),'means extended');
			Test.ChkStrict(-2,priv2.test1,'private member');
			Test.ChkStrict(-1,priv1.test1,'parent private member should kept');
			Test.ChkStrict(234,obj.Func1(),'public func is overridden');
		},
	},
	{
		Title:'Trait Class',
		Proc:async (tool)=>{

			const obj=YgEs.SoftClass();
			const cn1='TraitClass';

			const priv1=obj.Trait(cn1,{traited:true},{
				Func1:()=>-123,
			});
			Test.ChkStrict('YgEs.SoftClass',obj.GetClassName());
			Test.ChkStrict(true,obj.IsComprised('YgEs.SoftClass'),'means SoftClass instance');
			Test.ChkStrict(true,obj.IsComprised(cn1),'trait class inside');
			Test.ChkStrict(true,priv1.traited,'private member');
			Test.ChkStrict(-123,obj.Func1(),'public func');

			obj.Untrait(cn1);
			Test.ChkStrict(false,obj.IsComprised(cn1),'untraited class');
			Test.ChkStrict(undefined,obj.Func1,'untraited function');
		},
	},
	{
		Title:'Supercallable Inherit Func',
		Proc:async (tool)=>{

			const obj=YgEs.SoftClass();

			const super0=obj.Inherit('Func1',()=>111);
			Test.ChkStrict(undefined,super0,'undefined superfunc');
			Test.ChkStrict(111,obj.Func1(),'base func');

			const super1=obj.Inherit('Func1',()=>super1()+222);
			Test.ChkStrict(333,obj.Func1(),'inherit func with base');
		},
	},
	{
		Title:'Private Backdoor',
		Proc:async (tool)=>{

			const back=YgEs.ShowPrivate;
			YgEs.ShowPrivate=true;

			const obj1=YgEs.SoftClass();
			const cn1='TestClass1';
			const cn2='TestClass2';

			const priv1=obj1.Extend(cn1,{test1:-1});
			const priv2=obj1.Extend(cn2,{test2:-2});

			YgEs.ShowPrivate=false;

			const obj2=YgEs.SoftClass();

			YgEs.ShowPrivate=back;

			obj2.Extend(cn1,{test1:-1});
			obj2.Extend(cn2,{test2:-2});

			Test.ChkStrict(-1,priv1.test1,'private 1');
			Test.ChkStrict(-2,priv2.test2,'private 2');

			Test.ChkStrict(-1,obj1._private_[cn1].test1,'private 1 via backdoor');
			Test.ChkStrict(-2,obj1._private_[cn2]?.test2,'private 2 via backdoor');

			Test.ChkStrict(undefined,obj2._private_[cn1]?.test1,'private 1 blocked via backdoor');
			Test.ChkStrict(undefined,obj2._private_[cn2]?.test2,'private 2 blocked via backdoor');
		},
	},
]

Test.Run(scenaria);
