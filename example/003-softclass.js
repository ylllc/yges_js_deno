// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import YgEs from '../api/common.js';
import Log from '../api/logger.js';

// Example: Soft-Class ------------------ //

// for debug: can access private members 
YgEs.ShowPrivate=true;

// primal class 
const obj=YgEs.SoftClass();
Log.Info(obj.GetClassName());

// 1st extend class 
const priv1=obj.Extend('TestClass1',{
	// private members 
	test:1,
},{
	// public members 
	Func1:()=>'Test1',
});
Log.Info(obj.GetClassName());
Log.Info(obj.GetGenealogy());
Log.Info(priv1.test);
Log.Info(obj.Func1());
// private instance can refer the public instance 
Log.Info(priv1._public.Func1());

// 2nd extend class 
const priv2=obj.Extend('TestClass2',{
	// private members are included in parallel 
	test:2,
},{
	// public members are overridden 
	Func1:()=>'Test2',
});
Log.Info(obj.GetClassName());
Log.Info(obj.GetGenealogy());
Log.Info(priv1.test);
Log.Info(priv2.test);
Log.Info(obj.Func1());

// trait 
const priv0=obj.Trait('MyTrait',{
	// private members are included in parallel 
	test:'OK',
},{
	// public members 
	FuncX:()=>'Trait '+priv0.test,
});
Log.Info(obj.GetClassName());
Log.Info(obj.GetGenealogy());
Log.Info(priv1.test);
Log.Info(priv2.test);
Log.Info(obj.FuncX());

// inherit func 
const super1=obj.Inherit('Func1',()=>{
	return super1()+'+overridden';
});
Log.Info(obj.Func1());

// double inherit make a warning 
// but can call correctly 
// (but makes backdoor table broken) 
const super1x=obj.Inherit('Func1',()=>{
	return super1x()+' again';
});
Log.Info(obj.Func1());

// can inherit again correctly after Extend() 
const priv3=obj.Extend('TestClass3');
const super2=obj.Inherit('Func1',()=>{
	return super2()+' more';
});
Log.Info(obj.Func1());

// double extend make a warning 
// but can extend correctly 
// (but makes backdoor table broken) 
const priv2x=obj.Extend('TestClass2');

// private backdoor (YgEs.ShowPrivate=true required) 
Log.Info("* Debug private info *",obj._private_);
Log.Info("* Debug inherit info *",obj._inherit_);
