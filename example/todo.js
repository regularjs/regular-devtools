
var Todo = Regular.extend({
  name: "todo",
  template: "#todo"
});

var TodoMVC = Regular.extend({
    template: '#todomvc', // id | template string | preparsed ast
    // get the list;
})
var todos = [
    { description: "sleep" },
    { description: "work" }
]
var app = new TodoMVC({
    data: {todos: todos}
}).$inject("#todoapp")