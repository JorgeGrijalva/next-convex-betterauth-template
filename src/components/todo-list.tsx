"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/utils/api";
import { Loader2, Plus, Trash2 } from "lucide-react";

export function TodoList() {
  const [newTodo, setNewTodo] = useState("");
  const utils = api.useContext();

  // Queries
  const { data: todos, isLoading } = api.todo.getAll.useQuery();

  // Mutations
  const createTodo = api.todo.create.useMutation({
    onSuccess: () => {
      utils.todo.getAll.invalidate();
      setNewTodo("");
    },
  });

  const updateTodo = api.todo.update.useMutation({
    onSuccess: () => {
      utils.todo.getAll.invalidate();
    },
  });

  const deleteTodo = api.todo.delete.useMutation({
    onSuccess: () => {
      utils.todo.getAll.invalidate();
    },
  });

  const handleCreateTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      createTodo.mutate({ text: newTodo.trim() });
    }
  };

  const handleToggleTodo = (id: string, completed: boolean) => {
    updateTodo.mutate({ id, completed: !completed });
  };

  const handleDeleteTodo = (id: string) => {
    deleteTodo.mutate({ id });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Todo List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Todo List</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new todo */}
        <form onSubmit={handleCreateTodo} className="flex gap-2">
          <Input
            type="text"
            placeholder="Add a new todo..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            disabled={createTodo.isPending}
          />
          <Button type="submit" disabled={createTodo.isPending || !newTodo.trim()}>
            {createTodo.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </form>

        {/* Todo list */}
        <div className="space-y-2">
          {todos?.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No todos yet. Add one above!
            </p>
          ) : (
            todos?.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card"
              >
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={() => handleToggleTodo(todo.id, todo.completed)}
                  disabled={updateTodo.isPending}
                />
                <span
                  className={`flex-1 ${
                    todo.completed
                      ? "line-through text-muted-foreground"
                      : ""
                  }`}
                >
                  {todo.text}
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <time>
                    {new Date(todo.createdAt).toLocaleDateString()}
                  </time>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTodo(todo.id)}
                  disabled={deleteTodo.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}