
var Todo = Regular.extend({
  template: "#todo"
});

var TodoMVC = Regular.extend({
    template: '#todomvc', // id | template string | preparsed ast
    // get the list;
})

TodoMVC.component("custom-todo", Todo);

var todos = [
    { description: "sleep" },
    { description: "work" }
]
var app = new TodoMVC({
    data: {todos: todos}
}).$inject("#todoapp")