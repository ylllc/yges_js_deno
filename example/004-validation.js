// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import YgEs from '../api/common.js';
import Log from '../api/logger.js';

// Example: Validation ------------------ //

// validator common proc 
const validate=(src,attr)=>{

	let dst=YgEs.Validate(src,attr);
	Log.Info(YgEs.Inspect(src)+' => '+YgEs.Inspect(dst),attr);
}

// from null 
validate(null,{Nullable:true});
validate(null,{Boolable:true});
validate(null,{Integer:true});
validate(null,{Numeric:true});
validate(null,{Literal:true});
validate(null,{});

// from undefined 
validate(undefined,{Nullable:true});
validate(undefined,{Boolable:true});
validate(undefined,{Integer:true});
validate(undefined,{Numeric:true});
validate(undefined,{Literal:true});
validate(undefined,{Required:true});
validate(undefined,{List:true});
validate(undefined,{Dict:true});
validate(undefined,{Struct:true});
validate(undefined,{Class:Object});

// Complementation from undefind, and not null 
validate(undefined,{Default:-123});
validate(null,{Default:-123});
validate(null,{Nullable:true,Default:-123});

// from bool 
validate(false,{Boolable:true});
validate(false,{Integer:true});
validate(false,{Numeric:true});
validate(false,{Literal:true});
validate(false,{});

validate(true,{Boolable:true});
validate(true,{Integer:true});
validate(true,{Numeric:true});
validate(true,{Literal:true});
validate(true,{});

// from number 
validate(-123,{Integer:true});
validate(-123.45,{Numeric:true});
validate(-123.45,{Integer:true});
validate(-123.45,{Numeric:true,Min:0});
validate(-123.45,{Numeric:true,Max:-150});
validate(-123.45,{Boolable:true});
validate(0,{Boolable:true});
validate(-123.45,{Literal:true});
validate(-123.45,{});

// from string 
validate('',{Literal:true});
validate('',{Literal:true,Min:1});
validate('123456',{Literal:true,Max:5});
validate('',{Boolable:true});
validate('false',{Boolable:true});
validate('123.45',{Numeric:true});
validate('123.45',{Integer:true});
validate('-Infinity',{Numeric:true});
validate('NaN',{Numeric:true});
validate('NaN',{Numeric:true,NaNable:true});

// from array
validate([1,2,3.14],{List:{Integer:true}});

// from object 
validate({A:false,B:true,C:null},{Dict:{Boolable:true}});
validate({D:false,E:-1,F:null},{Struct:{
	D:{Boolable:true},
	E:{Integer:true},
}});
validate(new Date,{Class:Date});
validate(YgEs.SoftClass(),{Class:'YgEs.SoftClass'});

// user validator 
validate(false,{Any:true,Validator:(src,attr,tag)=>{
	if(!src)YgEs.CoreWarn(tag+' always true');
	return true;
}});

// making quick deep copy 
let src1={A:12,B:{B1:-1,B2:'OK'}}
let dst1a=YgEs.Validate(src1,{Struct:true});
let dst1b=YgEs.Validate(src1,{Others:true,Struct:{}});
let dst1c=YgEs.Validate(src1,{Struct:true,Clone:true});
src1.A=23;
src1.B.B2='NG';
Log.Info(YgEs.Inspect(src1)+'; changed source');
Log.Info(YgEs.Inspect(dst1a)+'; quick validation (full referenced)');
Log.Info(YgEs.Inspect(dst1b)+'; 1 layer deep copy (sub objects are referenced)');
Log.Info(YgEs.Inspect(dst1c)+'; deep copy');

// Clone via validator keep reference of class instance 
let src2={S:{S1:'SafeCloneTest',S2:'OK'},T:new Date()}
let dst2a=YgEs.Clone(src2);
let dst2b=YgEs.Validate(src2,{Clone:true,Struct:{
	S:{Struct:true},
	T:{Class:Date},
}});
src2.S.S2='NG';
Log.Info(YgEs.Inspect(src2)+'; changed source');
Log.Info(YgEs.Inspect(dst2a)+'; simple Clone');
Log.Info(YgEs.Inspect(dst2b)+'; Clone via validator');
try{Log.Info(dst2a.T.toISOString()+'; will crash');}catch(e){Log.Fatal(YgEs.FromError(e));}
Log.Info(dst2b.T.toISOString()+'; keep Date instance');
