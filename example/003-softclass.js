// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import YgEs from '../api/common.js';
import Log from '../api/logger.js';

// Example: Soft-Class ------------------ //

// for debug: can access private members 
//YgEs.ShowPrivate=true;

// primal class 
const obj=YgEs.SoftClass();
Log.Info(obj.GetClassName());
Log.Info(obj.GetParentName());

// 1st extend class 
const priv1=obj.Extend('TestClass1',{
	// private members 
	test:1,
},{
	// public members 
	Func1:()=>'Test1',
});
Log.Info(obj.GetClassName());
Log.Info(obj.GetParentName());
Log.Info(priv1.test);
Log.Info(obj.Func1());

// 2nd extend class 
const priv2=obj.Extend('TestClass2',{
	// private members are included in parallel 
	test:2,
},{
	// public members are overridden 
	Func1:()=>'Test2',
});
Log.Info(obj.GetClassName());
Log.Info(obj.GetParentName());
Log.Info(priv1.test);
Log.Info(priv2.test);
Log.Info(obj.Func1());

// override func 
const super1=obj.Inherit('Func1',()=>{
	return super1()+'+overridden';
});
Log.Info(obj.Func1());

// private backdoor (YgEs.ShowPrivate=true required) 
Log.Info("* Debug private info *",obj._private_);
