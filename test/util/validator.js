// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import YgEs from '../../api/common.js';

// Class Definition --------------------- //

const scenaria=[
	{
		Title:'Correct Feeds',
		Proc:async (tool)=>{

			Test.ChkStrict(undefined,YgEs.Validate(undefined,{}));
			Test.ChkStrict(null,YgEs.Validate(null,{Nullable:true}));
			Test.ChkStrict(false,YgEs.Validate(false,{Boolable:true}));
			Test.ChkStrict(true,YgEs.Validate(true,{Boolable:true}));
			Test.ChkStrict(-12,YgEs.Validate(-12,{Integer:true}));
			Test.ChkStrict(-12,YgEs.Validate(-12,{Numeric:true}));
			Test.ChkStrict(-12.345,YgEs.Validate(-12.345,{Numeric:true}));
			Test.ChkStrict('123',YgEs.Validate('123',{Literal:true}));
			Test.ChkStrict([1,2,3.45],YgEs.Validate([1,2,3.45],{List:{Numeric:true}}));
			Test.ChkStrict([true,2,'3.45'],YgEs.Validate([true,2,'3.45'],{List:true}));
			Test.ChkStrict({a:1,b:2,c:3.45},YgEs.Validate({a:1,b:2,c:3.45},{Dict:{Numeric:true}}));
			Test.ChkStrict({a:true,b:2,c:'3.45'},YgEs.Validate({a:true,b:2,c:'3.45'},{Dict:true}));
			Test.ChkStrict({a:true,b:2,c:'3.45'},YgEs.Validate({a:true,b:2,c:'3.45'},{Struct:{a:{Boolable:true},b:{Integer:true},c:{Literal:true}}}));

			let obj1=new Date();
			Test.ChkStrict(obj1,YgEs.Validate(obj1,{Class:Date}));
			let obj2=YgEs.SoftClass();
			Test.ChkStrict(obj2,YgEs.Validate(obj2,{Class:'YgEs.SoftClass'}));
			Test.ChkStrict(obj1,YgEs.Validate(obj1,{Any:true}));

			let func=()=>{}
			Test.ChkStrict(func,YgEs.Validate(func,{Callable:true}));
		},
	},
	{
		Title:'User Validator',
		Proc:async (tool)=>{

			Test.ChkStrict(-1,YgEs.Validate(+1,{Any:true,Validator:(src,attr,tag)=>{
				return -src;
console.log(src);
			}}));
		},
	},
	{
		Title:'Complements',
		Proc:async (tool)=>{

			Test.ChkStrict(undefined,YgEs.Validate(undefined,{}));
			Test.ChkStrict(-123,YgEs.Validate(undefined,{Default:-123}));
			Test.ChkStrict({},YgEs.Validate(undefined,{Dict:true}));
			Test.ChkStrict([],YgEs.Validate(undefined,{List:true}));
		},
	},
]

Test.Run(scenaria);
