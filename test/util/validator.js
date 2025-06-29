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

			const k2v={1:'One',2:'Two',4:'Four'}
			Test.ChkStrict(2,YgEs.Validate(2,{Key:k2v}));

			Test.ChkStrict([1,2,3.45],YgEs.Validate([1,2,3.45],{List:{Numeric:true}}));
			Test.ChkStrict([true,2,'3.45'],YgEs.Validate([true,2,'3.45'],{List:true}));
			Test.ChkStrict({a:1,b:2,c:3.45},YgEs.Validate({a:1,b:2,c:3.45},{Dict:{Numeric:true}}));
			Test.ChkStrict([1,2,3.45],YgEs.Validate([1,2,3.45],{Dict:{Numeric:true}}));
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
	{
		Title:'Safe Cloning',
		Proc:async (tool)=>{

			let src={S:{S1:'SafeCloneTest',S2:'OK'},T:new Date()}
			let dst=YgEs.Validate(src,{Clone:true,Struct:{
				S:{Struct:true},
				T:{Class:Date},
			}});
			src.S.S2='NG';
			Test.ChkStrict('OK',dst.S.S2,'deep copy test');

			// check keep Date instance 
			dst.T.toISOString();
		},
	},
	{
		Title:'Trivia',
		Proc:async (tool)=>{

			// null is not undefined, and not applied by default value 
			Test.ChkStrict('def',YgEs.Validate(undefined,{Nullable:true,Default:'def'}));
			Test.ChkStrict(null,YgEs.Validate(null,{Nullable:true,Default:'def'}));

			let src={A:12}

			// dst shared from src when skipped inner Struct validation 
			let dst=YgEs.Validate(src,{Struct:true});
			src.A=123;
			Test.ChkStrict(src.A,dst.A,'dst should shared from src');

			// dst not shared from src when checked inner Struct validation
			dst=YgEs.Validate(src,{Struct:{A:{Numeric:true}}});
			src.A=234;
			Test.ChkStrict(dst.A,123,'will be 123');
			Test.ChkStrict(src.A,234,'will be 234');

		},
	},
]

Test.Run(scenaria);
