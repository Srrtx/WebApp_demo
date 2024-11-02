// // var a = 1;
// // var b = 1.23;
// // var c = "Hi";
// // var d = true;
// // var e = a + b;
// // var f = c + a;
// // console.log(f);
// // console.log("The result of a + b is" + (a + b));
// // console.log(a +" + "+b+ " = "  + (a+b))
// // // back tick
// // console.log(`${a} + ${b} = ${a+b}`)

// // const age = 15;
// // if(age >= 18){
// //     alert("You are adult!")
// // }
// // else{
// //     alert("You are teenager")
// // }
// function checkAge(age1,age2){
//     if(age1 >= 18 && age2 >= 18)//{
//     //     alert("Both are adult")
//     // }
//     return "Both are adult"
// }
// const result = checkAge(18,25);
// alert(result);

// function sum(one,two){
//     return one+two;
// }

// const sum = (one,two) => one +two
    

// alert(sum(99,50));

// JS array
const fruit = ["apple","banana","orange"];
console.log(fruit.length);
console.log(fruit[0]);
console.log(fruit[fruit.length-1]);

for(let i=0;i<fruit.length;i++){
    console.log(fruit[i]);
}

fruit.forEach(function(value,index) {
    console.log(value);
});