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
validate(undefined,{Default:-123});
validate(undefined,{Required:true});
validate(undefined,{List:true});
validate(undefined,{Dict:true});
validate(undefined,{Struct:true});

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
