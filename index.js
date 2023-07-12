const ANY = "🥦_there's_could_be_any_value_what_you_can_imagine_🥦"
const TAIL="🥦_there's_tail_of_array_just_don't_care_what's_could_be_🥦"

const PRIMITIVE_AND_WRAPPER = {
    "boolean" : Boolean,
    "number" : Number,
    "bigint" : BigInt,
    "string" : String,
    "symbol" : Symbol
}

function isPrimitive(item) {
    return item === null || 
            ["undefined", ...Object.keys(PRIMITIVE_AND_WRAPPER)]
            .includes(typeof item) 
}

function isPrimitiveWrapper(item) {
    return Object.values(PRIMITIVE_AND_WRAPPER).some(w => item instanceof w)
}

function areEveryPrimitive(...maybeNotPrimitive) {
    return maybeNotPrimitive.length > 0 && maybeNotPrimitive.every(e => isPrimitive(e) || isPrimitiveWrapper(e))
}

function sameTypes(matchable, case_value) {
    return typeof matchable == typeof case_value
}

function sameWrapperTypes(matchable, case_pattern) {
    return Object.values(PRIMITIVE_AND_WRAPPER)
            .some(w => matchable instanceof w & case_pattern instanceof w)
}

function sameComplexClass(matchable, case_pattern) {
    return matchable.constructor.name === case_pattern.constructor.name
}

function isPrimitiveAndWrapperOrViceVersa(matchable, case_pattern) {
    return Object.entries(PRIMITIVE_AND_WRAPPER)
            .some(([pr, wrap]) => {
               return (typeof matchable === pr && case_pattern instanceof wrap) ||
                      (typeof case_pattern === pr && matchable instanceof wrap) 
            })
}

function areTheyStrictEqual(matchable, case_pattern) {
    return matchable === case_pattern
}

function areEveryArray(...maybeArrays) {
    return maybeArrays.length > 0 && maybeArrays.every(Array.isArray)
}

function areEveryComplexStruct(...maybeComplexStruct){
    return maybeComplexStruct.length > 0 &&
            maybeComplexStruct.every(i => !areEveryPrimitive(i) && !areEveryArray(i))
} 

function areMatchableTypes(matchable, case_pattern) {
    return [sameTypes, sameWrapperTypes, isPrimitiveAndWrapperOrViceVersa]
    .some(f => f(matchable, case_pattern))
}

function checkGuards(guards, matchable) {
    return guards.every(g => g(matchable))
}

function chooseCheckFunction(matchable, case_pattern) {
    if(areEveryArray(matchable, case_pattern)) return checkArraysRec
    if(areEveryComplexStruct(matchable, case_pattern)) return checkComplex
    if(areEveryPrimitive(matchable, case_pattern)) return checkPrimitives
    return null;
}

function checkPrimitives(matchable, case_pattern) {
    if (case_pattern == ANY || areTheyStrictEqual(matchable, case_pattern)) return true
    return areMatchableTypes(matchable, case_pattern) && areTheyStrictEqual(matchable.toString(), case_pattern.toString()) 
}

function checkArraysRec(matchable_array, case_pattern_array) {
    if([matchable_array, case_pattern_array].every(a => a.length == 0)) return true
    let [head_m, ...tail_m ] = matchable_array
    let [head_cp, ...tail_cp] = case_pattern_array
    if(head_cp === TAIL) return true
    if(head_cp === ANY) return checkArraysRec(tail_m, tail_cp)
    let check_func = chooseCheckFunction(head_m, head_cp)
    return check_func && check_func(head_m, head_cp) && checkArraysRec(tail_m, tail_cp)
}

function checkComplexRec(matchable, [kv_case_pattern, ...tail_case_pattern]) {
    if(kv_case_pattern == undefined) return true
    let [key_case_pattern, value_case_pattern] = kv_case_pattern
    let matchable_value = matchable[key_case_pattern]
    if(value_case_pattern === ANY) return checkComplexRec(matchable, tail_case_pattern)
    let check_func = chooseCheckFunction(matchable_value, value_case_pattern)
    return check_func && check_func(matchable_value, value_case_pattern) &&
		     checkComplexRec(matchable, tail_case_pattern)
}

function checkComplex(matchable, case_pattern_complex) {
    if(!sameComplexClass(matchable, case_pattern_complex)) return false
    return checkComplexRec(matchable, Object.entries(case_pattern_complex))
}

function ca$e(case_pattern, ...guards) {
    return (case_func) => 
                (matchable) => {
                    if(areTheyStrictEqual(matchable, case_pattern) && 
                            checkGuards(guards, matchable)){
                        return case_func
                    }
                    let check_func = chooseCheckFunction(matchable, case_pattern)
                    return check_func && 
                            check_func(matchable, case_pattern) &&
                            checkGuards(guards, matchable) ? case_func : null 
                }
}

function el$e(f) {
    return () => (matchable) => f(matchable)
}

function match(item) {
    function match_cases(item, [head_c, ...tail_c]) {
        if (head_c == undefined) return null
        return head_c(item) || match_cases(item, tail_c)  
    }

    return (...cases) => {
		const result_f = match_cases(item, cases)
		if (result_f != null) return result_f(item)
		throw Error("Match ERROR!!!");
	} 
}

module.exports = {
    ANY,
    TAIL,
    match,
    ca$e,
    el$e
}