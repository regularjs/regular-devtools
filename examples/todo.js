var Todo = Regular.extend({
    template: "#todo",
    foo() {}
});

Todo.filter("test", function () {});

var TodoMVC = Regular.extend({
    template: '#todomvc', // id | template string | preparsed ast
    // get the list;
    config() {}
})

TodoMVC.component("custom-todo", Todo);

var todos = [
    { description: "sleep" },
    { description: "work" }
]
var app = new TodoMVC({
    data: {todos: todos}
}).$inject("#todoapp")

new TodoMVC({
    data: {todos: todos}
}).$inject(document.body);
new TodoMVC({
    data: {todos: todos}
}).$inject(document.body);
new TodoMVC({
    data: {todos: todos}
}).$inject(document.body);
new TodoMVC({
    data: {todos: todos}
}).$inject(document.body);
new TodoMVC({
    data: {todos: todos}
}).$inject(document.body);
new TodoMVC({
    data: {todos: todos}
}).$inject(document.body);
new TodoMVC({
    data: {todos: todos}
}).$inject(document.body);
new TodoMVC({
    data: {todos: todos}
}).$inject(document.body);
new TodoMVC({
    data: {todos: todos}
}).$inject(document.body);
new TodoMVC({
    data: {todos: todos}
}).$inject(document.body);
new TodoMVC({
    data: {todos: todos}
}).$inject(document.body);
new TodoMVC({
    data: {todos: todos}
}).$inject(document.body);
new TodoMVC({
    data: {todos: todos}
}).$inject(document.body);
new TodoMVC({
    data: {todos: todos}
}).$inject(document.body);
new TodoMVC({
    data: {todos: todos}
}).$inject(document.body);
new TodoMVC({
    data: {todos: todos}
}).$inject(document.body);
new TodoMVC({
    data: {todos: todos}
}).$inject(document.body);
