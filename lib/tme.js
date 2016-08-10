//tiny middleware engine

//function definition:
//  func(*initials*..., next) try { 
//      next: () {} => true ? end : queue[n + 1](*...*, next);
//  } catch (e) {
//      next(err)
// }

//init function def:
//  init(*initials*, , done)

